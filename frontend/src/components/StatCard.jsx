import { TrendingUp } from 'lucide-react';

export default function StatCard({ icon: Icon, label, value, trend, color }) {
  const colors = {
    emerald: 'bg-brand-500/10 text-brand-500 dark:text-brand-400 border-brand-500/20',
    blue: 'bg-blue-500/10 text-blue-500 dark:text-blue-400 border-blue-500/20',
    amber: 'bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-500 dark:text-purple-400 border-purple-500/20',
  };
  return (
    <div className="glass rounded-2xl p-6 card-hover border-app-border/50">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${colors[color]} flex items-center justify-center border shadow-sm`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className="text-xs font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1 bg-brand-500/10 px-2 py-1 rounded-full">
            <TrendingUp className="w-3 h-3" /> {trend}
          </span>
        )}
      </div>
      <p className="text-3xl font-black text-app-text tracking-tight">{value}</p>
      <p className="text-xs font-bold text-app-muted mt-1 uppercase tracking-wider">{label}</p>
    </div>
  );
}
