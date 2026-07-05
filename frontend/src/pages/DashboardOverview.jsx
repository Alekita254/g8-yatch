import { Link, useOutletContext } from 'react-router-dom';
import {
  BadgePercent,
  BedDouble,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  CreditCard,
  Download,
  FilePlus2,
  GitBranch,
  Landmark,
  Loader2,
  Package,
  PackageX,
  Percent,
  Route,
  Tags,
  Users,
  WalletCards,
} from 'lucide-react';

import StatCard from '../components/StatCard';

function total(stats, key) {
  return stats?.[key]?.total ?? 0;
}

function activeCount(stats, key) {
  return stats?.[key]?.results?.filter((item) => item.is_active !== false).length ?? 0;
}

function statResults(stats, key) {
  return stats?.[key]?.results ?? [];
}

function setupScore(checks) {
  const complete = checks.filter((item) => item.done).length;
  return Math.round((complete / checks.length) * 100);
}

export default function DashboardOverview() {
  const { stats, loadingStats, djangoUser } = useOutletContext();

  if (loadingStats) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-app-border border-t-brand-500" />
            <Loader2 className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-brand-500" />
          </div>
          <p className="animate-pulse text-sm font-black uppercase tracking-[0.2em] text-app-muted">Loading admin command center...</p>
        </div>
      </div>
    );
  }

  const checks = [
    { label: 'Users and roles configured', done: total(stats, 'users') > 0 && total(stats, 'roles') > 0, path: '/users' },
    { label: 'Service points registered', done: total(stats, 'servicePoints') > 0, path: '/users/service-points' },
    { label: 'Products and categories ready', done: total(stats, 'products') > 0 && total(stats, 'categories') > 0, path: '/products/items' },
    { label: 'Rooms created', done: total(stats, 'rooms') > 0, path: '/rooms/inventory' },
    { label: 'RFP workflow ready', done: total(stats, 'purchasePricelists') > 0, path: '/inventory/request-for-purchase' },
    { label: 'Tax engine configured', done: total(stats, 'taxConfigurations') > 0 && total(stats, 'taxCategories') > 0, path: '/taxes-discounts/configurations' },
    { label: 'Payment routing mapped', done: total(stats, 'paymentMethods') > 0 && total(stats, 'paymentRoutingRules') > 0, path: '/payments/routing-rules' },
    { label: 'Branches created', done: total(stats, 'organizations') > 0 && total(stats, 'branches') > 0, path: '/organisation/branches' },
  ];

  const readiness = setupScore(checks);
  const activeUsers = activeCount(stats, 'users');
  const activeProducts = activeCount(stats, 'products');
  const activePaymentMethods = activeCount(stats, 'paymentMethods');
  const lowStockCount = total(stats, 'inventoryLowStock');
  const pendingRfpCount = total(stats, 'inventoryDraftRequests') + total(stats, 'inventorySubmittedRequests');
  const requisitionCount = total(stats, 'inventoryRequisitions');
  const latestRfpDocuments = [
    ...statResults(stats, 'inventorySubmittedRequests'),
    ...statResults(stats, 'inventoryDraftRequests'),
    ...statResults(stats, 'inventoryRequisitions'),
  ]
    .sort((left, right) => new Date(right.created_at || 0) - new Date(left.created_at || 0))
    .slice(0, 4);

  const moduleCards = [
    {
      title: 'User Setup',
      icon: Users,
      path: '/users',
      detail: `${total(stats, 'roles')} roles, ${total(stats, 'servicePoints')} service points`,
      status: total(stats, 'users') > 0 ? 'Operational' : 'Needs users',
    },
    {
      title: 'Products',
      icon: Package,
      path: '/products/items',
      detail: `${total(stats, 'products')} products, ${total(stats, 'salesPricelists')} sales pricelists`,
      status: total(stats, 'products') > 0 ? 'Catalog ready' : 'Needs products',
    },
    {
      title: 'Inventory RFP',
      icon: FilePlus2,
      path: '/inventory/request-for-purchase',
      detail: `${pendingRfpCount} pending RFPs, ${requisitionCount} requisitions`,
      status: lowStockCount > 0 ? `${lowStockCount} items need stock` : 'Stock stable',
    },
    {
      title: 'Rooms',
      icon: BedDouble,
      path: '/rooms/inventory',
      detail: `${total(stats, 'rooms')} rooms configured`,
      status: total(stats, 'rooms') > 0 ? 'Inventory ready' : 'Needs rooms',
    },
    {
      title: 'Taxes & Discount',
      icon: Percent,
      path: '/taxes-discounts/configurations',
      detail: `${total(stats, 'taxCategories')} tax categories, ${total(stats, 'discounts')} discounts`,
      status: total(stats, 'taxOffices') > 0 ? 'Compliance mapped' : 'Needs tax office',
    },
    {
      title: 'Payment',
      icon: WalletCards,
      path: '/payments/methods',
      detail: `${total(stats, 'bankAccounts')} bank details, ${total(stats, 'paymentRoutingRules')} routes`,
      status: total(stats, 'paymentRoutingRules') > 0 ? 'Routing active' : 'Needs routing',
    },
    {
      title: 'Downloads',
      icon: Download,
      path: '/downloads',
      detail: 'Windows app and startup data dump',
      status: 'Installer ready',
    },
    {
      title: 'Organisation',
      icon: Building2,
      path: '/organisation/organizations',
      detail: `${total(stats, 'branches')} branches under ${total(stats, 'organizations')} organization`,
      status: total(stats, 'branches') > 0 ? 'Tenant base ready' : 'Needs branches',
    },
  ];

  const quickLinks = [
    { label: 'Add Product', path: '/products/items', icon: Package },
    { label: 'RFP Dashboard', path: '/inventory/request-for-purchase', icon: FilePlus2 },
    { label: 'Add Rooms', path: '/rooms/inventory', icon: BedDouble },
    { label: 'Tax Rules', path: '/taxes-discounts/configurations', icon: BadgePercent },
    { label: 'Downloads', path: '/downloads', icon: Download },
    { label: 'Payment Routing', path: '/payments/routing-rules', icon: Route },
    { label: 'Branches', path: '/organisation/branches', icon: GitBranch },
  ];

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-lg border border-app-border bg-[#172326] text-white">
        <div className="grid gap-8 p-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d7b56d]">Admin command center</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
              G8 Yacht Villa is {readiness}% configured.
            </h2>
            <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-white/68">
              Monitor the setup foundation for users, branches, products, taxes, discounts, payment routes, and financial ledgers before live hotel operations begin.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {quickLinks.map((link) => (
                <Link key={link.path} to={link.path} className="inline-flex items-center gap-2 rounded-md border border-white/12 bg-white/8 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-white/78 transition hover:border-[#d7b56d]/50 hover:text-[#d7b56d]">
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-[#d7b56d]/25 bg-white/8 p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white/55">Setup readiness</p>
              <span className="text-2xl font-black text-[#d7b56d]">{readiness}%</span>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-black/25">
              <div className="h-full rounded-full bg-[#d7b56d]" style={{ width: `${readiness}%` }} />
            </div>
            <p className="mt-4 text-sm text-white/68">
              Signed in as <span className="font-black text-white">{djangoUser?.identity?.email || djangoUser?.identity?.username || 'Manager'}</span>
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Active Users" value={activeUsers} color="emerald" />
        <StatCard icon={Package} label="Active Products" value={activeProducts} color="blue" />
        <StatCard icon={PackageX} label="Low Stock Items" value={lowStockCount} color="amber" />
        <StatCard icon={CreditCard} label="Payment Methods" value={activePaymentMethods} color="purple" />
      </div>

      <section className="rounded-lg border border-app-border bg-app-card p-4 sm:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-500">Inventory purchasing</p>
            <h3 className="mt-2 text-xl font-black text-app-text">Request for Purchase Dashboard</h3>
            <p className="mt-1 max-w-2xl text-sm text-app-muted">
              The same buying signals from the RFP workspace are shown here for quick action from the main dashboard.
            </p>
          </div>
          <Link to="/inventory/request-for-purchase" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-black text-white transition hover:bg-brand-700">
            <FilePlus2 className="h-4 w-4" />
            Open RFP
          </Link>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            ['Below / At Minimum', lowStockCount, 'Products that need attention', PackageX],
            ['Pending RFPs', pendingRfpCount, 'Draft and submitted requests', FilePlus2],
            ['Requisitions', requisitionCount, 'Documents generated after approval', ClipboardCheck],
          ].map(([label, value, description, Icon]) => (
            <Link key={label} to="/inventory/request-for-purchase" className="rounded-lg border border-app-border bg-app-bg p-4 transition hover:border-brand-500 hover:bg-app-elevated">
              <Icon className="h-5 w-5 text-brand-500" />
              <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-app-muted">{label}</p>
              <p className="mt-2 text-3xl font-black text-app-text">{value}</p>
              <p className="mt-1 text-sm text-app-muted">{description}</p>
            </Link>
          ))}
        </div>

        <div className="mt-5">
          <div className="mb-3 flex items-center justify-between gap-4">
            <h4 className="font-black text-app-text">Latest RFP Documents</h4>
            <Link to="/inventory/request-for-purchase/requests" className="text-xs font-black uppercase tracking-[0.12em] text-brand-500 transition hover:text-brand-700">
              View all
            </Link>
          </div>
          {latestRfpDocuments.length ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {latestRfpDocuments.map((document) => (
                <Link key={`${document.document_type}-${document.id}`} to={`/inventory/request-for-purchase/${document.id}`} className="flex flex-col gap-3 rounded-lg border border-app-border bg-app-bg p-4 transition hover:border-brand-500 hover:bg-app-elevated sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate font-black text-app-text">{document.document_number}</p>
                    <p className="mt-1 truncate text-sm text-app-muted">{document.supplier_name || document.purchase_pricelist_supplier || 'No supplier selected'}</p>
                  </div>
                  <div className="flex items-center gap-2 sm:justify-end">
                    <span className="rounded-full border border-app-border bg-app-card px-2 py-1 text-[10px] font-black uppercase tracking-widest text-app-muted">
                      {document.document_type_display || document.document_type}
                    </span>
                    <span className="rounded-full border border-brand-500/25 bg-brand-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-brand-600">
                      {document.status_display || document.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-app-border p-6 text-center text-sm font-bold text-app-muted">
              No RFP or requisition documents yet.
            </div>
          )}
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-4">
          <h3 className="text-xl font-black text-app-text">Module Health</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {moduleCards.map((module) => (
              <Link key={module.path} to={module.path} className="group rounded-lg border border-app-border bg-app-card p-5 transition hover:border-brand-500/50 hover:shadow-lg hover:shadow-black/5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
                      <module.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-app-text">{module.title}</h4>
                      <p className="text-xs font-bold uppercase text-brand-500">{module.status}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-app-muted transition group-hover:translate-x-1 group-hover:text-brand-500" />
                </div>
                <p className="mt-4 text-sm text-app-muted">{module.detail}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-xl font-black text-app-text">Go-Live Checklist</h3>
          <div className="rounded-lg border border-app-border bg-app-card p-5">
            <div className="space-y-3">
              {checks.map((check) => (
                <Link key={check.label} to={check.path} className="flex items-center justify-between gap-4 rounded-md bg-app-elevated px-3 py-3 transition hover:bg-brand-500/10">
                  <span className="text-sm font-bold text-app-text">{check.label}</span>
                  {check.done ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-500" />
                  ) : (
                    <Landmark className="h-5 w-5 shrink-0 text-amber-500" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-app-border bg-app-card p-5">
          <Tags className="h-5 w-5 text-brand-500" />
          <p className="mt-4 text-2xl font-black text-app-text">{total(stats, 'purchasePricelists')}</p>
          <p className="text-xs font-bold uppercase text-app-muted">Purchase pricelists</p>
        </div>
        <div className="rounded-lg border border-app-border bg-app-card p-5">
          <GitBranch className="h-5 w-5 text-brand-500" />
          <p className="mt-4 text-2xl font-black text-app-text">{total(stats, 'branches')}</p>
          <p className="text-xs font-bold uppercase text-app-muted">Property branches</p>
        </div>
        <div className="rounded-lg border border-app-border bg-app-card p-5">
          <Landmark className="h-5 w-5 text-brand-500" />
          <p className="mt-4 text-2xl font-black text-app-text">{total(stats, 'bankAccounts')}</p>
          <p className="text-xs font-bold uppercase text-app-muted">Financial ledgers</p>
        </div>
      </section>
    </div>
  );
}
