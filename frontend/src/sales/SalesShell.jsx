import { useState } from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import {
  Anchor,
  Banknote,
  ChevronRight,
  ClipboardList,
  Home,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  ReceiptText,
  RefreshCw,
  Utensils,
  X,
} from 'lucide-react';

import useProfile from '../hooks/useProfile';
import ThemeToggle from '../components/ThemeToggle';

const navItems = [
  { name: 'Dashboard', path: '/sales', icon: LayoutDashboard },
  { name: 'Orders', path: '/sales/orders', icon: ClipboardList },
  { name: 'Invoices', path: '/sales/invoices', icon: ReceiptText },
  { name: 'Payments', path: '/sales/payments', icon: Banknote },
  { name: 'Payment Runs', path: '/sales/payment-runs', icon: RefreshCw },
];

const routeLabels = {
  '/sales': 'Sales Dashboard',
  '/sales/orders': 'Orders',
  '/sales/invoices': 'Invoices',
  '/sales/payments': 'Payments',
  '/sales/payment-runs': 'Payment Runs',
};

export default function SalesShell() {
  const profile = useProfile();
  const auth = useAuth();
  const location = useLocation();
  const [navigationOpen, setNavigationOpen] = useState(false);

  if (profile.auth.isLoading || profile.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app-bg text-app-text">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!profile.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const userName = profile.userName || 'Sales user';

  return (
    <div className="flex min-h-screen bg-app-bg text-app-text">
      {navigationOpen && <button type="button" className="fixed inset-0 z-30 bg-black/55 lg:hidden" onClick={() => setNavigationOpen(false)} aria-label="Close navigation" />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex h-dvh w-72 shrink-0 flex-col border-r border-[#d7b56d]/20 bg-[#172326] text-white shadow-2xl shadow-black/15 transition-transform duration-300 lg:static lg:h-screen lg:translate-x-0 ${navigationOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5 sm:px-8">
          <Link to="/home" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d7b56d] text-[#172326]">
              <Anchor className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-black uppercase leading-none text-white">G8 Yacht</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">Sales App</p>
            </div>
          </Link>
          <button type="button" onClick={() => setNavigationOpen(false)} className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white lg:hidden" aria-label="Close navigation">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-6 sm:py-8">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setNavigationOpen(false)}
                className={`flex items-center gap-4 rounded-2xl border-2 px-4 py-3.5 text-sm font-black uppercase tracking-widest transition-all ${
                  active
                    ? 'border-[#d7b56d]/30 bg-[#d7b56d]/15 text-[#f1d58a]'
                    : 'border-transparent text-white/62 hover:border-white/10 hover:bg-white/8 hover:text-white'
                }`}
              >
                <item.icon className={`h-5 w-5 ${active ? 'text-[#d7b56d]' : 'text-white/50'}`} />
                <span className="flex-1">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 bg-black/10 p-6">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/7 p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-white">{userName}</p>
              <p className="text-[10px] font-bold uppercase tracking-tight text-white/55">Sales workspace</p>
            </div>
            <button
              type="button"
              onClick={() => auth.signoutRedirect()}
              className="rounded-xl p-2.5 text-white/55 transition hover:bg-red-500/10 hover:text-red-300"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="h-dvh min-w-0 flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 border-b border-[#d7b56d]/20 bg-[#172326]/95 text-white backdrop-blur-xl">
          <div className="px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
            <nav className="mb-2 flex flex-wrap items-center gap-1 text-xs font-bold uppercase tracking-[0.14em] text-white/55">
              <Link to="/home" className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 transition hover:bg-white/10 hover:text-white">
                <Home className="h-3.5 w-3.5" />
                Home
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-white/35" />
              <span className="rounded-md px-1.5 py-1 text-[#d7b56d]">{routeLabels[location.pathname] || 'Sales'}</span>
            </nav>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setNavigationOpen(true)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/8 text-white/70 lg:hidden" aria-label="Open navigation">
                <Menu className="h-5 w-5" />
              </button>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#d7b56d]/25 bg-[#d7b56d]/12 text-[#d7b56d]">
                <Utensils className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-xl font-black text-white sm:text-2xl">{routeLabels[location.pathname] || 'Sales'}</h1>
                <p className="hidden text-sm text-white/58 sm:block">Orders, invoices, payments, and cashier settlement</p>
              </div>
              <ThemeToggle inverse className="ml-auto" />
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
