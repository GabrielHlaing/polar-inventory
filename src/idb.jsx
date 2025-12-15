// src/idb.js
const DB_NAME = "polar-inventory-db";
const DB_VERSION = 5;

const STORE_NAMES = {
  INVENTORY: "inventory",
  INVOICES: "invoices",
  SYNC_QUEUE: "sync_queue",
  CART: "cart",
  HISTORY_CACHE: "history_cache",
};

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (evt) => {
      const db = evt.target.result;

      const stores = [
        { name: STORE_NAMES.INVENTORY, keyPath: "id" },
        { name: STORE_NAMES.INVOICES, keyPath: "id" },
        { name: STORE_NAMES.SYNC_QUEUE, keyPath: "queueId" },
        { name: STORE_NAMES.CART, keyPath: "id" },
        { name: STORE_NAMES.HISTORY_CACHE, keyPath: "month" },
      ];

      stores.forEach((s) => {
        if (!db.objectStoreNames.contains(s.name)) {
          db.createObjectStore(s.name, { keyPath: s.keyPath });
        }
      });
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ----------------------------
// Basic CRUD helpers
// ----------------------------
export async function idbPut(storeName, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    tx.objectStore(storeName).put(value);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

export async function idbGet(storeName, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const r = tx.objectStore(storeName).get(key);
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

export async function idbGetAll(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const r = tx.objectStore(storeName).getAll();
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

export async function idbDelete(storeName, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    tx.objectStore(storeName).delete(key);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

export async function idbClear(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    tx.objectStore(storeName).clear();
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

// ----------------------------
// Utility: Count store items
// ----------------------------
export async function idbCount(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const r = db
      .transaction(storeName, "readonly")
      .objectStore(storeName)
      .count();
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

export { STORE_NAMES };
