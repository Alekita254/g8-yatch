import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { FileText, Clock, CheckCircle, TrendingUp, Search, Loader2 } from 'lucide-react';
import StatCard from '../components/StatCard';

export default function DashboardOverview() {
  const { stats, loadingStats } = useOutletContext();

  if (loadingStats) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-app-border border-t-brand-500 animate-spin" />
            <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-brand-500" />
          </div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-app-muted animate-pulse">Loading dashboard metrics...</p>
        </div>
      </div>
    );
  }

  const activeCount = stats?.active_tenders ?? 0;
  const pendingCount = stats?.pending_review ?? 0;
  const wonCount = stats?.won_tenders ?? 0;
  const winRate = stats?.win_rate ?? '0%';
  const recentActivity = stats?.recent_activity ?? [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-app-text tracking-tight">Dashboard</h2>
          <p className="text-app-muted text-sm font-medium mt-1">Overview of your tender pipeline and win rates</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden lg:block">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-app-muted" />
            <input 
              type="text" 
              placeholder="Search tenders..." 
              className="pl-10 pr-4 py-2 rounded-xl bg-app-card border border-app-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all w-64"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={FileText} label="Active Tenders" value={activeCount} color="emerald" />
        <StatCard icon={Clock} label="Pending Review" value={pendingCount} color="amber" />
        <StatCard icon={CheckCircle} label="Won Tenders" value={wonCount} color="blue" />
        <StatCard icon={TrendingUp} label="Win Rate" value={winRate} color="purple" />
      </div>

      {/* Recent & Charts Placeholder */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-black text-app-text tracking-tight flex items-center gap-2">
            Recent Activity
            {recentActivity.length > 0 && <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />}
          </h3>
          <div className="glass rounded-2xl divide-y divide-app-border overflow-hidden border-app-border/50">
            {recentActivity.length === 0 ? (
              <div className="p-12 text-center text-app-muted">
                <FileText className="w-8 h-8 mx-auto mb-3 opacity-40" />
                <p className="text-sm font-bold">No recent activities found</p>
                <p className="text-xs opacity-75 mt-1">Tenders you register will appear here.</p>
              </div>
            ) : (
              recentActivity.map((item) => {
                let statusColor = 'text-app-muted';
                if (item.status === 'Open') statusColor = 'text-blue-500';
                else if (item.status === 'Evaluating') statusColor = 'text-amber-500';
                else if (item.status === 'Awarded') statusColor = 'text-brand-500';
                
                return (
                  <div key={item.id} className="flex items-center justify-between p-5 hover:bg-app-elevated/50 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-app-elevated flex items-center justify-center text-app-muted group-hover:text-brand-500 group-hover:bg-brand-500/10 transition-all border border-app-border group-hover:border-brand-500/20">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-app-text group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{item.title}</p>
                        <p className="text-xs font-medium text-app-muted mt-0.5">
                          {item.tender_number} • Updated {new Date(item.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-black uppercase tracking-widest ${statusColor}`}>{item.status}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-black text-app-text tracking-tight">Compliance Status</h3>
          <div className="glass rounded-2xl p-6 space-y-6 border-app-border/50">
             {[
               { label: 'KRA Tax Compliance', progress: 100, status: 'Active' },
               { label: 'CR12 Certificate', progress: 100, status: 'Active' },
               { label: 'AGPO Certificate', progress: 40, status: 'Expiring Soon', warn: true },
             ].map((doc, i) => (
               <div key={i} className="space-y-2">
                 <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
                   <span className="text-app-text">{doc.label}</span>
                   <span className={doc.warn ? 'text-amber-500' : 'text-brand-500'}>{doc.status}</span>
                 </div>
                 <div className="h-2 w-full bg-app-elevated rounded-full overflow-hidden shadow-inner">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${doc.warn ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 'bg-brand-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]'}`}
                        style={{ width: `${doc.progress}%` }}
                      />
                  </div>
               </div>
             ))}
             <button className="w-full py-3 rounded-xl border border-app-border hover:border-brand-500 text-app-muted hover:text-brand-600 dark:hover:text-white transition-all text-xs font-black uppercase tracking-widest mt-2">
               View All Documents
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
