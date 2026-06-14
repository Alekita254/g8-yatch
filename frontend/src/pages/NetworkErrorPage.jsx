import { RefreshCw, WifiOff, Zap } from 'lucide-react';
import NetworkErrorIllustration from '../components/NetworkErrorIllustration';

export default function NetworkErrorPage({ error }) {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center p-6 relative overflow-hidden bg-[radial-gradient(45%_40%_at_50%_50%,var(--color-brand-500)_0%,transparent_100%)] dark:bg-[radial-gradient(45%_40%_at_50%_50%,rgba(239,68,68,0.03)_0%,transparent_100%)]">
      <div className="max-w-md w-full text-center relative z-10 space-y-8 animate-fade-in">
        
        {/* Animated server connection offline vector */}
        <NetworkErrorIllustration />

        {/* Messaging */}
        <div className="space-y-3">
          <h1 className="text-4xl font-black text-app-text tracking-tight flex items-center justify-center gap-3">
            <WifiOff className="w-8 h-8 text-red-500 animate-pulse" />
            Connection <span className="text-red-500">Offline</span>
          </h1>
          <p className="text-sm text-app-muted font-medium max-w-sm mx-auto leading-relaxed">
            TenderSafi cannot reach the secure database servers. Please verify that your local Django server is running or check your internet connection.
          </p>
          {error && (
            <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10 text-[11px] text-red-400 font-mono max-w-xs mx-auto truncate">
              {error.message || 'ERR_CONNECTION_REFUSED'}
            </div>
          )}
        </div>

        {/* Retry Button */}
        <button
          onClick={handleReload}
          className="inline-flex items-center justify-center gap-2 w-full px-8 py-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold transition-all shadow-lg hover:shadow-brand-500/25 text-sm cursor-pointer group"
        >
          <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
          Retry Connection
        </button>

        {/* Branding Footer */}
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-app-muted uppercase tracking-widest pt-4">
          <Zap className="w-4 h-4 text-brand-500" />
          <span>TenderSafi Systems</span>
        </div>

      </div>

      {/* Background Decorative Blur Spheres */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-red-500/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-red-500/5 rounded-full blur-3xl" />
    </div>
  );
}
