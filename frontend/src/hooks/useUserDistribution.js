import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../api';

export default function useUserDistribution() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/organisation/user_summary/');
      setSummary(res.data);
    } catch (err) {
      setError(err);
      toast.error(err.response?.data?.detail || 'Failed to load user distribution summary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return { summary, loading, error, refetch: fetchSummary };
}
