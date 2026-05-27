import { Link, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from 'react-oidc-context';
import {
  Anchor,
  Building2,
  CalendarCheck,
  ConciergeBell,
  CreditCard,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Loader2,
  LogIn,
  Martini,
  MonitorCog,
  Package,
  Percent,
  Sailboat,
  ShieldCheck,
  Sparkles,
  Target,
  Utensils,
  Users,
  Wrench,
} from 'lucide-react';

import AdminTopbar from './components/AdminTopbar';
import Sidebar from './components/Sidebar';
import DashboardOverview from './pages/DashboardOverview';
import DiscountRulesPage from './pages/DiscountRulesPage';
import MembersTablePage from './pages/MembersTablePage';
import PlaceholderPage from './pages/PlaceholderPage';
import ProductCategoriesPage from './pages/ProductCategoriesPage';
import ProductsItemsPage from './pages/ProductsItemsPage';
import ProductsSetupPage from './pages/ProductsSetupPage';
import PurchasePricelistsPage from './pages/PurchasePricelistsPage';
import RolesSetupPage from './pages/RolesSetupPage';
import SalesPricelistsPage from './pages/SalesPricelistsPage';
import ServicePointsSetupPage from './pages/ServicePointsSetupPage';
import TaxCategoriesPage from './pages/TaxCategoriesPage';
import TaxConfigurationsPage from './pages/TaxConfigurationsPage';
import TaxOfficesPage from './pages/TaxOfficesPage';
import TaxesDiscountsSetupPage from './pages/TaxesDiscountsSetupPage';
import UserSetupPage from './pages/UserSetupPage';
import UsersDashboard from './pages/UsersDashboard';
import WorkspaceSettingsPage from './pages/WorkspaceSettingsPage';
import useProfile from './hooks/useProfile';
import useStats from './hooks/useStats';

const heroImageUrl = 'https://images.unsplash.com/photo-1756680967419-96f0cb629566?auto=format&fit=crop&fm=jpg&q=80&w=2400';

function LoginPage() {
  const auth = useAuth();

  if (auth.isLoading) {
    return (
      <div className="min-h-screen bg-app-bg text-app-text flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (auth.isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  const services = [
    { icon: ConciergeBell, title: 'Villa Front Desk', text: 'Reservations, guest profiles, check-ins, room moves, and concierge notes in one calm workspace.' },
    { icon: Utensils, title: 'Restaurant & POS', text: 'Pool bar, kitchen, table service, void approvals, bill splits, and end-of-shift controls.' },
    { icon: Sailboat, title: 'Marina Experiences', text: 'Yacht bookings, dock-side service requests, transfers, excursions, and guest itineraries.' },
    { icon: Wrench, title: 'Metal Works', text: 'Stainless railings, brass finishes, custom fabrication, maintenance requests, and workshop tracking.' },
  ];

  const operations = [
    'Guest stays',
    'Staff roles',
    'Inventory',
    'Approvals',
    'Service points',
    'Audit logs',
  ];

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-[#172326]">
      <section className="relative min-h-[92svh] overflow-hidden">
        <img
          src={heroImageUrl}
          alt="Luxury coastal villa pool overlooking yachts in a marina"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,18,22,0.78),rgba(8,18,22,0.44)_45%,rgba(8,18,22,0.08))]" />
        <div className="absolute inset-x-0 top-0 z-10">
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
            <div className="flex items-center gap-3 text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/25 bg-white/10 backdrop-blur">
                <Anchor className="h-5 w-5 text-[#d7b56d]" />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-[0.22em]">G8 Yacht Villa</p>
                <p className="text-xs text-white/70">Hotel operations system</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => auth.signinRedirect()}
              className="inline-flex items-center gap-2 rounded-lg bg-[#d7b56d] px-4 py-2.5 text-sm font-black text-[#172326] shadow-lg shadow-black/20 transition hover:bg-[#efcf83]"
            >
              <LogIn className="h-4 w-4" />
              Sign in
            </button>
          </nav>
        </div>

        <div className="relative z-10 mx-auto flex min-h-[92svh] max-w-7xl items-center px-6 pb-20 pt-28 lg:px-8">
          <div className="max-w-3xl text-white">
            <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] backdrop-blur">
              <Sparkles className="h-4 w-4 text-[#d7b56d]" />
              Villa, marina, dining, workshop
            </div>
            <h1 className="max-w-3xl text-5xl font-black leading-[0.98] sm:text-6xl lg:text-7xl">
              G8 Yacht Villa
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-white/82">
              A refined hotel management system for waterfront stays, POS service, yacht experiences, guest care, and the craft work that keeps the property shining.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => auth.signinRedirect()}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#d7b56d] px-5 py-3 text-sm font-black text-[#172326] transition hover:bg-[#efcf83]"
              >
                <ShieldCheck className="h-4 w-4" />
                Enter console
              </button>
              <a
                href="#services"
                className="inline-flex items-center justify-center rounded-lg border border-white/30 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
              >
                Explore services
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="border-y border-[#d7b56d]/30 bg-[#172326] text-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 sm:grid-cols-2 lg:grid-cols-6 lg:px-8">
          {operations.map((item) => (
            <div key={item} className="flex items-center gap-3">
              <span className="h-px w-8 bg-[#d7b56d]" />
              <span className="text-xs font-black uppercase tracking-[0.18em] text-white/78">{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#9d7a31]">Guest luxury, operational discipline</p>
            <h2 className="mt-3 text-3xl font-black text-[#172326] sm:text-4xl">
              Built for the rhythm of a villa hotel.
            </h2>
          </div>
          <p className="text-sm font-medium leading-7 text-[#526065]">
            G8 Yacht Villa connects the quiet front-of-house details with the hard operational work behind them: dining service, stock control, role approvals, maintenance, and metal fabrication requests.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <article key={service.title} className="rounded-lg border border-[#d8d0c1] bg-white p-5 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#e8f1ef] text-[#0d6b67]">
                <service.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-black text-[#172326]">{service.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#526065]">{service.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#ebe3d4] px-6 py-16 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#9d7a31]">Signature metal works</p>
            <h2 className="mt-3 text-3xl font-black text-[#172326]">
              Stainless steel, brass, and workshop requests.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3 lg:col-span-2">
            {[
              ['Brass finishes', 'Polished handles, signage, trims, and guest-facing details.'],
              ['Marine steel', 'Railings, dock hardware, ladder repairs, and corrosion-aware maintenance.'],
              ['Custom jobs', 'Fabrication requests, estimates, approvals, and completion logs.'],
            ].map(([title, text]) => (
              <article key={title} className="rounded-lg border border-[#c8b98f] bg-[#f9f6ef] p-5">
                <div className="h-1.5 w-20 rounded-full bg-[linear-gradient(90deg,#9c7a34,#f1d58a,#8f9493)]" />
                <h3 className="mt-5 text-base font-black text-[#172326]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#526065]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-16 lg:grid-cols-3 lg:px-8">
        {[
          [CalendarCheck, 'Reservations', 'Track arrivals, departures, experiences, and special requests without losing the human touch.'],
          [Martini, 'Service Points', 'Know which bar, terrace, pool, or restaurant terminal performed every sensitive action.'],
          [ShieldCheck, 'Secure Roles', 'Keycloak login, realm roles, terminal context, and clear business permissions.'],
        ].map(([Icon, title, text]) => (
          <article key={title} className="rounded-lg border border-[#d8d0c1] bg-white p-6">
            <Icon className="h-6 w-6 text-[#0d6b67]" />
            <h3 className="mt-4 text-xl font-black text-[#172326]">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-[#526065]">{text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

function AppChooserPage() {
  const profile = useProfile();

  const apps = [
    {
      icon: MonitorCog,
      title: 'Admin Console',
      description: 'Users, roles, service points, approvals, reports, and system controls.',
      path: '/dashboard',
      accent: 'bg-[#172326] text-white',
    },
    {
      icon: ConciergeBell,
      title: 'Frontdesk',
      description: 'Arrivals, guest profiles, room movements, concierge notes, and villa operations.',
      path: '/frontdesk',
      accent: 'bg-[#0d6b67] text-white',
    },
    {
      icon: LayoutDashboard,
      title: 'Sales',
      description: 'Leads, bookings, packages, invoices, corporate accounts, and guest offers.',
      path: '/sales',
      accent: 'bg-[#d7b56d] text-[#172326]',
    },
  ];

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-[#172326]">
      <section className="border-b border-[#d8d0c1] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#172326] text-[#d7b56d]">
              <Anchor className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em]">G8 Yacht Villa</p>
              <p className="text-xs text-[#526065]">Choose your workspace</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => profile.auth.signoutRedirect()}
            className="rounded-lg border border-[#d8d0c1] px-4 py-2 text-sm font-bold text-[#172326] transition hover:bg-[#f1ece3]"
          >
            Sign out
          </button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#9d7a31]">
            Welcome back
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Select the app you want to use.
          </h1>
          <p className="mt-4 text-sm font-medium leading-7 text-[#526065]">
            Start in the workspace that matches your shift. Your Keycloak roles will still control what actions are available inside each app.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {apps.map((app) => (
            <Link
              key={app.title}
              to={app.path}
              className="group rounded-lg border border-[#d8d0c1] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#d7b56d] hover:shadow-xl hover:shadow-[#172326]/10"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${app.accent}`}>
                <app.icon className="h-6 w-6" />
              </div>
              <h2 className="mt-6 text-2xl font-black text-[#172326]">{app.title}</h2>
              <p className="mt-3 min-h-20 text-sm leading-6 text-[#526065]">{app.description}</p>
              <span className="mt-6 inline-flex text-sm font-black text-[#0d6b67] transition group-hover:translate-x-1">
                Open app
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

function DashboardShell() {
  const profile = useProfile();
  const stats = useStats(profile.isAuthenticated);

  if (profile.auth.isLoading || profile.loading) {
    return (
      <div className="min-h-screen bg-app-bg text-app-text flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!profile.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-app-bg text-app-text flex">
      <Sidebar djangoUser={profile.djangoUser?.identity} />
      <main className="flex-1 min-w-0 h-screen overflow-y-auto">
        <AdminTopbar userName={profile.userName} />
        <div className="mx-auto max-w-7xl px-8 py-8">
          <Outlet
            context={{
              stats: stats.stats,
              loadingStats: stats.loading,
              djangoUser: profile.djangoUser,
            }}
          />
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            borderRadius: '12px',
            background: 'var(--color-app-card)',
            color: 'var(--color-app-text)',
            border: '1px solid var(--color-app-border)',
            fontFamily: 'var(--font-sans)',
            fontWeight: '500',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<AppChooserPage />} />
        <Route element={<DashboardShell />}>
          <Route path="/dashboard" element={<DashboardOverview />} />
          <Route path="/users" element={<UserSetupPage />}>
            <Route index element={<UsersDashboard embedded />} />
            <Route path="roles" element={<RolesSetupPage />} />
            <Route path="service-points" element={<ServicePointsSetupPage />} />
          </Route>
          <Route path="/products" element={<ProductsSetupPage />}>
            <Route path="categories" element={<ProductCategoriesPage />} />
            <Route path="items" element={<ProductsItemsPage />} />
            <Route path="sales-pricelists" element={<SalesPricelistsPage />} />
            <Route path="purchase-pricelists" element={<PurchasePricelistsPage />} />
          </Route>
          <Route path="/taxes-discounts" element={<TaxesDiscountsSetupPage />}>
            <Route path="configurations" element={<TaxConfigurationsPage />} />
            <Route path="categories" element={<TaxCategoriesPage />} />
            <Route path="offices" element={<TaxOfficesPage />} />
            <Route path="discounts" element={<DiscountRulesPage />} />
          </Route>
          <Route
            path="/payments"
            element={<PlaceholderPage icon={CreditCard} title="Payment" description="Manage payment methods, settlement accounts, cashier shifts, and reconciliation rules." />}
          />
          <Route path="/organisation" element={<WorkspaceSettingsPage />} />
          <Route
            path="/frontdesk"
            element={<PlaceholderPage icon={ConciergeBell} title="Frontdesk" description="Guest arrivals, villa movements, and concierge operations are being connected." />}
          />
          <Route
            path="/sales"
            element={<PlaceholderPage icon={LayoutDashboard} title="Sales" description="Bookings, offers, corporate accounts, and revenue workflows are being connected." />}
          />
          <Route
            path="/tenders"
            element={<PlaceholderPage icon={FileText} title="Tenders" description="Tender workflows are being connected." />}
          />
          <Route path="/users/members" element={<MembersTablePage />} />
          <Route
            path="/crm"
            element={<PlaceholderPage icon={Target} title="CRM Pipeline" description="Client relationship management is being connected." />}
          />
          <Route
            path="/documents"
            element={<PlaceholderPage icon={FolderOpen} title="Documents" description="Compliance document management is being connected." />}
          />
          <Route
            path="/profile"
            element={<PlaceholderPage icon={Users} title="Profile" description="Account details are managed through Keycloak." />}
          />
          <Route
            path="/workspace"
            element={<PlaceholderPage icon={Building2} title="Workspace" description="Workspace settings are being connected." />}
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
