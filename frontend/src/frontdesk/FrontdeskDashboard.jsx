import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BedDouble,
  BellRing,
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Hotel,
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

const time = (value) => (value ? new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-');

const dateKey = (value) => {
  if (!value) return '';
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

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
  if (visit.orders.some((order) => ['SENT', 'PREPARING'].includes(order.status))) return 3;
  return 4;
}

function visitTime(visit) {
  return new Date(visit.updated_at || visit.arrived_at || 0).getTime() || 0;
}

function isBarVisit(visit) {
  return [visit.service_area, visit.service_point_name].filter(Boolean).join(' ').toLowerCase().includes('bar');
}

function isHotelOrRestaurantVisit(visit) {
  return !isBarVisit(visit);
}

export default function FrontdeskDashboard() {
  const { data, loading } = useFrontdeskData();

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>;

  const currentDate = today();
  const occupiedRoomList = data.rooms.filter((room) => room.status === 'OCCUPIED');
  const occupiedRooms = occupiedRoomList.length;
  const arrivalsToday = data.reservations.filter((reservation) => reservation.check_in_date === currentDate && !['CANCELLED', 'CHECKED_IN', 'CHECKED_OUT'].includes(reservation.status));
  const departuresToday = data.reservations.filter((reservation) => reservation.check_out_date === currentDate && reservation.status === 'CHECKED_IN');
  const roomReservationsToday = data.reservations.filter((reservation) => (
    reservation.room
    && reservation.status !== 'CANCELLED'
    && reservation.check_in_date <= currentDate
    && reservation.check_out_date >= currentDate
  ));
  const todaysVisits = data.visits.filter((visit) => dateKey(visit.arrived_at) === currentDate);
  const activeVisits = data.visits.filter((visit) => visit.status !== 'CLOSED');
  const sortedActiveVisits = [...activeVisits].sort((left, right) => visitPriority(left) - visitPriority(right) || visitTime(right) - visitTime(left));
  const recentTodayVisits = [...todaysVisits].sort((left, right) => visitTime(right) - visitTime(left)).slice(0, 5);
  const barQueue = sortedActiveVisits.filter(isBarVisit).slice(0, 5);
  const hotelRestaurantQueue = sortedActiveVisits.filter(isHotelOrRestaurantVisit).slice(0, 5);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-app-border bg-[#172326] p-5 text-white sm:p-6 lg:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d7b56d]">Front desk</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Today&apos;s operations</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/frontdesk/visits" className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#d7b56d] px-4 text-sm font-black text-[#172326]">
              <UsersRound className="h-4 w-4" /> Queue
            </Link>
            <Link to="/frontdesk/service-points" className="inline-flex min-h-11 items-center gap-2 rounded-md border border-white/20 px-4 text-sm font-black text-white">
              <Utensils className="h-4 w-4" /> POS
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={UsersRound} label="Visits Today" value={todaysVisits.length} color="blue" />
        <StatCard icon={MapPin} label="Active Visits" value={activeVisits.length} color="amber" />
        <StatCard icon={BedDouble} label="Occupied Rooms" value={occupiedRooms} color="emerald" />
        <StatCard icon={CalendarDays} label="Room Reservations" value={roomReservationsToday.length} color="purple" />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-600">Accommodation</p>
            <h3 className="mt-1 text-xl font-black text-app-text">Today at the hotel</h3>
          </div>
          <Link to="/frontdesk/reservations" className="text-sm font-black text-brand-600">Reservations <ArrowRight className="ml-1 inline h-4 w-4" /></Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard icon={CalendarCheck2} label="Arrivals Today" value={arrivalsToday.length} color="blue" />
          <StatCard icon={CalendarDays} label="Departures Today" value={departuresToday.length} color="purple" />
          <StatCard icon={BedDouble} label="Occupied Rooms" value={occupiedRooms} color="emerald" />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel title="Today visits" eyebrow="Live activity" action="/frontdesk/visits">
          {recentTodayVisits.length === 0 ? (
            <EmptyPanel icon={CheckCircle2} title="No visits today yet" text="New guest visits will appear here as they are opened." />
          ) : (
            <div className="divide-y divide-app-border">
              {recentTodayVisits.map((visit) => <VisitRow key={visit.id} visit={visit} />)}
            </div>
          )}
        </Panel>

        <Panel title="Room reservations" eyebrow="Rooms today" action="/frontdesk/reservations">
          {roomReservationsToday.length === 0 ? (
            <EmptyPanel icon={CalendarDays} title="No room reservations today" text="Reservations with assigned rooms for today will appear here." />
          ) : (
            <div className="divide-y divide-app-border">
              {roomReservationsToday.slice(0, 6).map((reservation) => (
                <div key={reservation.id} className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <p className="font-black text-app-text">{reservation.room_number || `Room ${reservation.room}`}</p>
                    <p className="mt-1 truncate text-sm text-app-muted">{reservation.guest_name || 'Guest'} · {reservation.reservation_number}</p>
                  </div>
                  <span className="rounded-full bg-app-elevated px-3 py-1.5 text-xs font-black text-app-muted">{reservation.status.replaceAll('_', ' ')}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <QueuePanel title="Bar queue" visits={barQueue} empty="No active bar visits" />
        <QueuePanel title="Hotel / restaurant queue" visits={hotelRestaurantQueue} empty="No active hotel or restaurant visits" />
      </section>

      <Panel title="Occupied rooms" eyebrow="Current stay">
        {occupiedRoomList.length === 0 ? (
          <EmptyPanel icon={Hotel} title="No occupied rooms" text="Rooms marked occupied will appear here." />
        ) : (
          <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {occupiedRoomList.slice(0, 6).map((room) => (
              <div key={room.id} className="rounded-md bg-app-elevated p-4">
                <p className="font-black text-app-text">Room {room.number}</p>
                <p className="mt-1 text-sm text-app-muted">{room.capacity} people{room.floor ? ` · ${room.floor}` : ''}</p>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <section className="grid gap-4 md:grid-cols-2">
        <OperationalLink to="/frontdesk/service-points" icon={MapPin} label="Active service visits" value={activeVisits.length} text="Start or manage restaurant, bar, event, cabro and front-desk sales." />
        <OperationalLink to="/frontdesk/reservations" icon={CalendarDays} label="Reservations" value={data.reservations.length} text="Review upcoming arrivals, departures, and room movements." />
      </section>
    </div>
  );
}

function Panel({ title, eyebrow, action, children }) {
  return (
    <section className="overflow-hidden rounded-lg border border-app-border bg-app-card">
      <div className="flex items-center justify-between gap-4 border-b border-app-border p-5">
        <div>
          {eyebrow ? <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-600">{eyebrow}</p> : null}
          <h3 className="mt-1 text-xl font-black text-app-text">{title}</h3>
        </div>
        {action ? (
          <Link to={action} className="text-sm font-black text-brand-600">
            Open <ArrowRight className="ml-1 inline h-4 w-4" />
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function EmptyPanel({ icon: Icon, title, text }) {
  return (
    <div className="p-8 text-center">
      <Icon className="mx-auto h-8 w-8 text-emerald-600" />
      <p className="mt-3 font-black text-app-text">{title}</p>
      <p className="mt-1 text-sm text-app-muted">{text}</p>
    </div>
  );
}

function VisitRow({ visit }) {
  const [label, Icon, style] = visitAction(visit);
  return (
    <Link to={`/frontdesk/visits/${visit.id}`} className="flex flex-col gap-4 p-4 transition hover:bg-app-elevated sm:flex-row sm:items-center sm:justify-between sm:px-5">
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
}

function QueuePanel({ title, visits, empty }) {
  const waiterCalls = visits.filter((visit) => visit.waiter_requested_at && !visit.waiter_acknowledged_at).length;
  const readyOrders = visits.filter((visit) => visit.orders.some((order) => order.status === 'READY')).length;
  const checkoutRequests = visits.filter((visit) => visit.status === 'CHECKOUT_REQUESTED').length;

  return (
    <section className="overflow-hidden rounded-lg border border-app-border bg-app-card">
      <div className="flex flex-col gap-4 border-b border-app-border p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-600">Queue</p>
          <h3 className="mt-1 text-xl font-black text-app-text">{title}</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <QueueCount label="Waiter" value={waiterCalls} urgent={waiterCalls > 0} />
          <QueueCount label="Ready" value={readyOrders} urgent={readyOrders > 0} />
          <QueueCount label="Payment" value={checkoutRequests} urgent={checkoutRequests > 0} />
        </div>
      </div>
      {visits.length === 0 ? (
        <EmptyPanel icon={CheckCircle2} title={empty} text="New POS or QR visits will appear here automatically." />
      ) : (
        <div className="divide-y divide-app-border">
          {visits.map((visit) => <VisitRow key={visit.id} visit={visit} />)}
        </div>
      )}
    </section>
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
