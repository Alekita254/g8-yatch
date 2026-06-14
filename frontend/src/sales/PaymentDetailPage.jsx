import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Banknote, Download, Eye, FileText, Loader2, MapPin, ReceiptText, UserRound } from 'lucide-react';
import { toast } from 'react-hot-toast';

import api from '../api';

const money = (value, currency = 'KES') => `${currency} ${Number(value || 0).toLocaleString(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}`;

export default function PaymentDetailPage() {
  const { id } = useParams();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [receiptBusy, setReceiptBusy] = useState('');

  useEffect(() => {
    const loadPayment = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/sales/payments/${id}/`);
        setPayment(response.data);
      } catch (err) {
        toast.error(err.response?.data?.detail || 'Could not load payment');
      } finally {
        setLoading(false);
      }
    };
    loadPayment();
  }, [id]);

  const getReceipt = async () => {
    const response = await api.get(`/api/sales/invoices/${payment.invoice}/receipt/`, { responseType: 'blob' });
    return new Blob([response.data], { type: 'application/pdf' });
  };

  const viewReceipt = async () => {
    try {
      setReceiptBusy('view');
      const url = window.URL.createObjectURL(await getReceipt());
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
      const url = window.URL.createObjectURL(await getReceipt());
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${payment.invoice_number}.pdf`;
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

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>;
  if (!payment) return <div className="rounded-lg border border-app-border bg-app-card p-8 text-center font-black text-app-text">Payment not found</div>;

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-app-border bg-app-card p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Link to="/sales/payments" className="inline-flex items-center gap-2 text-sm font-bold text-app-muted hover:text-app-text">
              <ArrowLeft className="h-4 w-4" /> All payments
            </Link>
            <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-brand-600">Payment record</p>
            <h2 className="mt-2 text-3xl font-black text-app-text">{money(payment.amount, payment.currency)}</h2>
            <p className="mt-2 text-sm text-app-muted">Received {new Date(payment.created_at).toLocaleString()}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-emerald-500/10 px-3 py-2 text-xs font-black uppercase text-emerald-700 dark:text-emerald-300">{payment.status}</span>
            <button type="button" onClick={viewReceipt} disabled={Boolean(receiptBusy)} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-app-border px-4 text-sm font-black text-app-text hover:bg-app-elevated disabled:opacity-50">
              {receiptBusy === 'view' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />} View receipt
            </button>
            <button type="button" onClick={downloadReceipt} disabled={Boolean(receiptBusy)} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-black text-white disabled:opacity-50">
              {receiptBusy === 'download' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Download receipt
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-app-border bg-app-card p-5">
          <h3 className="flex items-center gap-2 text-lg font-black text-app-text"><Banknote className="h-5 w-5 text-brand-500" /> Settlement</h3>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <Detail label="Payment method" value={payment.payment_method_name} />
            <Detail label="Reference" value={payment.reference || 'Not required'} />
            <Detail label="Served by" value={payment.received_by_name || 'Staff member'} />
            <Detail label="Payment status" value={payment.status} />
          </dl>
        </section>

        <section className="rounded-lg border border-app-border bg-app-card p-5">
          <h3 className="flex items-center gap-2 text-lg font-black text-app-text"><UserRound className="h-5 w-5 text-brand-500" /> Guest and location</h3>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <Detail label="Guest" value={payment.customer_name || 'Walk-in guest'} />
            <Detail label="Service point" value={payment.service_point_name || 'Not assigned'} />
            <Detail label="Table / area" value={payment.table_name || 'Not recorded'} />
            <Detail label="Order" value={payment.order_number} />
          </dl>
          {payment.visit ? (
            <Link to={`/frontdesk/visits/${payment.visit}`} className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-md border border-app-border px-3 text-sm font-black text-app-text hover:bg-app-elevated">
              <MapPin className="h-4 w-4" /> Open guest visit
            </Link>
          ) : null}
        </section>
      </div>

      <section className="rounded-lg border border-app-border bg-app-card p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-lg font-black text-app-text"><ReceiptText className="h-5 w-5 text-brand-500" /> Invoice {payment.invoice_number}</p>
            <p className="mt-1 text-sm text-app-muted">This payment was applied to the invoice below.</p>
          </div>
          <Link to={`/sales/invoices/${payment.invoice}`} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-black text-white">
            <FileText className="h-4 w-4" /> Open invoice
          </Link>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Summary label="Invoice total" value={money(payment.invoice_total)} />
          <Summary label="Paid to date" value={money(payment.invoice_paid_total)} />
          <Summary label="Balance due" value={money(payment.invoice_balance_due)} warning={Number(payment.invoice_balance_due) > 0} />
        </div>
      </section>

      <section className="rounded-lg border border-app-border bg-app-elevated p-4 text-sm text-app-muted">
        Payment #{payment.id} · Invoice status {payment.invoice_status.replaceAll('_', ' ')}
      </section>
    </div>
  );
}

function Detail({ label, value }) {
  return <div><dt className="text-xs font-black uppercase text-app-muted">{label}</dt><dd className="mt-1 text-sm font-bold text-app-text">{value}</dd></div>;
}

function Summary({ label, value, warning = false }) {
  return <div className="rounded-lg border border-app-border bg-app-elevated p-4"><p className="text-xs font-black uppercase text-app-muted">{label}</p><p className={`mt-2 text-xl font-black ${warning ? 'text-red-700 dark:text-red-300' : 'text-app-text'}`}>{value}</p></div>;
}
