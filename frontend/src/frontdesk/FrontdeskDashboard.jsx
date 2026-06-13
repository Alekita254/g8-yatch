import { Link } from 'react-router-dom';
import { BedDouble, BriefcaseBusiness, CalendarDays, ClipboardList, Loader2, MapPin, ReceiptText } from 'lucide-react';

import StatCard from '../components/StatCard';
import useFrontdeskData from './useFrontdeskData';

export default function FrontdeskDashboard() {
  const { data, loading } = useFrontdeskData();

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>;

  const occupiedRooms = data.rooms.filter((room) => room.status === 'OCCUPIED').length;
  const arrivals = data.reservations.filter((reservation) => ['CONFIRMED', 'TENTATIVE'].includes(reservation.status)).length;
  const openFolios = data.folios.filter((folio) => folio.status === 'OPEN').length;
  const openRequests = data.requests.filter((request) => request.status !== 'RESOLVED').length;

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
