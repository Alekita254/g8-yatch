import { useCallback, useEffect, useState } from 'react';

import { loadTokens } from '../services/authService';
import { fetchAdminSummary } from '../services/adminSummaryService';
import type { AdminSummary } from '../types/adminSummary';

interface UseAdminSummaryResult {
  summary: AdminSummary | null;
  isLoading: boolean;
  loadError: string | null;
  refreshSummary: () => Promise<void>;
}

export function useAdminSummary(): UseAdminSummaryResult {
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refreshSummary = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const tokens = await loadTokens();
      if (!tokens?.accessToken) {
        throw new Error('Missing access token.');
      }

      const payload = await fetchAdminSummary(tokens.accessToken);
      setSummary(payload);
    } catch {
      setLoadError('Unable to load admin summary. Pull to retry after network is stable.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshSummary();
  }, [refreshSummary]);

  return {
    summary,
    isLoading,
    loadError,
    refreshSummary,
  };
}
