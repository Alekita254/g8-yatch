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
      toast.error(err.response?.data?.detail || 'Failed to load guest stays');
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
      toast.success('Checkout requested for this stay');
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
      return;
    }
    if (method.requires_reference && !reference?.trim()) {
      toast.error(`${method.name} requires a reference`);
      return;
    }
    try {
      setWorking(`invoice-${invoice.id}`);
      await api.post('/api/sales/payments/', {
        invoice: invoice.id,
        payment_method: paymentMethod,
        amount: amount || invoice.balance_due,
        reference: reference || '',
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
                <td className="px-4 py-3 text-sm">
                  <div className="flex flex-wrap gap-2">
                    <Link to={`/frontdesk/visits/${visit.id}`} className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-3 py-2 text-xs font-bold text-white">Open</Link>
                    {visit.status !== 'CLOSED' && (
                      visit.status === 'CHECKOUT_REQUESTED' ? (
                        <span className="inline-flex items-center gap-2 rounded-md bg-amber-500/10 px-3 py-2 text-xs font-black text-amber-700">Checkout requested</span>
                      ) : (
                        <button type="button" disabled={working === 'checkout'} onClick={() => openCheckout(visit)} className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">
                          {working === 'checkout' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ReceiptText className="h-4 w-4" />} Checkout
                        </button>
                      )
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {visibleVisits.length === 0 ? (
        <div className="rounded-lg border border-app-border bg-app-card p-10 text-center text-sm font-bold text-app-muted">No {mode === 'HISTORY' ? 'past' : 'active'} guest stays.</div>
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
