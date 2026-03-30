import { BUILTIN_GOODS, PRESET_CUSTOM_GOODS } from '../data/preset-goods';

const SQLITE_PRESET_CUSTOM_SEED_FLAG = 'goods_sqlite_preset_seeded_v4';
const GOODS_STORE_RESET_FLAG = 'goods_store_reset_v3';
const DB_NAME = 'goods_store';
const DB_PATH = '_doc/goods_store.db';

let initPromise = null;
let dbReady = false;

function normalizeGoods(record = {}) {
  return {
    barcode: String(record.barcode || ''),
    name: String(record.name || ''),
    price: String(record.price || ''),
    source: record.source || 'custom'
  };
}

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

async function resetAppPlusGoodsStoreIfNeeded() {
  if (uni.getStorageSync(GOODS_STORE_RESET_FLAG)) {
    return;
  }

  await executeSql(`
    DELETE FROM goods
  `);

  uni.removeStorageSync(SQLITE_PRESET_CUSTOM_SEED_FLAG);
  uni.removeStorageSync('custom_goods');
  uni.removeStorageSync('custom_goods_preset_seeded_v1');
  uni.removeStorageSync('custom_goods_preset_seeded_v2');
  uni.removeStorageSync('goods_sqlite_migrated_v1');
  uni.setStorageSync(GOODS_STORE_RESET_FLAG, 1);
}

async function upsertGoodsRecord(record) {
  const item = normalizeGoods(record);
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
    await executeSql(`
      INSERT OR IGNORE INTO goods (
        barcode, name, price, source, updated_at
      ) VALUES (
        '${escapeSql(item.barcode)}',
        '${escapeSql(item.name)}',
        '${escapeSql(item.price)}',
        'builtin',
        ${now()}
      )
    `);
  }
}

async function seedAppPlusPresetCustomGoods() {
  if (uni.getStorageSync(SQLITE_PRESET_CUSTOM_SEED_FLAG)) {
    return;
  }

  for (const item of PRESET_CUSTOM_GOODS) {
    await upsertGoodsRecord({
      ...item,
      source: 'custom'
    });
  }

  uni.setStorageSync(SQLITE_PRESET_CUSTOM_SEED_FLAG, 1);
}

async function initAppPlusStore() {
  await waitForPlusReady();
  await openDatabase();
  await createGoodsTable();
  await migrateGoodsTableIfNeeded();
  await resetAppPlusGoodsStoreIfNeeded();
  await seedAppPlusPresetCustomGoods();
  await seedBuiltinGoods();
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

async function getAppPlusCustomGoodsList() {
  const rows = await selectSql(`
    SELECT barcode, name, price, source
    FROM goods
    WHERE source = 'custom'
    ORDER BY updated_at DESC, barcode DESC
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

export async function getCustomGoodsList() {
  await initGoodsStore();
  return getAppPlusCustomGoodsList();
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
