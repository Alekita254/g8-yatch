import { useState, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import api from '../api';

export default function useStats(isAuthenticated) {
  const auth = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    if (!isAuthenticated || !auth.user?.access_token) return;
    try {
      setLoading(true);
      const response = await api.get('/api/tenders/stats/');
      setStats(response.data);
    } catch (err) {
      console.error("Failed to fetch dashboard metrics:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, auth.user]);

  return {
    stats,
    loading,
    error,
    refreshStats: fetchStats
  };
}
