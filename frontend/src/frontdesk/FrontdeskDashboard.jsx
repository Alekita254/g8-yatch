import { Link } from 'react-router-dom';
import { ArrowRight, BedDouble, BellRing, BriefcaseBusiness, CalendarDays, ClipboardList, Loader2, MapPin, ReceiptText, UsersRound } from 'lucide-react';

import StatCard from '../components/StatCard';
import useFrontdeskData from './useFrontdeskData';

export default function FrontdeskDashboard() {
  const { data, loading } = useFrontdeskData();

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>;

  const occupiedRooms = data.rooms.filter((room) => room.status === 'OCCUPIED').length;
  const arrivals = data.reservations.filter((reservation) => ['CONFIRMED', 'TENTATIVE'].includes(reservation.status)).length;
  const openFolios = data.folios.filter((folio) => folio.status === 'OPEN').length;
  const openRequests = data.requests.filter((request) => request.status !== 'RESOLVED').length;
  const activeVisits = data.visits.filter((visit) => visit.status !== 'CLOSED');
  const waiterCalls = activeVisits.filter((visit) => visit.waiter_requested_at && !visit.waiter_acknowledged_at).length;
  const checkoutRequests = activeVisits.filter((visit) => visit.status === 'CHECKOUT_REQUESTED').length;

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-app-border bg-[#172326] p-5 text-white sm:p-6 lg:p-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d7b56d]">Space and time control</p>
        <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl md:text-4xl">Frontdesk coordinates rooms, guests, folios, and internal requests.</h2>
        <p className="mt-4 max-w-3xl text-sm font-medium leading-7 text-white/68">
          This workspace composes independent backend domains: Business Partners, Rooms, Reservations, Folios, and Concierge.
        </p>
      </section>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={BedDouble} label="Occupied Rooms" value={occupiedRooms} color="emerald" />
        <StatCard icon={CalendarDays} label="Upcoming Holds" value={arrivals} color="blue" />
        <StatCard icon={ReceiptText} label="Open Folios" value={openFolios} color="amber" />
        <StatCard icon={ClipboardList} label="Open Requests" value={openRequests} color="purple" />
      </div>

      <Link to="/frontdesk/visits" className="group block rounded-lg border border-brand-500/35 bg-brand-500/10 p-5 transition hover:border-brand-500 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-white">
              <UsersRound className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-600">Guest journey control</p>
              <h3 className="mt-2 text-2xl font-black text-app-text">{activeVisits.length} live visit{activeVisits.length === 1 ? '' : 's'}</h3>
              <p className="mt-1 text-sm text-app-muted">Follow arrival, waiter response, food preparation, billing, payment and departure.</p>
            </div>
          </div>
          <span className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-bold text-white">
            Open Live Visits <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </span>
        </div>
        <div className="mt-5 grid gap-3 border-t border-brand-500/20 pt-5 sm:grid-cols-3">
          <JourneyCount label="Active now" value={activeVisits.length} icon={UsersRound} />
          <JourneyCount label="Waiter calls" value={waiterCalls} icon={BellRing} urgent={waiterCalls > 0} />
          <JourneyCount label="Ready to pay" value={checkoutRequests} icon={ReceiptText} urgent={checkoutRequests > 0} />
        </div>
      </Link>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-app-border bg-app-card p-5">
          <BriefcaseBusiness className="h-5 w-5 text-brand-500" />
          <p className="mt-4 text-2xl font-black text-app-text">{data.partners.length}</p>
          <p className="text-xs font-bold uppercase text-app-muted">Guests & customers</p>
        </div>
        <div className="rounded-lg border border-app-border bg-app-card p-5">
          <BedDouble className="h-5 w-5 text-brand-500" />
          <p className="mt-4 text-2xl font-black text-app-text">{data.rooms.length}</p>
          <p className="text-xs font-bold uppercase text-app-muted">Rooms</p>
        </div>
        <div className="rounded-lg border border-app-border bg-app-card p-5">
          <CalendarDays className="h-5 w-5 text-brand-500" />
          <p className="mt-4 text-2xl font-black text-app-text">{data.reservations.length}</p>
          <p className="text-xs font-bold uppercase text-app-muted">Reservations</p>
        </div>
      </div>

      <div className="grid gap-4">
        <Link to="/frontdesk/service-points" className="rounded-lg border border-app-border bg-app-card p-5 transition hover:border-brand-500/50">
          <MapPin className="h-5 w-5 text-brand-500" />
          <h3 className="mt-4 text-xl font-black text-app-text">Service Points</h3>
          <p className="mt-2 text-sm leading-6 text-app-muted">Open the right POS for the bar, restaurant, marina, or hotel frontdesk.</p>
        </Link>
      </div>
    </div>
  );
}

function JourneyCount({ label, value, icon: Icon, urgent = false }) {
  return (
    <div className={`flex items-center gap-3 rounded-md p-3 ${urgent ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300' : 'bg-app-card text-app-text'}`}>
      <Icon className="h-5 w-5" />
      <div>
        <p className="text-xl font-black">{value}</p>
        <p className="text-xs font-bold uppercase opacity-70">{label}</p>
      </div>
    </div>
  );
}
