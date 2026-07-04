import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, CloudOff, RefreshCw } from 'lucide-react';

import api from '../api';
import { listQueuedMutations } from '../offline/store';
import { syncQueuedMutations } from '../offline/sync';

export default function NetworkSyncIndicator() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [queuedCount, setQueuedCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);

  const refreshQueueCount = useCallback(async () => {
    const queued = await listQueuedMutations();
    setQueuedCount(queued.length);
  }, []);

  const runSync = useCallback(async () => {
    if (!navigator.onLine) return;
    setSyncing(true);
    const result = await syncQueuedMutations(api);
    await refreshQueueCount();
    if (result.synced > 0) setLastSyncedAt(new Date());
    setSyncing(false);
  }, [refreshQueueCount]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      runSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('g8-offline-queue-changed', refreshQueueCount);
    refreshQueueCount();
    if (navigator.onLine) runSync();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('g8-offline-queue-changed', refreshQueueCount);
    };
  }, [refreshQueueCount, runSync]);

  if (isOnline && queuedCount === 0 && !lastSyncedAt) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[min(calc(100%-2rem),28rem)] -translate-x-1/2 rounded-lg border border-app-border bg-app-card px-4 py-3 text-sm shadow-xl">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${isOnline ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
            {isOnline ? <CheckCircle2 className="h-5 w-5" /> : <CloudOff className="h-5 w-5" />}
          </div>
          <div className="min-w-0">
            <p className="font-black text-app-text">
              {isOnline ? 'Online' : 'Offline mode'}
            </p>
            <p className="truncate text-xs font-bold text-app-muted">
              {queuedCount > 0
                ? `${queuedCount} change${queuedCount === 1 ? '' : 's'} waiting to sync`
                : lastSyncedAt
                  ? `Synced ${lastSyncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : 'Cached screens remain available'}
            </p>
          </div>
        </div>
        {isOnline && queuedCount > 0 ? (
          <button
            type="button"
            onClick={runSync}
            disabled={syncing}
            className="inline-flex items-center gap-2 rounded-md border border-app-border px-3 py-2 text-xs font-black uppercase text-app-text transition hover:border-brand-500 hover:text-brand-500 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            Sync
          </button>
        ) : null}
      </div>
    </div>
  );
}
