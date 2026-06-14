import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Banknote,
  BedDouble,
  BellRing,
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Loader2,
  MapPin,
  ReceiptText,
  Utensils,
  UsersRound,
} from 'lucide-react';

import StatCard from '../components/StatCard';
import useFrontdeskData from './useFrontdeskData';

const today = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const time = (value) => value ? new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';

function visitAction(visit) {
  if (visit.status === 'CHECKOUT_REQUESTED') return ['Collect payment', ReceiptText, 'text-emerald-700 bg-emerald-500/10'];
  if (visit.waiter_requested_at && !visit.waiter_acknowledged_at) return ['Waiter requested', BellRing, 'text-amber-700 bg-amber-500/10'];
  if (visit.orders.some((order) => order.status === 'READY')) return ['Ready to serve', Utensils, 'text-blue-700 bg-blue-500/10'];
  if (visit.orders.some((order) => order.status === 'PREPARING')) return ['Being prepared', Clock3, 'text-violet-700 bg-violet-500/10'];
  if (visit.orders.some((order) => order.status === 'SENT')) return ['Order received', CheckCircle2, 'text-brand-700 bg-brand-500/10'];
  if (visit.orders.some((order) => order.status === 'SERVED')) return ['Guest dining', Utensils, 'text-app-muted bg-app-elevated'];
  return ['Guest arrived', MapPin, 'text-app-muted bg-app-elevated'];
}

function visitPriority(visit) {
  if (visit.status === 'CHECKOUT_REQUESTED') return 0;
  if (visit.waiter_requested_at && !visit.waiter_acknowledged_at) return 1;
  if (visit.orders.some((order) => order.status === 'READY')) return 2;
  if (visit.orders.some((order) => order.status === 'SENT')) return 3;
  return 4;
}

export default function FrontdeskDashboard() {
  const { data, loading } = useFrontdeskData();

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>;

  const currentDate = today();
  const occupiedRooms = data.rooms.filter((room) => room.status === 'OCCUPIED').length;
  const arrivalsToday = data.reservations.filter((reservation) => reservation.check_in_date === currentDate && !['CANCELLED', 'CHECKED_IN', 'CHECKED_OUT'].includes(reservation.status));
  const departuresToday = data.reservations.filter((reservation) => reservation.check_out_date === currentDate && reservation.status === 'CHECKED_IN');
  const openFolios = data.folios.filter((folio) => folio.status === 'OPEN').length;
  const openRequests = data.requests.filter((request) => request.status !== 'RESOLVED').length;
  const activeVisits = data.visits.filter((visit) => visit.status !== 'CLOSED');
  const waiterCalls = activeVisits.filter((visit) => visit.waiter_requested_at && !visit.waiter_acknowledged_at).length;
  const readyOrders = activeVisits.filter((visit) => visit.orders.some((order) => order.status === 'READY')).length;
  const checkoutRequests = activeVisits.filter((visit) => visit.status === 'CHECKOUT_REQUESTED').length;
  const operationalVisits = [...activeVisits].sort((left, right) => visitPriority(left) - visitPriority(right)).slice(0, 6);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-app-border bg-[#172326] p-5 text-white sm:p-6 lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d7b56d]">Front desk shift overview</p>
            <h2 className="mt-3 max-w-3xl text-2xl font-black tracking-tight sm:text-3xl md:text-4xl">
              See who is arriving, who needs service, and who is ready to settle.
            </h2>
            <p className="mt-4 max-w-3xl text-sm font-medium leading-7 text-white/68">
              Accommodation and dining remain separate workflows, while this dashboard brings the staff actions that need attention into one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/frontdesk/visits" className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#d7b56d] px-4 text-sm font-black text-[#172326]">
              <UsersRound className="h-4 w-4" /> Open live visits
            </Link>
            <Link to="/frontdesk/service-points" className="inline-flex min-h-11 items-center gap-2 rounded-md border border-white/20 px-4 text-sm font-black text-white">
              <Utensils className="h-4 w-4" /> Open a POS
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-600">Accommodation</p>
            <h3 className="mt-1 text-xl font-black text-app-text">Today at the hotel</h3>
          </div>
          <Link to="/frontdesk/reservations" className="text-sm font-black text-brand-600">Reservations <ArrowRight className="ml-1 inline h-4 w-4" /></Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={CalendarCheck2} label="Arrivals Today" value={arrivalsToday.length} color="blue" />
          <StatCard icon={CalendarDays} label="Departures Today" value={departuresToday.length} color="purple" />
          <StatCard icon={BedDouble} label="Occupied Rooms" value={occupiedRooms} color="emerald" />
          <StatCard icon={ReceiptText} label="Open Folios" value={openFolios} color="amber" />
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-app-border bg-app-card">
        <div className="flex flex-col gap-4 border-b border-app-border p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-600">Restaurant and bar</p>
            <h3 className="mt-1 text-xl font-black text-app-text">Live service queue</h3>
            <p className="mt-1 text-sm text-app-muted">The most urgent guest actions appear first.</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <QueueCount label="Waiter" value={waiterCalls} urgent={waiterCalls > 0} />
            <QueueCount label="Ready" value={readyOrders} urgent={readyOrders > 0} />
            <QueueCount label="Payment" value={checkoutRequests} urgent={checkoutRequests > 0} />
          </div>
        </div>

        {operationalVisits.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
            <p className="mt-3 font-black text-app-text">No active restaurant or bar visits</p>
            <p className="mt-1 text-sm text-app-muted">New QR and POS visits will appear here automatically.</p>
          </div>
        ) : (
          <div className="divide-y divide-app-border">
            {operationalVisits.map((visit) => {
              const [label, Icon, style] = visitAction(visit);
              return (
                <Link key={visit.id} to={`/frontdesk/visits/${visit.id}`} className="flex flex-col gap-4 p-4 transition hover:bg-app-elevated sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${style}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-black text-app-text">{visit.service_area}{visit.table_name ? `, ${visit.table_name}` : ''}</p>
                      <p className="mt-1 truncate text-sm text-app-muted">{visit.guest_name || 'Walk-in guest'} · {visit.visit_number} · arrived {time(visit.arrived_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <span className={`rounded-full px-3 py-1.5 text-xs font-black ${style}`}>{label}</span>
                    <ArrowRight className="h-4 w-4 text-app-muted" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
        <Link to="/frontdesk/visits" className="flex min-h-12 items-center justify-center gap-2 border-t border-app-border text-sm font-black text-brand-600">
          View all live visits <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <OperationalLink to="/frontdesk/requests" icon={ClipboardList} label="Service requests" value={openRequests} text="Housekeeping, maintenance, concierge and security requests." />
        <OperationalLink to="/frontdesk/service-points" icon={MapPin} label="Active service visits" value={activeVisits.length} text="Start or manage restaurant, bar, marina and front-desk sales." />
        <OperationalLink to="/frontdesk/folios" icon={Banknote} label="Guest folios" value={openFolios} text="Review room balances separately from restaurant walk-in visits." />
      </section>
    </div>
  );
}

function QueueCount({ label, value, urgent }) {
  return (
    <div className={`min-w-16 rounded-md px-3 py-2 text-center ${urgent ? 'bg-amber-500/10 text-amber-700' : 'bg-app-elevated text-app-muted'}`}>
      <p className="text-lg font-black">{value}</p>
      <p className="text-[10px] font-black uppercase">{label}</p>
    </div>
  );
}

function OperationalLink({ to, icon: Icon, label, value, text }) {
  return (
    <Link to={to} className="group rounded-lg border border-app-border bg-app-card p-5 transition hover:border-brand-500/50">
      <div className="flex items-center justify-between">
        <Icon className="h-5 w-5 text-brand-500" />
        <span className="text-2xl font-black text-app-text">{value}</span>
      </div>
      <h3 className="mt-4 text-lg font-black text-app-text">{label}</h3>
      <p className="mt-2 text-sm leading-6 text-app-muted">{text}</p>
    </Link>
  );
}
