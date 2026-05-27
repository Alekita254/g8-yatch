import React from 'react';
import { Users, UserCheck, UserX, Loader2, AlertCircle } from 'lucide-react';
import StatCard from './StatCard';
import useUserDistribution from '../hooks/useUserDistribution';

export default function UserDistributionSummary() {
  const { summary, loading, error } = useUserDistribution();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
        <p className="text-sm text-app-muted">Loading distribution…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
        <AlertCircle className="w-5 h-5 text-red-500" />
        <p className="text-sm text-red-600">Failed to load user distribution</p>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  const roleColors = {
    ADMIN: 'emerald',
    COMPANY: 'blue',
    NORMAL: 'amber'
  };

  return (
    <div className="space-y-6">
      <div className="glass rounded-[2rem] p-8 border-app-border/40">
        <h3 className="text-lg font-black text-app-text mb-6">User Distribution</h3>
        
        {/* Total Users Card */}
        <div className="mb-6">
          <StatCard
            icon={Users}
            label="Total Users"
            value={summary.total_users}
            color="emerald"
          />
        </div>

        {/* Role Breakdown */}
        <div className="mb-6">
          <p className="text-xs font-bold text-app-muted uppercase mb-4 tracking-wider">By Role</p>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(summary.by_role).map(([role, count]) => (
              <StatCard
                key={role}
                icon={Users}
                label={role}
                value={count}
                color={roleColors[role] || 'blue'}
              />
            ))}
          </div>
        </div>

        {/* Status Breakdown */}
        <p className="text-xs font-bold text-app-muted uppercase mb-4 tracking-wider">By Status</p>
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            icon={UserCheck}
            label="Active"
            value={summary.by_status.active}
            color="emerald"
          />
          <StatCard
            icon={UserX}
            label="Inactive"
            value={summary.by_status.inactive}
            color="amber"
          />
        </div>
      </div>
    </div>
  );
}
