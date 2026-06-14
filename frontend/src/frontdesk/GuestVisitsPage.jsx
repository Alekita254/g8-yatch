import { useCallback, useEffect, useState } from 'react';
import { Banknote, BellRing, CheckCircle2, Clock3, Loader2, ReceiptText, RefreshCw, UsersRound } from 'lucide-react';
import { toast } from 'react-hot-toast';

import api from '../api';

const money = (value) => `KES ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const nextStatus = {
  SENT: ['PREPARING', 'Start preparing'],
  PREPARING: ['READY', 'Mark ready'],
  READY: ['SERVED', 'Mark served'],
};

export default function GuestVisitsPage() {
  const [visits, setVisits] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState('');
  const [payments, setPayments] = useState({});

  const load = useCallback(async () => {
    try {
      const [visitsResponse, methodsResponse] = await Promise.all([
        api.get('/api/sales/visits/', { params: { page_size: 100 } }),
        api.get('/api/payments/methods/', { params: { page_size: 100 } }),
      ]);
      setVisits((visitsResponse.data.results || []).filter((visit) => visit.status !== 'CLOSED'));
      setPaymentMethods((methodsResponse.data.results || []).filter((method) => method.is_active && !method.requires_room_verification));
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to load guest visits');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = window.setInterval(load, 15000);
    return () => window.clearInterval(interval);
  }, [load]);

  const progressOrder = async (order) => {
    const transition = nextStatus[order.status];
    if (!transition) return;
    try {
      setWorking(`order-${order.id}`);
      await api.post(`/api/sales/orders/${order.id}/status/`, { status: transition[0] });
      await load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not update the order');
    } finally {
      setWorking('');
    }
  };

  const acknowledgeWaiter = async (visit) => {
    try {
      setWorking(`waiter-${visit.id}`);
      await api.post(`/api/sales/visits/${visit.id}/waiter-acknowledge/`);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not acknowledge the waiter request');
    } finally {
      setWorking('');
    }
  };

  const collectPayment = async (invoice) => {
    const entry = payments[invoice.id] || {};
    if (!entry.method) {
      toast.error('Choose a payment method');
      return;
    }
    const method = paymentMethods.find((item) => String(item.id) === String(entry.method));
    if (method?.requires_reference && !entry.reference?.trim()) {
      toast.error(`${method.name} requires a reference`);
      return;
    }
    try {
      setWorking(`invoice-${invoice.id}`);
      await api.post('/api/sales/payments/', {
        invoice: invoice.id,
        payment_method: entry.method,
        amount: invoice.balance_due,
        reference: entry.reference || '',
      });
      toast.success('Payment collected and visit updated');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not collect payment');
    } finally {
      setWorking('');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-lg border border-app-border bg-app-card p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-3 text-2xl font-black text-app-text"><UsersRound className="h-6 w-6 text-brand-500" /> Live Guest Visits</h2>
          <p className="mt-1 text-sm text-app-muted">Track arrival, table service, preparation, billing and payment as one journey.</p>
        </div>
        <button type="button" onClick={load} className="inline-flex items-center justify-center gap-2 rounded-md border border-app-border px-4 py-2 text-sm font-bold text-app-text hover:bg-app-elevated">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </section>

      {visits.length === 0 ? (
        <div className="rounded-lg border border-app-border bg-app-card p-10 text-center text-sm font-bold text-app-muted">No active guest visits.</div>
      ) : visits.map((visit) => (
        <article key={visit.id} className="rounded-lg border border-app-border bg-app-card p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-brand-500">{visit.visit_number}</p>
              <h3 className="mt-2 text-xl font-black text-app-text">{visit.service_area}, {visit.table_name}</h3>
              <p className="mt-1 text-sm text-app-muted">{visit.guest_name || 'Walk-in guest'}{visit.phone ? ` · ${visit.phone}` : ''}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {visit.waiter_requested_at && !visit.waiter_acknowledged_at && (
                <button type="button" disabled={working === `waiter-${visit.id}`} onClick={() => acknowledgeWaiter(visit)} className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-2 text-xs font-black text-amber-700 disabled:opacity-50">
                  <BellRing className="h-4 w-4" /> Acknowledge waiter call
                </button>
              )}
              {visit.waiter_acknowledged_at && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-2 text-xs font-black text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Waiter responding</span>}
              <span className="rounded-full bg-brand-500/10 px-3 py-2 text-xs font-black text-brand-600">{visit.status.replaceAll('_', ' ')}</span>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {visit.orders.map((order) => (
              <div key={order.id} className="rounded-lg bg-app-elevated p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-app-text">{order.order_number}</p>
                    <p className="mt-1 flex items-center gap-2 text-sm font-bold text-app-muted"><Clock3 className="h-4 w-4" /> {order.status}</p>
                  </div>
                  <strong className="text-brand-600">{money(order.grand_total)}</strong>
                </div>
                <div className="mt-3 space-y-1 text-sm text-app-muted">
                  {order.items.map((item) => <p key={item.id}>{Number(item.quantity)} × {item.product_name}</p>)}
                </div>
                {nextStatus[order.status] && (
                  <button type="button" disabled={working === `order-${order.id}`} onClick={() => progressOrder(order)} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">
                    {working === `order-${order.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    {nextStatus[order.status][1]}
                  </button>
                )}
                {order.invoice?.balance_due > 0 && (
                  <div className="mt-4 border-t border-app-border pt-4">
                    <p className="flex items-center justify-between text-sm font-black text-app-text"><span className="flex items-center gap-2"><ReceiptText className="h-4 w-4" /> {order.invoice.invoice_number}</span><span>{money(order.invoice.balance_due)} due</span></p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <select value={payments[order.invoice.id]?.method || ''} onChange={(event) => setPayments((current) => ({ ...current, [order.invoice.id]: { ...current[order.invoice.id], method: event.target.value } }))} className="rounded-md border border-app-border bg-app-card px-3 py-2 text-sm">
                        <option value="">Payment method</option>
                        {paymentMethods.map((method) => <option key={method.id} value={method.id}>{method.name}</option>)}
                      </select>
                      <input value={payments[order.invoice.id]?.reference || ''} onChange={(event) => setPayments((current) => ({ ...current, [order.invoice.id]: { ...current[order.invoice.id], reference: event.target.value } }))} placeholder="Reference if required" className="rounded-md border border-app-border bg-app-card px-3 py-2 text-sm" />
                    </div>
                    <button type="button" disabled={working === `invoice-${order.invoice.id}`} onClick={() => collectPayment(order.invoice)} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">
                      {working === `invoice-${order.invoice.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Banknote className="h-4 w-4" />} Collect payment
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
