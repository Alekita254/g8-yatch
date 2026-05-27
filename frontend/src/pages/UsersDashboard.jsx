import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setAuthToken } from '../api';
import api from '../api';
import { toast } from 'react-hot-toast';
import { Users, Loader2, AlertCircle, Plus } from 'lucide-react';
import UserDistributionSummary from '../components/UserDistributionSummary';

/**
 * UsersDashboard – a high‑level overview of all users in the system.
 * Shows total user count, recent sign‑ups and simple analytics.
 * This page lives at `/users` while the organisation‑specific members view
 * remains at `/users/members`.
 */
export default function UsersDashboard() {
  const navigate = useNavigate();
  const [totalUsers, setTotalUsers] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) setAuthToken(token);
      const res = await api.get('/api/organisation/user_summary/');
      // backend currently returns `total_users`; accept either key for compatibility
      setTotalUsers(res.data.total ?? res.data.total_users ?? 0);
      // ensure `recent` is always an array to avoid runtime errors when backend doesn't provide it
      setRecent(Array.isArray(res.data.recent) ? res.data.recent : []);
    } catch (err) {
      setError(err);
      toast.error(err.response?.data?.detail || 'Failed to load user summary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-12 h-12 text-brand-500 animate-spin" />
        <p className="text-sm font-bold text-app-muted animate-pulse">Loading user dashboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-lg font-bold text-app-text">
          {error.response?.status === 401
            ? 'Authentication required. Please log in.'
            : 'Unable to load user data.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="glass rounded-[2rem] p-8 border-app-border/40 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-6">
          <Users className="w-12 h-12 text-brand-500" />
          <div>
            <h2 className="text-2xl font-black text-app-text">User Dashboard</h2>
            <p className="text-xs text-app-muted">Overview of all platform users across organisations.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/users/members')}
          className="inline-flex items-center gap-2 px-4 py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700"
        >
          <Plus className="w-4 h-4" />
          View Members
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass rounded-xl p-6 bg-brand-500/5 border border-brand-500/10">
          <h3 className="text-sm font-semibold text-app-muted uppercase">Total Users</h3>
          <p className="text-3xl font-black text-app-text mt-2">{totalUsers}</p>
        </div>
        {/* Additional summary cards can be added here */}
      </div>

      <UserDistributionSummary />

      {/* Recent sign‑ups */}
      <div className="glass rounded-xl p-6 border-app-border/40">
        <h3 className="text-sm font-semibold text-app-muted uppercase mb-4">Recent Sign‑ups</h3>
        {recent.length === 0 ? (
          <p className="text-app-muted">No recent activity.</p>
        ) : (
          <ul className="space-y-2">
            {recent.map((u) => (
              <li key={u.id} className="flex items-center justify-between">
                <span className="text-sm text-app-text">{u.email}</span>
                <span className="text-xs text-app-muted">{new Date(u.created_at).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
