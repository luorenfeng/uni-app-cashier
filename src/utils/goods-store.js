const LEGACY_STORAGE_KEY = 'custom_goods';
const SQLITE_MIGRATION_FLAG = 'goods_sqlite_migrated_v1';
const LEGACY_PRESET_CUSTOM_SEED_FLAG = 'custom_goods_preset_seeded_v1';
const SQLITE_PRESET_CUSTOM_SEED_FLAG = 'goods_sqlite_preset_seeded_v1';
const DB_NAME = 'goods_store';
const DB_PATH = '_doc/goods_store.db';

const BUILTIN_GOODS = [
  {
    barcode: '6921168511280',
    name: '农夫山泉饮用天然水 550ml',
    price: '2.00',
    image: '/static/goods/nongfu.png',
    source: 'builtin'
  },
  {
    barcode: '6925303711119',
    name: '百事可乐 330ml 易拉罐',
    price: '2.50',
    image: '/static/goods/kele.png',
    source: 'builtin'
  },
  {
    barcode: '6901285991219',
    name: '怡宝纯净水',
    price: '2.00',
    image: '/static/goods/yibao.png',
    source: 'builtin'
  },
  {
    barcode: '6914973604366',
    name: '德芙丝滑牛奶巧克力 43g',
    price: '8.00',
    image: '/static/goods/defu.png',
    source: 'builtin'
  },
  {
    barcode: '6902538004045',
    name: '脉动维生素饮料',
    price: '5.00',
    image: '/static/goods/maidong.jpg',
    source: 'builtin'
  }
];

const PRESET_CUSTOM_GOODS = [
  // 饮料冲调
  {
    barcode: '6902538004045',
    name: '脉动维生素饮料',
    price: '5.00',
    image: '/static/goods/maidong.jpg'
  },
  {
    barcode: '6901285991219',
    name: '怡宝纯净水',
    price: '2.00',
    image: '/static/goods/yibao.png'
  },
  {
    barcode: '6926475203149',
    name: '优乐美（原味）',
    price: '3.50',
    image: ''
  },
  {
    barcode: '6926475203170',
    name: '优乐美（香芋味）',
    price: '3.50',
    image: ''
  },
  {
    barcode: '6926475203187',
    name: '优乐美（草莓味）',
    price: '3.50',
    image: ''
  },

  // 日用品与烟品
  {
    barcode: '6901826817237',
    name: '南孚电池',
    price: '2.50',
    image: ''
  },
  {
    barcode: '6901028169677',
    name: '黄金叶',
    price: '13.00',
    image: ''
  },
  {
    barcode: '6901028095822',
    name: '黄果树',
    price: '15.00',
    image: ''
  },
  {
    barcode: '6928926003919',
    name: '茶倍健牙膏',
    price: '12.00',
    image: ''
  },

  // 面食速食
  {
    barcode: '6921555537510',
    name: '韩式火鸡面',
    price: '3.50',
    image: ''
  },
  {
    barcode: '6921555573914',
    name: '番茄牛肉面',
    price: '5.00',
    image: ''
  },
  {
    barcode: '6921555573907',
    name: '红烧牛肉面',
    price: '5.00',
    image: ''
  },
  {
    barcode: '6900873024285',
    name: '老坛酸菜牛肉面',
    price: '5.50',
    image: ''
  },
  {
    barcode: '6900873000371',
    name: '红烧牛肉面',
    price: '5.50',
    image: ''
  },
  {
    barcode: '6937962112196',
    name: '番茄鸡蛋牛肉面',
    price: '5.50',
    image: ''
  },
  {
    barcode: '6937962134617',
    name: '老母鸡汤面',
    price: '5.00',
    image: ''
  },
  {
    barcode: '6937962111526',
    name: '老坛酸菜牛肉面',
    price: '5.00',
    image: ''
  },
  {
    barcode: '6921555525098',
    name: '刀削宽面',
    price: '5.00',
    image: ''
  },
  {
    barcode: '6900873714070',
    name: '老坛酸菜牛肉面',
    price: '5.00',
    image: ''
  },
  {
    barcode: '6900873714131',
    name: '红烧牛肉面',
    price: '3.50',
    image: ''
  },
  {
    barcode: '6937962112134',
    name: '番茄鸡蛋牛肉面',
    price: '3.50',
    image: ''
  },
  {
    barcode: '6937962114701',
    name: '葱香排骨面',
    price: '3.50',
    image: ''
  },
  {
    barcode: '6925303796204',
    name: '香辣牛肉面',
    price: '3.50',
    image: ''
  },
  {
    barcode: '6921555579121',
    name: '老母鸡汤面',
    price: '3.50',
    image: ''
  },
  {
    barcode: '6921555579145',
    name: '辣牛肉汤面',
    price: '3.50',
    image: ''
  },
  {
    barcode: '6937962114664',
    name: '红烧牛肉面',
    price: '3.50',
    image: ''
  },
  {
    barcode: '6900873714339',
    name: '香辣牛肉面',
    price: '3.50',
    image: ''
  },
  {
    barcode: '6935270641865',
    name: '老母鸡汤面',
    price: '3.00',
    image: ''
  },
  {
    barcode: '6937962134440',
    name: '萝卜炖牛腩面',
    price: '3.00',
    image: ''
  },
  {
    barcode: '6900893061062',
    name: '红烧牛肉面',
    price: '3.00',
    image: ''
  },
  {
    barcode: '6921555521267',
    name: '原味挂面',
    price: '7.00',
    image: ''
  },
  {
    barcode: '6921555580691',
    name: '手打挂面',
    price: '7.00',
    image: ''
  },
  {
    barcode: '6937962000103',
    name: '金汤肥牛面',
    price: '3.50',
    image: ''
  },
  {
    barcode: '6935270649779',
    name: '金汤肥牛面',
    price: '3.00',
    image: ''
  },
  {
    barcode: '6921555579169',
    name: '老母鸡汤面',
    price: '3.50',
    image: ''
  },
  {
    barcode: '6937962112158',
    name: '番茄鸡蛋牛肉面',
    price: '3.50',
    image: ''
  },

  // 糖类干货
  {
    barcode: '6974232270095',
    name: '冰糖',
    price: '6.50',
    image: ''
  },
  {
    barcode: '6934438395046',
    name: '单晶体冰糖',
    price: '4.00',
    image: ''
  },
  {
    barcode: '6974232270088',
    name: '冰片糖',
    price: '6.50',
    image: ''
  },

  // 休闲零食
  {
    barcode: '6924743918238',
    name: '乐事',
    price: '5.00',
    image: ''
  },
  {
    barcode: '6924743935426',
    name: '大波浪薯片',
    price: '6.50',
    image: ''
  },
  {
    barcode: '6924743922570',
    name: '乐事（青柠味）',
    price: '6.50',
    image: ''
  },
  {
    barcode: '6924743918610',
    name: '大波浪薯片（铁板鱿鱼味）',
    price: '6.50',
    image: ''
  },
  {
    barcode: '6924746467924',
    name: '大波浪薯片（经典原味）',
    price: '6.50',
    image: ''
  },
  {
    barcode: '6924743935464',
    name: '乐事（韩式泡菜味）',
    price: '6.50',
    image: ''
  },
  {
    barcode: '6920912342002',
    name: '盼盼（烧烤牛排味）',
    price: '6.00',
    image: ''
  },
  {
    barcode: '6924743926752',
    name: '乐事（墨西哥鸡汁番茄味）',
    price: '12.00',
    image: ''
  },
  {
    barcode: '6924743926776',
    name: '大波浪薯片（香脆烤鸡翅味）',
    price: '12.00',
    image: ''
  },
  {
    barcode: '6924743926721',
    name: '乐事（经典原味）',
    price: '12.00',
    image: ''
  },
  {
    barcode: '6924743915831',
    name: '乐事（黑椒牛扒味）',
    price: '8.50',
    image: ''
  },
  {
    barcode: '6924743926622',
    name: '乐事（黑胡椒味）',
    price: '8.50',
    image: ''
  },
  {
    barcode: '6924743926653',
    name: '乐事（香辣小龙虾味）',
    price: '8.50',
    image: ''
  },
  {
    barcode: '6924743918313',
    name: '大波浪薯片（铁板鱿鱼味）',
    price: '6.50',
    image: ''
  },
  {
    barcode: '6924743923270',
    name: '山药薄片（香烤鸡翅味）',
    price: '6.50',
    image: ''
  }
];

let initPromise = null;
let dbReady = false;

function normalizeGoods(record = {}) {
  return {
    barcode: String(record.barcode || ''),
    name: String(record.name || ''),
    price: String(record.price || ''),
    image: String(record.image || ''),
    source: record.source || 'custom'
  };
}

function now() {
  return Date.now();
}

function getLegacyGoodsObject() {
  return uni.getStorageSync(LEGACY_STORAGE_KEY) || {};
}

function setLegacyGoodsObject(goods) {
  uni.setStorageSync(LEGACY_STORAGE_KEY, goods);
}

function getLegacyCustomGoodsList() {
  const goods = getLegacyGoodsObject();
  return Object.keys(goods).map((barcode) => normalizeGoods({
    barcode,
    ...goods[barcode],
    source: 'custom'
  }));
}

function getLegacyGoodsByBarcode(barcode) {
  const customGoods = getLegacyGoodsObject();
  if (customGoods[barcode]) {
    return normalizeGoods({
      barcode,
      ...customGoods[barcode],
      source: 'custom'
    });
  }

  const builtin = BUILTIN_GOODS.find((item) => item.barcode === barcode);
  return builtin ? normalizeGoods(builtin) : null;
}

function saveLegacyGoods(record) {
  const goods = getLegacyGoodsObject();
  goods[record.barcode] = {
    name: record.name,
    price: record.price,
    image: record.image
  };
  setLegacyGoodsObject(goods);
}

function deleteLegacyGoods(barcode) {
  const goods = getLegacyGoodsObject();
  delete goods[barcode];
  setLegacyGoodsObject(goods);
}

function getPresetCustomGoodsObject() {
  return PRESET_CUSTOM_GOODS.reduce((goods, item) => {
    goods[item.barcode] = {
      name: item.name,
      price: item.price,
      image: item.image || ''
    };
    return goods;
  }, {});
}

function seedLegacyPresetCustomGoods() {
  if (uni.getStorageSync(LEGACY_PRESET_CUSTOM_SEED_FLAG)) {
    return;
  }

  const presetGoods = getPresetCustomGoodsObject();
  const existingGoods = getLegacyGoodsObject();

  setLegacyGoodsObject({
    ...presetGoods,
    ...existingGoods
  });

  uni.setStorageSync(LEGACY_PRESET_CUSTOM_SEED_FLAG, 1);
}

// #ifdef APP-PLUS
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

function openDatabase() {
  return new Promise((resolve, reject) => {
    plus.sqlite.openDatabase({
      name: DB_NAME,
      path: DB_PATH,
      success: () => {
        dbReady = true;
        resolve();
      },
      fail: (error) => {
        const message = String((error && error.message) || error);
        if (message.includes('already opened')) {
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
      image TEXT DEFAULT '',
      source TEXT DEFAULT 'custom',
      updated_at INTEGER DEFAULT 0
    )
  `);
}

async function upsertGoodsRecord(record) {
  const item = normalizeGoods(record);
  await executeSql(`
    INSERT OR REPLACE INTO goods (
      barcode, name, price, image, source, updated_at
    ) VALUES (
      '${escapeSql(item.barcode)}',
      '${escapeSql(item.name)}',
      '${escapeSql(item.price)}',
      '${escapeSql(item.image)}',
      '${escapeSql(item.source)}',
      ${now()}
    )
  `);
}

async function seedBuiltinGoods() {
  for (const item of BUILTIN_GOODS) {
    await executeSql(`
      INSERT OR IGNORE INTO goods (
        barcode, name, price, image, source, updated_at
      ) VALUES (
        '${escapeSql(item.barcode)}',
        '${escapeSql(item.name)}',
        '${escapeSql(item.price)}',
        '${escapeSql(item.image)}',
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

  const rows = await selectSql(`
    SELECT barcode, source
    FROM goods
  `);
  const sourceByBarcode = new Map(
    (rows || []).map((item) => [String(item.barcode), String(item.source || '')])
  );

  for (const item of PRESET_CUSTOM_GOODS) {
    if (sourceByBarcode.get(item.barcode) === 'custom') {
      continue;
    }

    await upsertGoodsRecord({
      ...item,
      source: 'custom'
    });
  }

  uni.setStorageSync(SQLITE_PRESET_CUSTOM_SEED_FLAG, 1);
}

async function migrateLegacyCustomGoods() {
  if (uni.getStorageSync(SQLITE_MIGRATION_FLAG)) {
    return;
  }

  const legacyGoods = getLegacyCustomGoodsList();
  for (const item of legacyGoods) {
    await upsertGoodsRecord({
      ...item,
      source: 'custom'
    });
  }

  uni.setStorageSync(SQLITE_MIGRATION_FLAG, 1);
  uni.removeStorageSync(LEGACY_STORAGE_KEY);
}

async function initAppPlusStore() {
  await waitForPlusReady();
  await openDatabase();
  await createGoodsTable();
  await seedAppPlusPresetCustomGoods();
  await seedBuiltinGoods();
  await migrateLegacyCustomGoods();
}

async function getAppPlusGoodsByBarcode(barcode) {
  const rows = await selectSql(`
    SELECT barcode, name, price, image, source
    FROM goods
    WHERE barcode = '${escapeSql(barcode)}'
    LIMIT 1
  `);

  return rows && rows[0] ? normalizeGoods(rows[0]) : null;
}

async function getAppPlusCustomGoodsList() {
  const rows = await selectSql(`
    SELECT barcode, name, price, image, source
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
  await executeSql(`
    DELETE FROM goods
    WHERE barcode = '${escapeSql(barcode)}'
      AND source = 'custom'
  `);
}
// #endif

async function initH5Store() {
  seedLegacyPresetCustomGoods();
  return Promise.resolve();
}

async function initGoodsStore() {
  if (!initPromise) {
    // #ifdef APP-PLUS
    initPromise = initAppPlusStore().catch((error) => {
      initPromise = null;
      throw error;
    });
    // #endif

    // #ifndef APP-PLUS
    initPromise = initH5Store();
    // #endif
  }

  return initPromise;
}

export async function getGoodsByBarcode(barcode) {
  await initGoodsStore();

  // #ifdef APP-PLUS
  if (dbReady) {
    return getAppPlusGoodsByBarcode(barcode);
  }
  // #endif

  return getLegacyGoodsByBarcode(barcode);
}

export async function getCustomGoodsList() {
  await initGoodsStore();

  // #ifdef APP-PLUS
  if (dbReady) {
    return getAppPlusCustomGoodsList();
  }
  // #endif

  return getLegacyCustomGoodsList();
}

export async function saveGoods(record) {
  const item = normalizeGoods(record);
  await initGoodsStore();

  // #ifdef APP-PLUS
  if (dbReady) {
    await saveAppPlusGoods(item);
    return;
  }
  // #endif

  saveLegacyGoods(item);
}

export async function deleteGoods(barcode) {
  const normalizedBarcode = String(barcode || '').trim();

  if (!normalizedBarcode) {
    return;
  }

  await initGoodsStore();

  // #ifdef APP-PLUS
  if (dbReady) {
    await deleteAppPlusGoods(normalizedBarcode);
    return;
  }
  // #endif

  deleteLegacyGoods(normalizedBarcode);
}

export async function ensureGoodsStoreReady() {
  await initGoodsStore();
}
