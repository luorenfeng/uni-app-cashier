const DB_NAME = 'goods_store';
const DB_PATH = '_doc/goods_store.db';

let initPromise = null;
let dbReady = false;

function now() {
  return Date.now();
}

function padNumber(value) {
  return String(value).padStart(2, '0');
}

function escapeSql(value) {
  return String(value ?? '').replace(/'/g, "''");
}

function normalizePrice(value) {
  const numeric = Number.parseFloat(String(value ?? '').replace(/[^\d.]/g, ''));
  return Number.isFinite(numeric) && numeric >= 0 ? numeric.toFixed(2) : '0.00';
}

function normalizeQuantity(value) {
  const quantity = Number.parseInt(String(value ?? '1'), 10);
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
}

function createOrderNo(createdAt = now()) {
  const date = new Date(createdAt);
  const prefix = [
    date.getFullYear(),
    padNumber(date.getMonth() + 1),
    padNumber(date.getDate()),
    padNumber(date.getHours()),
    padNumber(date.getMinutes()),
    padNumber(date.getSeconds())
  ].join('');
  const suffix = Math.floor(Math.random() * 9000) + 1000;

  return `OD${prefix}${suffix}`;
}

function normalizeOrderItem(item = {}) {
  const price = normalizePrice(item.price);
  const quantity = normalizeQuantity(item.quantity);

  return {
    barcode: String(item.barcode || ''),
    name: String(item.name || ''),
    price,
    quantity,
    source: item.source || 'custom',
    lineTotal: (Number(price) * quantity).toFixed(2)
  };
}

function parseItems(items) {
  if (Array.isArray(items)) {
    return items;
  }

  if (typeof items === 'string') {
    try {
      return JSON.parse(items);
    } catch (error) {
      return [];
    }
  }

  return [];
}

function serializeOrderItems(items = []) {
  return items.map((item) => {
    const normalized = normalizeOrderItem(item);

    return {
      barcode: normalized.barcode,
      name: normalized.name,
      price: normalized.price,
      quantity: normalized.quantity,
      source: normalized.source
    };
  });
}

function normalizeOrder(record = {}) {
  const items = parseItems(record.items || record.items_json)
    .map(normalizeOrderItem)
    .filter((item) => item.barcode || item.name);
  const createdAt = Number(record.createdAt || record.created_at || now());
  const itemCount = Number.parseInt(String(record.itemCount ?? record.item_count ?? ''), 10);
  const computedCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = normalizePrice(
    record.totalPrice ??
      record.total_price ??
      items.reduce((sum, item) => sum + Number(item.lineTotal), 0)
  );

  return {
    orderNo: String(record.orderNo || record.order_no || createOrderNo(createdAt)),
    itemCount: Number.isFinite(itemCount) && itemCount > 0 ? itemCount : computedCount,
    totalPrice,
    items,
    createdAt
  };
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

async function createOrdersTable() {
  await executeSql(`
    CREATE TABLE IF NOT EXISTS orders (
      order_no TEXT PRIMARY KEY,
      item_count INTEGER NOT NULL,
      total_price TEXT NOT NULL,
      items_json TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )
  `);
}

async function saveAppPlusOrder(record) {
  const order = normalizeOrder(record);

  await executeSql(`
    INSERT OR REPLACE INTO orders (
      order_no, item_count, total_price, items_json, created_at
    ) VALUES (
      '${escapeSql(order.orderNo)}',
      ${order.itemCount},
      '${escapeSql(order.totalPrice)}',
      '${escapeSql(JSON.stringify(serializeOrderItems(order.items)))}',
      ${order.createdAt}
    )
  `);

  return order;
}

async function getAppPlusOrderList() {
  const rows = await selectSql(`
    SELECT order_no, item_count, total_price, items_json, created_at
    FROM orders
    ORDER BY created_at DESC, order_no DESC
  `);

  return (rows || []).map(normalizeOrder);
}

async function initAppPlusOrderStore() {
  await waitForPlusReady();
  await openDatabase();
  await createOrdersTable();
}

async function initOrderStore() {
  if (!initPromise) {
    initPromise = initAppPlusOrderStore().catch((error) => {
      initPromise = null;
      throw error;
    });
  }

  return initPromise;
}

export async function saveOrder(record) {
  await initOrderStore();
  return saveAppPlusOrder(record);
}

export async function getOrderList() {
  await initOrderStore();
  return getAppPlusOrderList();
}

export async function ensureOrderStoreReady() {
  await initOrderStore();
}
