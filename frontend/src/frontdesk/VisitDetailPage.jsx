import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Banknote, CheckCircle2, Clock3, Loader2, MapPin, ReceiptText, Utensils, BellRing } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../api';

const money = (value) => `KES ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function VisitDetailPage() {
  const { id } = useParams();
  const [visit, setVisit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState('');
  const [payments, setPayments] = useState({});
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [tab, setTab] = useState('overview'); // overview | orders | invoices | related
  const [relatedVisits, setRelatedVisits] = useState([]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [visitResponse, methodsResponse] = await Promise.all([
        api.get(`/api/sales/visits/${id}/`),
        api.get('/api/payments/methods/', { params: { page_size: 100 } }),
        api.get('/api/sales/visits/', { params: { page_size: 200 } }),
      ]);
      setVisit(visitResponse.data);
      setPaymentMethods((methodsResponse.data.results || []).filter((m) => m.is_active && !m.requires_room_verification));
      // related visits: same table or same guest
      const all = (arguments[1] || {}).data || [];
      try {
        const listResp = await api.get('/api/sales/visits/', { params: { page_size: 200 } });
        const list = listResp.data.results || [];
        const related = list.filter((v) => (v.id !== Number(id)) && (v.table_name === visitResponse.data.table_name || (visitResponse.data.guest_name && v.guest_name === visitResponse.data.guest_name)));
        setRelatedVisits(related.slice(0, 10));
      } catch (e) {
        // ignore related fetch errors
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to load visit');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const acknowledgeWaiter = async () => {
    try {
      setWorking('ack');
      await api.post(`/api/sales/visits/${id}/waiter-acknowledge/`);
      toast.success('You are assigned to this stay');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not acknowledge the waiter request');
    } finally {
      setWorking('');
    }
  };

  const progressOrder = async (order) => {
    const transitions = {
      SENT: 'PREPARING',
      PREPARING: 'READY',
      READY: 'SERVED',
    };
    const next = transitions[order.status];
    if (!next) return;
    try {
      setWorking(`order-${order.id}`);
      await api.post(`/api/sales/orders/${order.id}/status/`, { status: next });
      await load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not update order');
    } finally {
      setWorking('');
    }
  };

  const collectPayment = async (invoice) => {
    const entry = payments[invoice.id] || {};
    if (!entry.method) { toast.error('Choose a payment method'); return; }
    const method = paymentMethods.find((m) => String(m.id) === String(entry.method));
    if (method?.requires_reference && !entry.reference?.trim()) { toast.error(`${method.name} requires a reference`); return; }
    try {
      setWorking(`invoice-${invoice.id}`);
      await api.post('/api/sales/payments/', { invoice: invoice.id, payment_method: entry.method, amount: invoice.balance_due, reference: entry.reference || '' });
      toast.success('Payment collected and visit updated');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not collect payment');
    } finally { setWorking(''); }
  };

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>;
  if (!visit) return <div className="text-center text-app-muted">Visit not found</div>;

  const invoices = visit.orders.map((o) => o.invoice).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Customer header */}
      <div className="rounded-lg border border-app-border bg-app-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-brand-500">{visit.visit_number}</p>
            <h2 className="mt-2 text-2xl font-black text-app-text">{visit.guest_name || 'Walk-in guest'}</h2>
            <p className="mt-1 text-sm text-app-muted">{visit.phone || ''} · {visit.service_area} · {visit.table_name}</p>
            <p className="mt-2 text-sm text-app-muted">Assigned waiter: {visit.waiter_keycloak_sub || (visit.waiter_acknowledged_at ? 'someone' : '—')}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/frontdesk/visits" className="rounded-md px-3 py-2 text-sm font-bold text-app-text border border-app-border">Back</Link>
            {visit.waiter_requested_at && !visit.waiter_acknowledged_at ? (
              <button type="button" onClick={acknowledgeWaiter} disabled={working === 'ack'} className="inline-flex items-center gap-2 rounded-md bg-amber-500/10 px-3 py-2 text-sm font-bold text-amber-700">
                {working === 'ack' ? <Loader2 className="h-4 w-4 animate-spin" /> : <BellRing className="h-4 w-4" />} Acknowledge
              </button>
            ) : null}
          </div>
        </div>

        {/* POS / Service point details */}
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div className="rounded-md border border-app-border bg-app-elevated px-4 py-3">
            <p className="text-xs font-black uppercase text-app-muted">Service point</p>
            <p className="mt-1 font-bold text-app-text">{visit.service_point_name || visit.service_point || '—'}</p>
          </div>
          <div className="rounded-md border border-app-border bg-app-elevated px-4 py-3">
            <p className="text-xs font-black uppercase text-app-muted">Status</p>
            <p className="mt-1 font-bold text-app-text">{visit.status.replaceAll('_', ' ')}</p>
          </div>
          <div className="rounded-md border border-app-border bg-app-elevated px-4 py-3">
            <p className="text-xs font-black uppercase text-app-muted">Arrived</p>
            <p className="mt-1 font-bold text-app-text">{new Date(visit.arrived_at).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-lg border border-app-border bg-app-card p-4">
        <div className="flex gap-2">
          <button type="button" onClick={() => setTab('overview')} className={`px-3 py-2 text-sm font-bold ${tab === 'overview' ? 'bg-brand-600 text-white' : 'text-app-text border border-app-border'}`}>Overview</button>
          <button type="button" onClick={() => setTab('orders')} className={`px-3 py-2 text-sm font-bold ${tab === 'orders' ? 'bg-brand-600 text-white' : 'text-app-text border border-app-border'}`}>Orders</button>
          <button type="button" onClick={() => setTab('invoices')} className={`px-3 py-2 text-sm font-bold ${tab === 'invoices' ? 'bg-brand-600 text-white' : 'text-app-text border border-app-border'}`}>Invoices</button>
          <button type="button" onClick={() => setTab('related')} className={`px-3 py-2 text-sm font-bold ${tab === 'related' ? 'bg-brand-600 text-white' : 'text-app-text border border-app-border'}`}>Related</button>
        </div>

        <div className="mt-4">
          {tab === 'overview' && (
            <div className="text-sm text-app-muted">Next action: {visit.orders.length ? visit.orders[0].status : 'No orders'}</div>
          )}

          {tab === 'orders' && (
            <div className="grid gap-4 lg:grid-cols-2 mt-4">
              {visit.orders.length === 0 ? (
                <div className="rounded-lg border border-dashed border-app-border bg-app-elevated p-5 lg:col-span-2">
                  <MapPin className="mx-auto h-6 w-6 text-brand-500" />
                  <p className="mt-3 font-black text-app-text">Guest has arrived</p>
                  <p className="mt-1 text-sm text-app-muted">No orders yet.</p>
                </div>
              ) : visit.orders.map((order) => (
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
                  <div className="mt-4">
                    {order.status === 'SENT' && <button type="button" onClick={() => progressOrder(order)} className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-bold text-white">Start preparing</button>}
                    {order.status === 'PREPARING' && <button type="button" onClick={() => progressOrder(order)} className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-bold text-white">Mark ready</button>}
                    {order.status === 'READY' && <button type="button" onClick={() => progressOrder(order)} className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-bold text-white">Mark served</button>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'invoices' && (
            <div className="mt-4 space-y-4">
              {invoices.length === 0 ? <div className="text-sm text-app-muted">No invoices for this stay.</div> : invoices.map((inv) => (
                <div key={inv.id} className="rounded-lg border bg-app-elevated p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-black">{inv.invoice_number}</p>
                      <p className="text-sm text-app-muted">Total: {money(inv.grand_total)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-black">Due: {money(inv.balance_due)}</p>
                      {inv.balance_due > 0 && (
                        <button type="button" onClick={() => collectPayment(inv)} disabled={working === `invoice-${inv.id}`} className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-bold text-white">
                          {working === `invoice-${inv.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Banknote className="h-4 w-4" />} Collect
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'related' && (
            <div className="mt-4 space-y-3">
              {relatedVisits.length === 0 ? <div className="text-sm text-app-muted">No related stays found.</div> : relatedVisits.map((rv) => (
                <div key={rv.id} className="rounded-lg border bg-app-elevated p-3 flex items-center justify-between">
                  <div>
                    <p className="font-black">{rv.visit_number} · {rv.service_area} {rv.table_name}</p>
                    <p className="text-sm text-app-muted">{rv.guest_name || '—'} · {new Date(rv.arrived_at).toLocaleString()}</p>
                  </div>
                  <Link to={`/frontdesk/visits/${rv.id}`} className="rounded-md bg-brand-600 px-3 py-2 text-sm font-bold text-white">Open</Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
