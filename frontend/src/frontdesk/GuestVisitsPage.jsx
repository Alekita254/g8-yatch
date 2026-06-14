import { useCallback, useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { Link } from 'react-router-dom';
import { BellRing, Loader2, ReceiptText, RefreshCw, UsersRound } from 'lucide-react';
import { toast } from 'react-hot-toast';

import api from '../api';
import VisitCheckoutModal from './VisitCheckoutModal';

const filters = [
  ['ALL', 'All active'],
  ['ATTENTION', 'Needs attention'],
  ['SERVICE', 'In service'],
  ['PAYMENT', 'Checkout'],
];

async function downloadReceipt(invoice) {
  const response = await api.get(`/api/sales/invoices/${invoice.id}/receipt/`, {
    responseType: 'blob',
  });
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${invoice.invoice_number}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

function visitStage(visit) {
  if (visit.status === 'CLOSED') return 'Paid and closed';
  if (visit.status === 'CHECKOUT_REQUESTED') return 'Checkout';
  if (visit.orders.some((order) => order.status === 'READY')) return 'Ready to serve';
  if (visit.orders.some((order) => order.status === 'PREPARING')) return 'Preparing';
  if (visit.orders.some((order) => order.status === 'SENT')) return 'Order received';
  if (visit.orders.some((order) => ['SERVED', 'INVOICED'].includes(order.status))) return 'Guest dining';
  if (visit.waiter_acknowledged_at) return 'Waiter responding';
  if (visit.waiter_requested_at) return 'Waiter requested';
  return 'Arrived';
}

function nextAction(visit) {
  if (visit.status === 'CLOSED') return 'Review receipt';
  if (visit.status === 'CHECKOUT_REQUESTED') return 'Collect payment';
  if (visit.waiter_requested_at && !visit.waiter_acknowledged_at) return 'Acknowledge guest';
  if (visit.orders.some((order) => order.status === 'READY')) return 'Serve order';
  if (visit.orders.some((order) => order.status === 'PREPARING')) return 'Monitor kitchen';
  if (visit.orders.some((order) => order.status === 'SENT')) return 'Start preparation';
  if (visit.orders.some((order) => order.status === 'SERVED')) return 'Check on guest';
  return 'Welcome guest';
}

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

export default function GuestVisitsPage() {
  const [visits, setVisits] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState('');
  const auth = useAuth();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutTarget, setCheckoutTarget] = useState(null);
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
      toast.error(err.response?.data?.detail || 'Failed to load guest visits');
    } finally {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() => {
    if (auth.isLoading || !auth.isAuthenticated) return;
    load();
    const interval = window.setInterval(load, 5000);
    return () => window.clearInterval(interval);
  }, [auth.isLoading, auth.isAuthenticated, load]);

  const openCheckout = (visit) => {
    setCheckoutTarget(visit);
    setCheckoutOpen(true);
  };

  const closeCheckout = () => {
    setCheckoutTarget(null);
    setCheckoutOpen(false);
  };

  const requestCheckout = async (visit) => {
    try {
      setWorking('checkout');
      await api.post(`/api/sales/visits/${visit.id}/checkout/`);
      toast.success('Checkout requested for this visit');
      await load();
      closeCheckout();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not request checkout');
    } finally {
      setWorking('');
    }
  };

  const collectPayment = async (invoice, amount, paymentMethod, reference) => {
    if (amount == null) amount = invoice.balance_due;

    const method = paymentMethods.find((item) => String(item.id) === String(paymentMethod));
    if (!method) {
      toast.error('Choose a payment method');
      return false;
    }
    if (method.requires_reference && !reference?.trim()) {
      toast.error(`${method.name} requires a reference`);
      return false;
    }
    try {
      setWorking(`invoice-${invoice.id}`);
      await api.post('/api/sales/payments/', {
        invoice: invoice.id,
        payment_method: paymentMethod,
        amount: amount || invoice.balance_due,
        reference: reference || '',
      });
      await load();
      try {
        await downloadReceipt(invoice);
        toast.success('Payment collected. Receipt downloaded.');
      } catch {
        toast.error('Payment was collected, but the receipt could not be downloaded. Open the visit to try again.');
      }
      return true;
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not collect payment');
      return false;
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
          <h2 className="flex items-center gap-3 text-2xl font-black text-app-text"><UsersRound className="h-6 w-6 text-brand-500" /> Restaurant & Bar Visits</h2>
          <p className="mt-1 text-sm text-app-muted">QR and POS visits appear here. The most urgent staff action is always shown first.</p>
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
        <SummaryCard label={mode === 'HISTORY' ? 'Past visits' : 'Active visits'} value={visits.length} icon={UsersRound} />
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
              <th className="px-4 py-3 text-xs font-black uppercase text-app-muted">Service point</th>
              <th className="px-4 py-3 text-xs font-black uppercase text-app-muted">Journey stage</th>
              <th className="px-4 py-3 text-xs font-black uppercase text-app-muted">Next action</th>
              <th className="px-4 py-3 text-xs font-black uppercase text-app-muted">Balance</th>
              <th className="px-4 py-3 text-xs font-black uppercase text-app-muted">Arrived</th>
              <th className="px-4 py-3 text-xs font-black uppercase text-app-muted">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleVisits.map((visit) => (
              <tr key={visit.id} className="border-t hover:bg-app-elevated">
                <td className="px-4 py-3"><Link to={`/frontdesk/visits/${visit.id}`} className="font-black text-app-text">{visit.visit_number}</Link></td>
                <td className="px-4 py-3 text-sm text-app-muted">{visit.guest_name || 'Walk-in'}</td>
                <td className="px-4 py-3 text-sm text-app-muted">{visit.service_area}{visit.table_name ? ` · ${visit.table_name}` : ''}</td>
                <td className="px-4 py-3 text-sm"><span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-black text-brand-600">{visitStage(visit)}</span></td>
                <td className="px-4 py-3 text-sm font-bold text-app-text">{nextAction(visit)}</td>
                <td className="px-4 py-3 text-sm font-black text-app-text">KES {Number(visit.total_due || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}</td>
                <td className="px-4 py-3 text-sm text-app-muted">{new Date(visit.arrived_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex flex-wrap gap-2">
                    <Link to={`/frontdesk/visits/${visit.id}`} className="inline-flex min-h-10 items-center gap-2 rounded-md bg-brand-600 px-3 text-xs font-bold text-white">
                      {visit.status === 'CLOSED' ? 'Review visit' : 'Open journey'}
                    </Link>
                    {visit.status === 'CHECKOUT_REQUESTED' ? (
                      <button type="button" disabled={working === 'checkout'} onClick={() => openCheckout(visit)} className="inline-flex min-h-10 items-center gap-2 rounded-md bg-emerald-600 px-3 text-xs font-bold text-white disabled:opacity-50">
                        <ReceiptText className="h-4 w-4" /> Collect payment
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {visibleVisits.length === 0 ? (
        <div className="rounded-lg border border-app-border bg-app-card p-10 text-center text-sm font-bold text-app-muted">No {mode === 'HISTORY' ? 'past' : 'active'} restaurant or bar visits.</div>
      ) : null}
      <VisitCheckoutModal
        visit={checkoutTarget}
        open={checkoutOpen}
        onClose={closeCheckout}
        onRequestCheckout={requestCheckout}
        onCollectPayment={collectPayment}
        paymentMethods={paymentMethods}
        working={working}
      />
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
