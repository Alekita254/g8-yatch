import { Loader2 } from 'lucide-react';

import useFrontdeskData from './useFrontdeskData';

const configs = {
  partners: {
    title: 'Guests & Customers',
    description: 'Guests, corporate clients, agents, and other people or companies the hotel serves.',
    empty: 'No guests or customers yet.',
    columns: [['Name', 'display_name'], ['Type', 'partner_type_display'], ['Email', 'email'], ['Phone', 'phone'], ['Room Charge', 'can_charge_to_room']],
  },
  rooms: {
    title: 'Rooms',
    description: 'Physical room inventory and live operational status.',
    empty: 'No rooms yet.',
    columns: [['Room', 'number'], ['Type', 'room_type_name'], ['Branch', 'branch_name'], ['Floor', 'floor'], ['Status', 'status_display']],
  },
  reservations: {
    title: 'Reservations',
    description: 'Booking lifecycle from enquiry to checked-out.',
    empty: 'No reservations yet.',
    columns: [['Reservation', 'reservation_number'], ['Guest', 'guest_name'], ['Room', 'room_number'], ['Check-in', 'check_in_date'], ['Check-out', 'check_out_date'], ['Status', 'status']],
  },
  folios: {
    title: 'Folios',
    description: 'Open guest balances and checkout lock control.',
    empty: 'No folios yet.',
    columns: [['Folio', 'folio_number'], ['Guest', 'guest_name'], ['Room', 'room_number'], ['Status', 'status'], ['Balance', 'balance_due']],
  },
  requests: {
    title: 'Service Requests',
    description: 'Housekeeping, maintenance, concierge, and SLA-driven internal requests.',
    empty: 'No service requests yet.',
    columns: [['Ticket', 'ticket_number'], ['Title', 'title'], ['Room', 'room_number'], ['Department', 'department'], ['Priority', 'priority'], ['Status', 'status']],
  },
};

function valueFor(item, key) {
  const value = item[key];
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return value || '-';
}

export default function FrontdeskListPage({ type }) {
  const { data, loading } = useFrontdeskData();
  const config = configs[type];
  const rows = data[type] || [];

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-app-border bg-app-card p-6">
        <h2 className="text-2xl font-black text-app-text">{config.title}</h2>
        <p className="mt-1 text-sm text-app-muted">{config.description}</p>
      </div>
      <div className="overflow-hidden rounded-lg border border-app-border bg-app-card">
        {rows.length === 0 ? (
          <div className="p-10 text-center text-sm font-bold text-app-muted">{config.empty}</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-app-border bg-app-elevated text-xs font-black uppercase tracking-[0.12em] text-app-muted">
              <tr>{config.columns.map(([label]) => <th key={label} className="px-4 py-3">{label}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-app-border">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-app-elevated/60">
                  {config.columns.map(([label, key]) => <td key={`${row.id}-${label}`} className="px-4 py-3 font-medium text-app-text">{valueFor(row, key)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
