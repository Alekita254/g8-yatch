import { Loader2 } from 'lucide-react';

import useSalesData from './useSalesData';

const configs = {
  orders: {
    title: 'Sales Orders',
    description: 'Editable draft orders, table movement, kitchen send state, and void-controlled items.',
    empty: 'No sales orders yet.',
    columns: [
      ['Order', 'order_number'],
      ['Customer', 'customer_name'],
      ['Service point', 'service_point_name'],
      ['Table', 'table_name'],
      ['Status', 'status'],
      ['Total', 'grand_total'],
    ],
  },
  invoices: {
    title: 'Sales Invoices',
    description: 'Immutable fiscal records created from orders. Mistakes should become credit notes later, not edits.',
    empty: 'No invoices yet.',
    columns: [
      ['Invoice', 'invoice_number'],
      ['Order', 'order_number'],
      ['Customer', 'customer_name'],
      ['Status', 'status'],
      ['eTIMS', 'etims_status'],
      ['Balance', 'balance_due'],
    ],
  },
  payments: {
    title: 'Payments',
    description: 'Split settlement records that move invoices from unpaid to partially paid to closed.',
    empty: 'No payments yet.',
    columns: [
      ['Method', 'payment_method_name'],
      ['Amount', 'amount'],
      ['Currency', 'currency'],
      ['Reference', 'reference'],
      ['Status', 'status'],
      ['Created', 'created_at'],
    ],
  },
  paymentRuns: {
    title: 'Customer Payment Runs',
    description: 'Corporate FIFO payment batches that apply one deposit across many invoices.',
    empty: 'No payment runs yet.',
    columns: [
      ['Run', 'run_number'],
      ['Customer', 'customer_name'],
      ['Amount', 'amount'],
      ['Unapplied', 'unapplied_amount'],
      ['Status', 'status'],
      ['Allocations', 'allocation_count'],
    ],
  },
};

function valueFor(item, key) {
  const value = item[key];
  if (!value) return '-';
  if (key.endsWith('_at')) return new Date(value).toLocaleString();
  return value;
}

export default function SalesListPage({ type }) {
  const { data, loading } = useSalesData();
  const config = configs[type];
  const rows = data[type] || [];

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>;
  }

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
              <tr>
                {config.columns.map(([label]) => <th key={label} className="px-4 py-3">{label}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-app-border">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-app-elevated/60">
                  {config.columns.map(([label, key]) => (
                    <td key={`${row.id}-${label}`} className="px-4 py-3 font-medium text-app-text">{valueFor(row, key)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
