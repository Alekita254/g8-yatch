import { Link, useLocation } from 'react-router-dom';
import { Bell, ChevronRight, Home, Menu, Search, ShipWheel } from 'lucide-react';

const routeLabels = {
  '/dashboard': 'Dashboard',
  '/users': 'User Setup',
  '/users/roles': 'Roles',
  '/users/service-points': 'Service Points',
  '/products': 'Products',
  '/products/categories': 'Categories',
  '/products/items': 'Products & Items',
  '/products/sales-pricelists': 'Sales Pricelists',
  '/products/purchase-pricelists': 'Purchase Pricelists',
  '/taxes-discounts': 'Taxes & Discount',
  '/taxes-discounts/configurations': 'Tax Configurations',
  '/taxes-discounts/categories': 'Tax Categories',
  '/taxes-discounts/offices': 'Tax Offices',
  '/taxes-discounts/discounts': 'Discount Rules',
  '/payments': 'Payment',
  '/payments/methods': 'Payment Methods',
  '/payments/bank-accounts': 'Bank Details',
  '/payments/routing-rules': 'Payment Routing',
  '/organisation': 'Organisation Setup',
  '/organisation/organizations': 'Organizations',
  '/organisation/branches': 'Branches',
  '/frontdesk': 'Frontdesk',
  '/sales': 'Sales',
  '/tenders': 'Tenders',
  '/crm': 'CRM',
  '/documents': 'Documents',
  '/profile': 'Profile',
};

function breadcrumbFor(pathname) {
  if (pathname.startsWith('/products/sales-pricelists/')) {
    return [
      { label: 'Admin Console', path: '/dashboard' },
      { label: 'Products', path: '/products' },
      { label: 'Sales Pricelists', path: '/products/sales-pricelists' },
      { label: 'Pricelist Details' },
    ];
  }

  if (pathname.startsWith('/users/')) {
    return [
      { label: 'Admin Console', path: '/dashboard' },
      { label: 'User Setup', path: '/users' },
      { label: routeLabels[pathname] || 'Details' },
    ];
  }

  if (pathname.startsWith('/products/')) {
    return [
      { label: 'Admin Console', path: '/dashboard' },
      { label: 'Products', path: '/products' },
      { label: routeLabels[pathname] || 'Details' },
    ];
  }

  if (pathname.startsWith('/taxes-discounts/')) {
    return [
      { label: 'Admin Console', path: '/dashboard' },
      { label: 'Taxes & Discount', path: '/taxes-discounts' },
      { label: routeLabels[pathname] || 'Details' },
    ];
  }

  if (pathname.startsWith('/payments/')) {
    return [
      { label: 'Admin Console', path: '/dashboard' },
      { label: 'Payment', path: '/payments' },
      { label: routeLabels[pathname] || 'Details' },
    ];
  }

  if (pathname.startsWith('/organisation/')) {
    return [
      { label: 'Admin Console', path: '/dashboard' },
      { label: 'Organisation Setup', path: '/organisation' },
      { label: routeLabels[pathname] || 'Details' },
    ];
  }

  return [
    { label: 'Admin Console', path: '/dashboard' },
    { label: routeLabels[pathname] || 'Workspace' },
  ];
}

export default function AdminTopbar({ userName, onMenuClick }) {
  const location = useLocation();
  const breadcrumbs = breadcrumbFor(location.pathname);
  const pageTitle = breadcrumbs[breadcrumbs.length - 1]?.label || 'Workspace';

  return (
    <header className="sticky top-0 z-10 border-b border-[#d7b56d]/20 bg-[#172326]/95 text-white backdrop-blur-xl">
      <div className="px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <nav className="mb-2 flex flex-wrap items-center gap-1 text-xs font-bold uppercase tracking-[0.14em] text-white/55">
              <Link
                to="/home"
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 transition hover:bg-white/10 hover:text-white"
              >
                <Home className="h-3.5 w-3.5" />
                Home
              </Link>
              {breadcrumbs.map((crumb, index) => {
                const last = index === breadcrumbs.length - 1;
                return (
                  <span key={`${crumb.label}-${index}`} className="inline-flex items-center gap-1">
                    <ChevronRight className="h-3.5 w-3.5 text-white/35" />
                    {crumb.path && !last ? (
                      <Link
                        to={crumb.path}
                        className="rounded-md px-1.5 py-1 transition hover:bg-white/10 hover:text-white"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="rounded-md px-1.5 py-1 text-[#d7b56d]">{crumb.label}</span>
                    )}
                  </span>
                );
              })}
            </nav>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onMenuClick}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/8 text-white/70 transition hover:text-white lg:hidden"
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#d7b56d]/25 bg-[#d7b56d]/12 text-[#d7b56d]">
                <ShipWheel className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-xl font-black text-white sm:text-2xl">{pageTitle}</h1>
                <p className="hidden text-sm text-white/58 sm:block">G8 Yacht Villa operations control</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
              <input
                type="search"
                placeholder="Search setup..."
                className="h-10 w-64 rounded-lg border border-white/10 bg-white/8 pl-9 pr-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-[#d7b56d]/40 focus:ring-2 focus:ring-[#d7b56d]/25"
              />
            </div>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/8 text-white/58 transition hover:text-white"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
            </button>
            <div className="hidden rounded-lg border border-white/10 bg-white/8 px-3 py-2 text-right sm:block">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-white/45">Signed in</p>
              <p className="max-w-36 truncate text-sm font-bold text-white">{userName || 'Manager'}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
