import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Banknote, BellRing, CheckCircle2, Circle, Clock3, Loader2, MapPin, ReceiptText, RefreshCw, Utensils, UsersRound } from 'lucide-react';
import { toast } from 'react-hot-toast';

import api from '../api';

const money = (value) => `KES ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const nextStatus = {
  SENT: ['PREPARING', 'Start preparing'],
  PREPARING: ['READY', 'Mark ready'],
  READY: ['SERVED', 'Mark served'],
};
const filters = [
  ['ALL', 'All active'],
  ['ATTENTION', 'Needs attention'],
  ['SERVICE', 'In service'],
  ['PAYMENT', 'Checkout'],
];

function visitPriority(visit) {
  if (visit.status === 'CHECKOUT_REQUESTED') return 0;
  if (visit.waiter_requested_at && !visit.waiter_acknowledged_at) return 1;
  if (visit.orders.some((order) => order.status === 'READY')) return 2;
  return 3;
}

function visitMatchesFilter(visit, filter) {
  if (filter === 'ATTENTION') {
    return visit.status === 'CHECKOUT_REQUESTED'
      || (visit.waiter_requested_at && !visit.waiter_acknowledged_at)
      || visit.orders.some((order) => order.status === 'READY');
  }
  if (filter === 'SERVICE') return visit.status === 'ACTIVE';
  if (filter === 'PAYMENT') return visit.status === 'CHECKOUT_REQUESTED';
  return true;
}

function currentJourneyStep(visit) {
  if (visit.status === 'CLOSED') return 5;
  if (visit.status === 'CHECKOUT_REQUESTED') return 4;
  if (visit.orders.some((order) => order.status === 'SERVED' || order.status === 'INVOICED')) return 3;
  if (visit.orders.length) return 2;
  if (visit.waiter_acknowledged_at) return 1;
  return 0;
}

function nextActionFor(visit) {
  if (visit.status === 'CHECKOUT_REQUESTED') return ['Collect payment', 'The guest has requested the bill.'];
  if (visit.waiter_requested_at && !visit.waiter_acknowledged_at) return ['Acknowledge waiter call', 'The guest is waiting for someone to respond.'];
  if (visit.orders.some((order) => order.status === 'READY')) return ['Deliver ready order', 'Food or drinks are ready for the table.'];
  if (visit.orders.some((order) => order.status === 'PREPARING')) return ['Monitor preparation', 'The order is currently being prepared.'];
  if (visit.orders.some((order) => order.status === 'SENT')) return ['Start preparing', 'The kitchen or bar has received the order.'];
  if (visit.orders.some((order) => order.status === 'SERVED')) return ['Guest dining', 'Wait for another request or checkout.'];
  return ['Welcome the guest', 'No order or waiter request has been made yet.'];
}

export default function GuestVisitsPage() {
  const [visits, setVisits] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState('');
  const [payments, setPayments] = useState({});
  const [filter, setFilter] = useState('ALL');
  const [mode, setMode] = useState('LIVE'); // LIVE or HISTORY

  const load = useCallback(async () => {
    try {
      const [visitsResponse, methodsResponse] = await Promise.all([
        api.get('/api/sales/visits/', { params: { page_size: 200 } }),
        api.get('/api/payments/methods/', { params: { page_size: 100 } }),
      ]);
      const all = visitsResponse.data.results || [];
      setVisits(mode === 'HISTORY' ? all.filter((v) => v.status === 'CLOSED') : all.filter((v) => v.status !== 'CLOSED'));
      setPaymentMethods((methodsResponse.data.results || []).filter((method) => method.is_active && !method.requires_room_verification));
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to load guest stays');
    } finally {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() => {
    load();
    const interval = window.setInterval(load, 5000);
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

  const visibleVisits = visits
    .filter((visit) => visitMatchesFilter(visit, filter))
    .sort((left, right) => visitPriority(left) - visitPriority(right));
  const attentionCount = visits.filter((visit) => visitMatchesFilter(visit, 'ATTENTION')).length;
  const checkoutCount = visits.filter((visit) => visit.status === 'CHECKOUT_REQUESTED').length;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-lg border border-app-border bg-app-card p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-3 text-2xl font-black text-app-text"><UsersRound className="h-6 w-6 text-brand-500" /> Guest Stays</h2>
          <p className="mt-1 text-sm text-app-muted">Start at the top. Stays needing action are shown first and refresh every five seconds.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-md border border-app-border bg-app-card p-1">
            <button type="button" onClick={() => setMode('LIVE')} className={`px-3 py-2 text-sm font-bold ${mode === 'LIVE' ? 'bg-brand-600 text-white' : 'text-app-text'}`}>Live</button>
            <button type="button" onClick={() => setMode('HISTORY')} className={`px-3 py-2 text-sm font-bold ${mode === 'HISTORY' ? 'bg-brand-600 text-white' : 'text-app-text'}`}>History</button>
          </div>
          <button type="button" onClick={load} className="inline-flex items-center justify-center gap-2 rounded-md border border-app-border px-4 py-2 text-sm font-bold text-app-text hover:bg-app-elevated">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <SummaryCard label={mode === 'HISTORY' ? 'Past stays' : 'Active stays'} value={visits.length} icon={UsersRound} />
        <SummaryCard label="Need attention" value={attentionCount} icon={BellRing} urgent={attentionCount > 0} />
        <SummaryCard label="Checkout requests" value={checkoutCount} icon={ReceiptText} urgent={checkoutCount > 0} />
      </section>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map(([value, label]) => (
          <button key={value} type="button" onClick={() => setFilter(value)} className={`min-h-11 shrink-0 rounded-full px-4 text-sm font-bold transition ${filter === value ? 'bg-brand-600 text-white' : 'border border-app-border bg-app-card text-app-muted hover:text-app-text'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-app-border bg-app-card">
        <table className="w-full table-auto text-left">
          <thead>
            <tr className="bg-app-elevated">
              <th className="px-4 py-3 text-xs font-black uppercase text-app-muted">Visit</th>
              <th className="px-4 py-3 text-xs font-black uppercase text-app-muted">Guest</th>
              <th className="px-4 py-3 text-xs font-black uppercase text-app-muted">Table</th>
              <th className="px-4 py-3 text-xs font-black uppercase text-app-muted">Status</th>
              <th className="px-4 py-3 text-xs font-black uppercase text-app-muted">Arrived</th>
              <th className="px-4 py-3 text-xs font-black uppercase text-app-muted">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleVisits.map((visit) => (
              <tr key={visit.id} className="border-t hover:bg-app-elevated">
                <td className="px-4 py-3"><Link to={`/frontdesk/visits/${visit.id}`} className="font-black text-app-text">{visit.visit_number}</Link></td>
                <td className="px-4 py-3 text-sm text-app-muted">{visit.guest_name || 'Walk-in'}</td>
                <td className="px-4 py-3 text-sm text-app-muted">{visit.service_area} · {visit.table_name}</td>
                <td className="px-4 py-3 text-sm"><span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-black text-brand-600">{visit.status.replaceAll('_', ' ')}</span></td>
                <td className="px-4 py-3 text-sm text-app-muted">{new Date(visit.arrived_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                <td className="px-4 py-3 text-sm"><Link to={`/frontdesk/visits/${visit.id}`} className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-3 py-2 text-xs font-bold text-white">Open</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {visibleVisits.length === 0 ? (
        <div className="rounded-lg border border-app-border bg-app-card p-10 text-center text-sm font-bold text-app-muted">No {mode === 'HISTORY' ? 'past' : 'active'} guest stays.</div>
      ) : visibleVisits.map((visit) => {
        const [nextAction, actionDetail] = nextActionFor(visit);
        return (
        <article key={visit.id} className={`overflow-hidden rounded-lg border bg-app-card ${visitPriority(visit) < 3 ? 'border-amber-500/60' : 'border-app-border'}`}>
          <div className={`px-5 py-3 text-sm sm:px-6 ${visitPriority(visit) < 3 ? 'bg-amber-500/12' : 'bg-app-elevated'}`}>
            <p className="font-black text-app-text">Next: {nextAction}</p>
            <p className="mt-0.5 text-xs text-app-muted">{actionDetail}</p>
          </div>
          <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-brand-500">{visit.visit_number}</p>
              <h3 className="mt-2 text-xl font-black text-app-text">{visit.service_area}, {visit.table_name}</h3>
              <p className="mt-1 text-sm text-app-muted">{visit.guest_name || 'Walk-in guest'}{visit.phone ? ` · ${visit.phone}` : ''} · {new Date(visit.arrived_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
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

          <JourneyTimeline currentStep={currentJourneyStep(visit)} />

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {visit.orders.length === 0 && (
              <div className="rounded-lg border border-dashed border-app-border bg-app-elevated p-5 text-center lg:col-span-2">
                <MapPin className="mx-auto h-6 w-6 text-brand-500" />
                <p className="mt-3 font-black text-app-text">Guest has arrived</p>
                <p className="mt-1 text-sm text-app-muted">No food, drink, waiter, or checkout request yet.</p>
              </div>
            )}
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
          {visit.feedback_rating && (
            <p className="mt-4 rounded-md bg-brand-500/10 p-3 text-sm font-bold text-app-text">
              Guest feedback: {visit.feedback_rating}/5{visit.feedback_comment ? ` · ${visit.feedback_comment}` : ''}
            </p>
          )}
          </div>
        </article>
      )})}
    </div>
  );
}

function JourneyTimeline({ currentStep }) {
  const steps = [
    ['Arrived', MapPin],
    ['Waiter', BellRing],
    ['Ordered', Utensils],
    ['Served', CheckCircle2],
    ['Checkout', ReceiptText],
    ['Paid', Banknote],
  ];

  return (
    <div className="mt-6 overflow-x-auto pb-2">
      <div className="flex min-w-[620px] items-start">
        {steps.map(([label, Icon], index) => {
          const complete = index <= currentStep;
          return (
            <div key={label} className="relative flex flex-1 flex-col items-center text-center">
              {index > 0 && <span className={`absolute right-1/2 top-5 h-0.5 w-full ${index <= currentStep ? 'bg-brand-500' : 'bg-app-border'}`} />}
              <span className={`relative z-[1] flex h-10 w-10 items-center justify-center rounded-full border-2 ${complete ? 'border-brand-500 bg-brand-500 text-white' : 'border-app-border bg-app-card text-app-muted'}`}>
                {complete ? <Icon className="h-4 w-4" /> : <Circle className="h-3 w-3" />}
              </span>
              <span className={`mt-2 text-xs font-black uppercase ${complete ? 'text-app-text' : 'text-app-muted'}`}>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon, urgent = false }) {
  return (
    <div className={`rounded-lg border p-4 ${urgent ? 'border-amber-500/50 bg-amber-500/10' : 'border-app-border bg-app-card'}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-black text-app-text">{value}</p>
          <p className="mt-1 text-xs font-bold uppercase text-app-muted">{label}</p>
        </div>
        <Icon className={`h-6 w-6 ${urgent ? 'text-amber-600' : 'text-brand-500'}`} />
      </div>
    </div>
  );
}
