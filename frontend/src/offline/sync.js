import { listQueuedMutations, removeQueuedMutation } from './store';

let isSyncing = false;

export async function syncQueuedMutations(api) {
  if (isSyncing || !navigator.onLine) return { synced: 0, failed: 0 };

  isSyncing = true;
  let synced = 0;
  let failed = 0;

  try {
    const queued = await listQueuedMutations();
    for (const item of queued) {
      try {
        await api.request({
          method: item.method,
          url: item.url,
          baseURL: item.baseURL,
          data: item.data,
          params: item.params,
          headers: item.headers,
          offlineQueue: false,
        });
        await removeQueuedMutation(item.id);
        synced += 1;
      } catch {
        failed += 1;
        break;
      }
    }
  } finally {
    isSyncing = false;
  }

  return { synced, failed };
}
