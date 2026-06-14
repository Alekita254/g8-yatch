import { useLocation, Link } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import useDesktopViewport from '../hooks/useDesktopViewport';
import { 
  Anchor,
  BadgePercent,
  BookOpenCheck,
  Building2,
  Calculator,
  ChevronDown,
  CreditCard,
  GitBranch,
  Landmark,
  LayoutDashboard,
  ListTree,
  LogOut,
  MapPin,
  X,
  Package,
  Percent,
  Route,
  ShieldCheck,
  Tags,
  Truck,
  Users,
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  {
    name: 'User Setup',
    path: '/users',
    icon: Users,
    children: [
      { name: 'Users', path: '/users', icon: Users },
      { name: 'Roles', path: '/users/roles', icon: ShieldCheck },
      { name: 'Service Points', path: '/users/service-points', icon: MapPin },
    ],
  },
  {
    name: 'Products',
    path: '/products',
    icon: Package,
    children: [
      { name: 'Categories', path: '/products/categories', icon: ListTree },
      { name: 'Products & Items', path: '/products/items', icon: Package },
      { name: 'Sales Pricelists', path: '/products/sales-pricelists', icon: Tags },
      { name: 'Purchase Pricelists', path: '/products/purchase-pricelists', icon: Truck },
    ],
  },
  {
    name: 'Taxes & Discount',
    path: '/taxes-discounts',
    icon: Percent,
    children: [
      { name: 'Tax Configurations', path: '/taxes-discounts/configurations', icon: Calculator },
      { name: 'Tax Categories', path: '/taxes-discounts/categories', icon: BookOpenCheck },
      { name: 'Tax Offices', path: '/taxes-discounts/offices', icon: Landmark },
      { name: 'Discount Rules', path: '/taxes-discounts/discounts', icon: BadgePercent },
    ],
  },
  {
    name: 'Payment',
    path: '/payments',
    icon: CreditCard,
    children: [
      { name: 'Payment Methods', path: '/payments/methods', icon: CreditCard },
      { name: 'Bank Details', path: '/payments/bank-accounts', icon: Landmark },
      { name: 'Payment Routing', path: '/payments/routing-rules', icon: Route },
    ],
  },
  {
    name: 'Organisation Setup',
    path: '/organisation',
    icon: Building2,
    children: [
      { name: 'Organizations', path: '/organisation/organizations', icon: Building2 },
      { name: 'Branches', path: '/organisation/branches', icon: GitBranch },
    ],
  },
];

export default function Sidebar({ djangoUser, isOpen = false, onClose }) {
  const auth = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const isDesktop = useDesktopViewport();
  const navigationHidden = !isDesktop && !isOpen;

  // Extract initials and name from loaded SSO context
  const userName = djangoUser?.first_name 
    ? `${djangoUser.first_name} ${djangoUser.last_name || ''}`.trim() 
    : 'User Profile';
  const userInitials = userName ? userName.substring(0, 2).toUpperCase() : "US";

  return (
    <aside inert={navigationHidden} aria-hidden={navigationHidden} className={`fixed inset-y-0 left-0 z-40 flex h-dvh w-72 shrink-0 flex-col border-r border-shell-border bg-shell-bg text-shell-text shadow-2xl shadow-black/10 transition-colors duration-300 lg:static lg:h-screen lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Logo */}
      <div className="flex h-20 items-center justify-between border-b border-shell-border px-5 sm:px-8">
        <Link to="/home" className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-[#d7b56d] flex items-center justify-center shadow-lg shadow-[#d7b56d]/20 group-hover:scale-110 transition-transform">
            <Anchor className="w-6 h-6 text-[#172326]" />
          </div>
          <div>
            <p className="text-lg font-black text-shell-text tracking-tight uppercase leading-none">G8 Yacht</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-shell-muted mt-1">Admin Console</p>
          </div>
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-shell-muted transition hover:bg-shell-elevated hover:text-shell-text lg:hidden"
          aria-label="Close navigation"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-6 sm:py-8">
        {navItems.map((item) => {
          // Check active state
          const active = currentPath === item.path || currentPath.startsWith(`${item.path}/`);
          const expanded = item.children && active;

          return (
            <div key={item.name} className="space-y-1">
              <Link
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all duration-300 border-2 ${
                  active
                    ? 'bg-brand-100 text-brand-800 border-brand-300 shadow-inner dark:bg-brand-400/15 dark:text-brand-200 dark:border-brand-400/30'
                    : 'text-shell-muted hover:bg-shell-elevated hover:text-shell-text border-transparent hover:border-shell-border'
                }`}
              >
                <item.icon className={`w-5 h-5 ${active ? 'text-shell-accent' : 'text-shell-muted'}`} />
                <span className="min-w-0 flex-1">{item.name}</span>
                {item.children && (
                  <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180 text-shell-accent' : 'text-shell-muted'}`} />
                )}
              </Link>

              {expanded && (
                <div className="ml-5 border-l border-shell-border pl-3 space-y-1">
                  {item.children.map((child) => {
                    const childActive = currentPath === child.path;
                    return (
                      <Link
                        key={child.name}
                        to={child.path}
                        onClick={onClose}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-black uppercase tracking-widest transition ${
                          childActive
                            ? 'bg-brand-100 text-brand-800 dark:bg-brand-400/15 dark:text-brand-200'
                            : 'text-shell-muted hover:bg-shell-elevated hover:text-shell-text'
                        }`}
                      >
                        <child.icon className="h-4 w-4" />
                        {child.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Company/User Footer with 1-Click Logout */}
      <div className="p-6 border-t border-shell-border bg-shell-elevated">
        <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-shell-bg border border-shell-border shadow-sm hover:border-brand-400 transition-all group">
          <Link 
            to="/profile" 
            className="flex items-center gap-4 flex-1 overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-[#d7b56d] flex items-center justify-center text-[#172326] font-black text-sm shadow-md group-hover:scale-105 transition-transform">
              {userInitials}
            </div>
            <div className="flex-1 overflow-hidden text-left">
              <p className="text-sm font-black text-shell-text truncate leading-tight">{userName}</p>
              <p className="text-[10px] font-bold text-shell-muted truncate uppercase tracking-tighter">
                {djangoUser?.role || 'Manage Account'}
              </p>
            </div>
          </Link>
          <button
            onClick={() => auth.signoutRedirect()}
            className="p-2.5 rounded-xl hover:bg-red-500/10 text-shell-muted hover:text-red-600 dark:hover:text-red-300 transition-all cursor-pointer flex items-center justify-center"
            title="Sign Out"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
