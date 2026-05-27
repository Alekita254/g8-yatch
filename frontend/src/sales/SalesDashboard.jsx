import { Link } from 'react-router-dom';
import { Banknote, ClipboardList, Loader2, ReceiptText, RefreshCw } from 'lucide-react';

import StatCard from '../components/StatCard';
import useSalesData from './useSalesData';

export default function SalesDashboard() {
  const { data, loading } = useSalesData();

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>;
  }

  const openOrders = data.orders.filter((order) => ['DRAFT', 'SENT'].includes(order.status)).length;
  const unpaidInvoices = data.invoices.filter((invoice) => invoice.status !== 'CLOSED').length;
  const pendingEtims = data.invoices.filter((invoice) => invoice.etims_status === 'PENDING_SYNC').length;
  const clearedPayments = data.payments.filter((payment) => payment.status === 'CLEARED').length;

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-app-border bg-[#172326] p-8 text-white">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d7b56d]">Sales state machine</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">Move transactions from editable orders to locked fiscal invoices.</h2>
        <p className="mt-4 max-w-3xl text-sm font-medium leading-7 text-white/68">
          Sales has its own workspace: orders, kitchen send state, immutable invoices, payment balancing, offline eTIMS sync, and corporate payment runs.
        </p>
      </section>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={ClipboardList} label="Open Orders" value={openOrders} color="emerald" />
        <StatCard icon={ReceiptText} label="Unpaid Invoices" value={unpaidInvoices} color="amber" />
        <StatCard icon={RefreshCw} label="Pending eTIMS Sync" value={pendingEtims} color="blue" />
        <StatCard icon={Banknote} label="Cleared Payments" value={clearedPayments} color="purple" />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          ['Orders', '/sales/orders', 'Draft tabs, table transfers, kitchen send, void guardrails.'],
          ['Invoices', '/sales/invoices', 'Locked fiscal documents and eTIMS sync status.'],
          ['Payments', '/sales/payments', 'Split settlement and invoice balance tracking.'],
          ['Payment Runs', '/sales/payment-runs', 'FIFO corporate ledger settlement.'],
        ].map(([title, path, text]) => (
          <Link key={path} to={path} className="rounded-lg border border-app-border bg-app-card p-5 transition hover:border-brand-500/50">
            <h3 className="text-lg font-black text-app-text">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-app-muted">{text}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
