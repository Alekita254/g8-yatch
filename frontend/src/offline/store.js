const DB_NAME = 'g8-yacht-offline';
const DB_VERSION = 1;
const RESPONSE_STORE = 'responses';
const MUTATION_STORE = 'mutations';

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB is not available in this browser.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(RESPONSE_STORE)) {
        db.createObjectStore(RESPONSE_STORE, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(MUTATION_STORE)) {
        const store = db.createObjectStore(MUTATION_STORE, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt');
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transaction(storeName, mode, callback) {
  return openDatabase().then((db) => new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const result = callback(store);

    tx.oncomplete = () => {
      db.close();
      resolve(result);
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  }));
}

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function apiCacheKey(config) {
  const baseUrl = config.baseURL || window.location.origin;
  const url = new URL(config.url, baseUrl);
  Object.entries(config.params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });
  return url.pathname + url.search;
}

export async function cacheApiResponse(key, data) {
  try {
    await transaction(RESPONSE_STORE, 'readwrite', (store) => store.put({
      key,
      data,
      savedAt: new Date().toISOString(),
    }));
  } catch {
    // Offline cache is a convenience layer; API calls should not fail because it is unavailable.
  }
}

export async function getCachedApiResponse(key) {
  try {
    const record = await transaction(RESPONSE_STORE, 'readonly', (store) => requestToPromise(store.get(key)));
    return record || null;
  } catch {
    return null;
  }
}

export async function queueMutation(config) {
  const queued = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    method: String(config.method || 'get').toLowerCase(),
    url: config.url,
    baseURL: config.baseURL,
    data: config.data,
    params: config.params,
    headers: config.headers,
    createdAt: new Date().toISOString(),
  };

  await transaction(MUTATION_STORE, 'readwrite', (store) => store.put(queued));
  window.dispatchEvent(new CustomEvent('g8-offline-queue-changed'));
  return queued;
}

export async function listQueuedMutations() {
  try {
    return await transaction(MUTATION_STORE, 'readonly', (store) => requestToPromise(store.getAll()));
  } catch {
    return [];
  }
}

export async function removeQueuedMutation(id) {
  await transaction(MUTATION_STORE, 'readwrite', (store) => store.delete(id));
  window.dispatchEvent(new CustomEvent('g8-offline-queue-changed'));
}
