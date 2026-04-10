import { BUILTIN_GOODS, PRESET_CUSTOM_GOODS } from '../data/preset-goods';

const PRESET_GOODS_SYNC_STORAGE_KEY = 'goods_preset_sync_version';
const PRESET_GOODS_SYNC_VERSION = 'v1';
const LEGACY_GOODS_STORAGE_KEYS = [
  'goods_sqlite_preset_seeded_v4',
  'goods_store_reset_v3',
  'custom_goods',
  'custom_goods_preset_seeded_v1',
  'custom_goods_preset_seeded_v2',
  'goods_sqlite_migrated_v1'
];
const DB_NAME = 'goods_store';
const DB_PATH = '_doc/goods_store.db';

let initPromise = null;
let dbReady = false;

function normalizeGoodsSource(source) {
  if (source === 'builtin' || source === 'preset' || source === 'custom') {
    return source;
  }

  return 'custom';
}

function normalizeGoodsPrice(value) {
  const raw = String(value ?? '').trim();

  if (!raw) {
    return '';
  }

  const parsed = Number.parseFloat(raw.replace(/[^\d.]/g, ''));
  return Number.isFinite(parsed) ? parsed.toFixed(2) : raw;
}

function normalizeGoods(record = {}) {
  return {
    barcode: String(record.barcode || '').trim(),
    name: String(record.name || '').trim(),
    price: normalizeGoodsPrice(record.price),
    source: normalizeGoodsSource(record.source)
  };
}

function isSameGoodsRecord(left, right) {
  const leftItem = normalizeGoods(left);
  const rightItem = normalizeGoods(right);
  return leftItem.barcode === rightItem.barcode
    && leftItem.name === rightItem.name
    && leftItem.price === rightItem.price;
}

const NORMALIZED_PRESET_GOODS = PRESET_CUSTOM_GOODS
  .map((item) => normalizeGoods({ ...item, source: 'preset' }))
  .filter((item) => item.barcode);

const PRESET_GOODS_MAP = new Map(
  NORMALIZED_PRESET_GOODS.map((item) => [item.barcode, item])
);

function now() {
  return Date.now();
}

function waitForPlusReady() {
  return new Promise((resolve) => {
    if (typeof plus !== 'undefined') {
      resolve();
      return;
    }

    const onReady = () => {
      document.removeEventListener('plusready', onReady);
      resolve();
    };

    document.addEventListener('plusready', onReady, false);
  });
}

function isDatabaseOpen() {
  try {
    return plus.sqlite.isOpenDatabase({
      name: DB_NAME,
      path: DB_PATH
    });
  } catch (error) {
    return false;
  }
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (dbReady || isDatabaseOpen()) {
      dbReady = true;
      resolve();
      return;
    }

    plus.sqlite.openDatabase({
      name: DB_NAME,
      path: DB_PATH,
      success: () => {
        dbReady = true;
        resolve();
      },
      fail: (error) => {
        const message = String((error && error.message) || error).toLowerCase();
        if (message.includes('already open') || message.includes('already opened')) {
          dbReady = true;
          resolve();
          return;
        }
        reject(error);
      }
    });
  });
}

function executeSql(sql) {
  return new Promise((resolve, reject) => {
    plus.sqlite.executeSql({
      name: DB_NAME,
      sql,
      success: resolve,
      fail: reject
    });
  });
}

function selectSql(sql) {
  return new Promise((resolve, reject) => {
    plus.sqlite.selectSql({
      name: DB_NAME,
      sql,
      success: resolve,
      fail: reject
    });
  });
}

function escapeSql(value) {
  return String(value ?? '').replace(/'/g, "''");
}

function clearLegacyGoodsStorageFlags() {
  LEGACY_GOODS_STORAGE_KEYS.forEach((key) => {
    uni.removeStorageSync(key);
  });
}

async function createGoodsTable() {
  await executeSql(`
    CREATE TABLE IF NOT EXISTS goods (
      barcode TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price TEXT NOT NULL,
      source TEXT DEFAULT 'custom',
      updated_at INTEGER DEFAULT 0
    )
  `);
}

async function migrateGoodsTableIfNeeded() {
  const columns = await selectSql(`
    PRAGMA table_info(goods)
  `);
  const hasImageColumn = (columns || []).some((column) => String(column?.name || '') === 'image');

  if (!hasImageColumn) {
    return;
  }

  await executeSql(`
    BEGIN TRANSACTION
  `);

  try {
    await executeSql(`
      DROP TABLE IF EXISTS goods_next
    `);
    await executeSql(`
      CREATE TABLE goods_next (
        barcode TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        price TEXT NOT NULL,
        source TEXT DEFAULT 'custom',
        updated_at INTEGER DEFAULT 0
      )
    `);
    await executeSql(`
      INSERT INTO goods_next (barcode, name, price, source, updated_at)
      SELECT
        barcode,
        name,
        price,
        COALESCE(source, 'custom'),
        COALESCE(updated_at, 0)
      FROM goods
    `);
    await executeSql(`
      DROP TABLE goods
    `);
    await executeSql(`
      ALTER TABLE goods_next RENAME TO goods
    `);
    await executeSql(`
      COMMIT
    `);
  } catch (error) {
    try {
      await executeSql(`
        ROLLBACK
      `);
    } catch (rollbackError) {
      // Ignore rollback failures and preserve the original migration error.
    }

    throw error;
  }
}

async function upsertGoodsRecord(record) {
  const item = normalizeGoods(record);

  if (!item.barcode) {
    return;
  }

  await executeSql(`
    INSERT OR REPLACE INTO goods (
      barcode, name, price, source, updated_at
    ) VALUES (
      '${escapeSql(item.barcode)}',
      '${escapeSql(item.name)}',
      '${escapeSql(item.price)}',
      '${escapeSql(item.source)}',
      ${now()}
    )
  `);
}

async function seedBuiltinGoods() {
  for (const item of BUILTIN_GOODS) {
    const normalizedItem = normalizeGoods({
      ...item,
      source: 'builtin'
    });

    if (!normalizedItem.barcode) {
      continue;
    }

    await executeSql(`
      INSERT OR IGNORE INTO goods (
        barcode, name, price, source, updated_at
      ) VALUES (
        '${escapeSql(normalizedItem.barcode)}',
        '${escapeSql(normalizedItem.name)}',
        '${escapeSql(normalizedItem.price)}',
        'builtin',
        ${now()}
      )
    `);
  }
}

async function getAllGoodsRows() {
  const rows = await selectSql(`
    SELECT barcode, name, price, source
    FROM goods
  `);

  return (rows || []).map(normalizeGoods);
}

async function syncPresetGoodsIfNeeded() {
  if (uni.getStorageSync(PRESET_GOODS_SYNC_STORAGE_KEY) === PRESET_GOODS_SYNC_VERSION) {
    return;
  }

  const existingRows = await getAllGoodsRows();
  const existingMap = new Map(existingRows.map((item) => [item.barcode, item]));
  const presetBarcodes = new Set(NORMALIZED_PRESET_GOODS.map((item) => item.barcode));

  for (const row of existingRows) {
    if (row.source !== 'preset' || presetBarcodes.has(row.barcode)) {
      continue;
    }

    await executeSql(`
      DELETE FROM goods
      WHERE barcode = '${escapeSql(row.barcode)}'
        AND source = 'preset'
    `);
  }

  for (const presetItem of NORMALIZED_PRESET_GOODS) {
    const existingItem = existingMap.get(presetItem.barcode);

    if (existingItem?.source === 'custom' && !isSameGoodsRecord(existingItem, presetItem)) {
      continue;
    }

    await upsertGoodsRecord(presetItem);
  }

  clearLegacyGoodsStorageFlags();
  uni.setStorageSync(PRESET_GOODS_SYNC_STORAGE_KEY, PRESET_GOODS_SYNC_VERSION);
}

async function initAppPlusStore() {
  await waitForPlusReady();
  await openDatabase();
  await createGoodsTable();
  await migrateGoodsTableIfNeeded();
  await seedBuiltinGoods();
  await syncPresetGoodsIfNeeded();
}

async function getAppPlusGoodsByBarcode(barcode) {
  const rows = await selectSql(`
    SELECT barcode, name, price, source
    FROM goods
    WHERE barcode = '${escapeSql(barcode)}'
    LIMIT 1
  `);

  return rows && rows[0] ? normalizeGoods(rows[0]) : null;
}

async function getAppPlusGoodsList() {
  const rows = await selectSql(`
    SELECT barcode, name, price, source
    FROM goods
    ORDER BY
      CASE source
        WHEN 'custom' THEN 0
        WHEN 'preset' THEN 1
        ELSE 2
      END,
      updated_at DESC,
      barcode DESC
  `);

  return (rows || []).map(normalizeGoods);
}

async function saveAppPlusGoods(record) {
  await upsertGoodsRecord({
    ...record,
    source: 'custom'
  });
}

async function deleteAppPlusGoods(barcode) {
  const existing = await getAppPlusGoodsByBarcode(barcode);

  if (!existing || existing.source !== 'custom') {
    return false;
  }

  const presetItem = PRESET_GOODS_MAP.get(barcode);

  if (presetItem) {
    await upsertGoodsRecord(presetItem);
    return true;
  }

  await executeSql(`
    DELETE FROM goods
    WHERE barcode = '${escapeSql(barcode)}'
      AND source = 'custom'
  `);
  return true;
}

async function initGoodsStore() {
  if (!initPromise) {
    initPromise = initAppPlusStore().catch((error) => {
      initPromise = null;
      throw error;
    });
  }

  return initPromise;
}

export async function getGoodsByBarcode(barcode) {
  await initGoodsStore();
  return getAppPlusGoodsByBarcode(barcode);
}

export async function getGoodsList() {
  await initGoodsStore();
  return getAppPlusGoodsList();
}

export async function saveGoods(record) {
  const item = normalizeGoods(record);
  await initGoodsStore();
  await saveAppPlusGoods(item);
}

export async function deleteGoods(barcode) {
  const normalizedBarcode = String(barcode || '').trim();

  if (!normalizedBarcode) {
    return false;
  }

  await initGoodsStore();
  return deleteAppPlusGoods(normalizedBarcode);
}

export async function ensureGoodsStoreReady() {
  await initGoodsStore();
}
