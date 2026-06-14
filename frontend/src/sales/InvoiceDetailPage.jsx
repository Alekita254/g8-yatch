import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Banknote,
  Download,
  Eye,
  FileText,
  Loader2,
  MapPin,
  ReceiptText,
  UserRound,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import api from '../api';

const money = (value, currency = 'KES') => `${currency} ${Number(value || 0).toLocaleString(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}`;

function statusClass(status) {
  if (status === 'CLOSED' || status === 'CLEARED') return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
  if (status === 'PARTIALLY_PAID') return 'bg-amber-500/10 text-amber-700 dark:text-amber-300';
  return 'bg-red-500/10 text-red-700 dark:text-red-300';
}

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [receiptBusy, setReceiptBusy] = useState('');

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/sales/invoices/${id}/`);
        setInvoice(response.data);
      } catch (err) {
        toast.error(err.response?.data?.detail || 'Could not load invoice');
      } finally {
        setLoading(false);
      }
    };
    loadInvoice();
  }, [id]);

  const fetchReceipt = async () => {
    const response = await api.get(`/api/sales/invoices/${id}/receipt/`, { responseType: 'blob' });
    return new Blob([response.data], { type: 'application/pdf' });
  };

  const viewReceipt = async () => {
    try {
      setReceiptBusy('view');
      const blob = await fetchReceipt();
      const url = window.URL.createObjectURL(blob);
      const receiptWindow = window.open(url, '_blank');
      if (!receiptWindow) {
        window.URL.revokeObjectURL(url);
        toast.error('Please allow pop-ups to view the receipt');
        return;
      }
      setTimeout(() => window.URL.revokeObjectURL(url), 60000);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not open receipt');
    } finally {
      setReceiptBusy('');
    }
  };

  const downloadReceipt = async () => {
    try {
      setReceiptBusy('download');
      const blob = await fetchReceipt();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${invoice.invoice_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not download receipt');
    } finally {
      setReceiptBusy('');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>;
  }

  if (!invoice) {
    return (
      <div className="rounded-lg border border-app-border bg-app-card p-8 text-center">
        <p className="font-black text-app-text">Invoice not found</p>
        <Link to="/sales/invoices" className="mt-4 inline-flex text-sm font-black text-brand-600">Return to invoices</Link>
      </div>
    );
  }

  const order = invoice.order_details || {};
  const items = order.items || [];
  const payments = invoice.payments || [];

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-app-border bg-app-card p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Link to="/sales/invoices" className="inline-flex items-center gap-2 text-sm font-bold text-app-muted transition hover:text-app-text">
              <ArrowLeft className="h-4 w-4" />
              All invoices
            </Link>
            <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-brand-600">Sales invoice</p>
            <h2 className="mt-2 text-2xl font-black text-app-text sm:text-3xl">{invoice.invoice_number}</h2>
            <p className="mt-2 text-sm text-app-muted">
              Issued {new Date(invoice.created_at).toLocaleString()} · Order {invoice.order_number}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-2 text-xs font-black uppercase ${statusClass(invoice.status)}`}>
              {invoice.status.replaceAll('_', ' ')}
            </span>
            <button type="button" onClick={viewReceipt} disabled={Boolean(receiptBusy)} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-app-border px-4 text-sm font-black text-app-text transition hover:bg-app-elevated disabled:opacity-50">
              {receiptBusy === 'view' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
              View receipt
            </button>
            <button type="button" onClick={downloadReceipt} disabled={Boolean(receiptBusy)} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-black text-white transition hover:bg-brand-700 disabled:opacity-50">
              {receiptBusy === 'download' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Download receipt
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <SummaryCard label="Invoice total" value={money(invoice.grand_total)} />
          <SummaryCard label="Amount paid" value={money(invoice.paid_total)} positive />
          <SummaryCard label="Balance due" value={money(invoice.balance_due)} warning={Number(invoice.balance_due) > 0} />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
        <section className="rounded-lg border border-app-border bg-app-card p-5">
          <h3 className="flex items-center gap-2 text-lg font-black text-app-text"><UserRound className="h-5 w-5 text-brand-500" /> Customer</h3>
          <dl className="mt-5 space-y-4 text-sm">
            <Detail label="Guest" value={invoice.customer_name || order.customer_name || 'Walk-in guest'} />
            <Detail label="Branch" value={invoice.branch_name || 'Not assigned'} />
            <Detail label="Service point" value={order.service_point_name || 'Not assigned'} />
            <Detail label="Table / area" value={order.table_name || 'Not recorded'} />
            <Detail label="Issued by" value={invoice.issued_by_name || 'Staff member'} />
          </dl>
          {order.visit ? (
            <Link to={`/frontdesk/visits/${order.visit}`} className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-md border border-app-border px-3 text-sm font-black text-app-text transition hover:bg-app-elevated">
              <MapPin className="h-4 w-4" />
              Open guest visit
            </Link>
          ) : null}
        </section>

        <section className="overflow-hidden rounded-lg border border-app-border bg-app-card">
          <div className="border-b border-app-border bg-app-elevated px-5 py-4">
            <h3 className="flex items-center gap-2 text-lg font-black text-app-text"><FileText className="h-5 w-5 text-brand-500" /> Invoice items</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="border-b border-app-border text-xs font-black uppercase text-app-muted">
                <tr>
                  <th className="px-5 py-3">Item</th>
                  <th className="px-5 py-3">Quantity</th>
                  <th className="px-5 py-3">Unit price</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-border">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-5 py-4 font-bold text-app-text">{item.product_name}</td>
                    <td className="px-5 py-4 text-app-muted">{Number(item.quantity)}</td>
                    <td className="px-5 py-4 text-app-muted">{money(item.unit_price)}</td>
                    <td className="px-5 py-4 text-right font-black text-app-text">{money(item.line_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="ml-auto max-w-sm space-y-2 border-t border-app-border p-5 text-sm">
            <AmountLine label="Subtotal" value={money(invoice.subtotal)} />
            <AmountLine label="Tax" value={money(invoice.tax_total)} />
            <AmountLine label="Discount" value={`- ${money(invoice.discount_total)}`} />
            <AmountLine label="Total" value={money(invoice.grand_total)} strong />
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-app-border bg-app-card p-5">
        <h3 className="flex items-center gap-2 text-lg font-black text-app-text"><Banknote className="h-5 w-5 text-brand-500" /> Payment history</h3>
        {payments.length === 0 ? (
          <div className="mt-4 rounded-md border border-dashed border-app-border bg-app-elevated p-5 text-sm font-bold text-app-muted">
            No payment has been recorded for this invoice.
          </div>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {payments.map((payment) => (
              <article key={payment.id} className="rounded-lg border border-app-border bg-app-elevated p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-app-text">{payment.payment_method_name}</p>
                    <p className="mt-1 text-xs text-app-muted">{new Date(payment.created_at).toLocaleString()}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-black uppercase ${statusClass(payment.status)}`}>{payment.status}</span>
                </div>
                <p className="mt-4 text-xl font-black text-app-text">{money(payment.amount, payment.currency)}</p>
                <p className="mt-2 text-sm text-app-muted">Reference: {payment.reference || 'Not required'}</p>
                <p className="mt-1 text-sm text-app-muted">Served by: {payment.received_by_name || 'Staff member'}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-lg border border-app-border bg-app-elevated p-4 text-sm text-app-muted">
        <p className="flex items-center gap-2 font-black text-app-text"><ReceiptText className="h-4 w-4 text-brand-500" /> Fiscal status</p>
        <p className="mt-2">eTIMS: {invoice.etims_status.replaceAll('_', ' ')}{invoice.synced_at ? ` · Synced ${new Date(invoice.synced_at).toLocaleString()}` : ''}</p>
      </section>
    </div>
  );
}

function SummaryCard({ label, value, positive = false, warning = false }) {
  const color = positive ? 'text-emerald-700 dark:text-emerald-300' : warning ? 'text-red-700 dark:text-red-300' : 'text-app-text';
  return (
    <div className="rounded-lg border border-app-border bg-app-elevated p-4">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-app-muted">{label}</p>
      <p className={`mt-2 text-xl font-black ${color}`}>{value}</p>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-black uppercase tracking-[0.12em] text-app-muted">{label}</dt>
      <dd className="mt-1 font-bold text-app-text">{value}</dd>
    </div>
  );
}

function AmountLine({ label, value, strong = false }) {
  return (
    <div className={`flex items-center justify-between gap-4 ${strong ? 'border-t border-app-border pt-3 text-base font-black text-app-text' : 'text-app-muted'}`}>
      <span>{label}</span>
      <span className={strong ? '' : 'font-bold text-app-text'}>{value}</span>
    </div>
  );
}
