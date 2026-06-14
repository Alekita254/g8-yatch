import { useCallback, useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { useParams, Link } from 'react-router-dom';
import { Banknote, CheckCircle2, Clock3, Loader2, MapPin, ReceiptText, Utensils, BellRing } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../api';
import VisitCheckoutModal from './VisitCheckoutModal';

const money = (value) => `KES ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function VisitDetailPage() {
  const { id } = useParams();
  const [visit, setVisit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState('');
  const [payments, setPayments] = useState({});
  const [paymentMethods, setPaymentMethods] = useState([]);
  const auth = useAuth();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutInvoiceId, setCheckoutInvoiceId] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [viewingInvoiceId, setViewingInvoiceId] = useState(null);
  const [tab, setTab] = useState('overview'); // overview | orders | invoices | related
  const [relatedVisits, setRelatedVisits] = useState([]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [visitResponse, methodsResponse, listResponse] = await Promise.all([
        api.get(`/api/sales/visits/${id}/`),
        api.get('/api/payments/methods/', { params: { page_size: 100 } }),
        api.get('/api/sales/visits/', { params: { page_size: 200 } }),
      ]);
      setVisit(visitResponse.data);
      setPaymentMethods((methodsResponse.data.results || []).filter((m) => m.is_active && !m.requires_room_verification));
      const list = listResponse.data.results || [];
      const related = list.filter((v) => (v.id !== Number(id)) && (v.table_name === visitResponse.data.table_name || (visitResponse.data.guest_name && v.guest_name === visitResponse.data.guest_name)));
      setRelatedVisits(related.slice(0, 10));
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to load visit');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (auth.isLoading || !auth.isAuthenticated) return;
    load();
  }, [auth.isLoading, auth.isAuthenticated, load]);

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

  const openCheckout = (invoiceId = null) => {
    setCheckoutInvoiceId(invoiceId);
    setCheckoutOpen(true);
  };

  const closeCheckout = () => {
    setCheckoutInvoiceId(null);
    setCheckoutOpen(false);
  };

  const submitCheckout = async () => {
    try {
      setWorking('checkout');
      await api.post(`/api/sales/visits/${id}/checkout/`);
      toast.success('Checkout requested and invoices issued');
      await load();
      closeCheckout();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not checkout the stay');
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

  const collectPayment = async (invoice, amount, paymentMethod, reference) => {
    const entry = payments[invoice.id] || {};
    if (!paymentMethod) paymentMethod = entry.method;
    if (!reference) reference = entry.reference;
    if (amount == null) amount = entry.amount || invoice.balance_due;

    const method = paymentMethods.find((m) => String(m.id) === String(paymentMethod));
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

  const downloadInvoiceReceipt = async (invoice) => {
    try {
      setWorking(`receipt-${invoice.id}`);
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
      toast.success('Receipt downloaded');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not download receipt');
    } finally {
      setWorking('');
    }
  };

  const openInvoiceDocument = async (invoice) => {
    try {
      setPreviewLoading(true);
      setViewingInvoiceId(invoice.id);
      const response = await api.get(`/api/sales/invoices/${invoice.id}/receipt/`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const newWindow = window.open(url, '_blank');
      if (!newWindow) {
        toast.error('Please allow pop-ups to view the PDF');
        window.URL.revokeObjectURL(url);
        return;
      }
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 60000);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not load invoice document');
    } finally {
      setPreviewLoading(false);
      setViewingInvoiceId(null);
    }
  };

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>;
  if (!visit) return <div className="text-center text-app-muted">Visit not found</div>;

  const invoices = visit.orders.map((o) => o.invoice).filter(Boolean);
  const totalInvoiceAmount = invoices.reduce((sum, inv) => sum + Number(inv.grand_total || 0), 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + Number(inv.paid_total || 0), 0);
  const totalBalance = invoices.reduce((sum, inv) => sum + Number(inv.balance_due || 0), 0);

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
              <button type="button" onClick={acknowledgeWaiter} disabled={working === 'ack' || working === 'checkout'} className="inline-flex items-center gap-2 rounded-md bg-amber-500/10 px-3 py-2 text-sm font-bold text-amber-700">
                {working === 'ack' ? <Loader2 className="h-4 w-4 animate-spin" /> : <BellRing className="h-4 w-4" />} Acknowledge
              </button>
            ) : null}
            <button type="button" onClick={openCheckout} disabled={working === 'checkout' || visit.status === 'CLOSED'} className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-bold text-white">
              {working === 'checkout' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ReceiptText className="h-4 w-4" />} Checkout
            </button>
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

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-app-border bg-app-card px-4 py-3">
            <p className="text-xs font-black uppercase text-app-muted">Total billed</p>
            <p className="mt-2 text-xl font-black text-app-text">{money(totalInvoiceAmount)}</p>
          </div>
          <div className="rounded-lg border border-app-border bg-app-card px-4 py-3">
            <p className="text-xs font-black uppercase text-app-muted">Amount collected</p>
            <p className="mt-2 text-xl font-black text-app-text">{money(totalPaid)}</p>
          </div>
          <div className="rounded-lg border border-app-border bg-app-card px-4 py-3">
            <p className="text-xs font-black uppercase text-app-muted">Balance remaining</p>
            <p className="mt-2 text-xl font-black text-app-text">{money(totalBalance)}</p>
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
            <div className="mt-4">
              {visit.orders.length === 0 ? (
                <div className="rounded-lg border border-dashed border-app-border bg-app-elevated p-5">
                  <MapPin className="mx-auto h-6 w-6 text-brand-500" />
                  <p className="mt-3 font-black text-app-text">Guest has arrived</p>
                  <p className="mt-1 text-sm text-app-muted">No orders yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-md border border-app-border bg-app-card">
                  <table className="w-full table-auto text-left">
                    <thead>
                      <tr className="bg-app-elevated">
                        <th className="px-4 py-3 text-xs font-black uppercase text-app-muted">Order</th>
                        <th className="px-4 py-3 text-xs font-black uppercase text-app-muted">Status</th>
                        <th className="px-4 py-3 text-xs font-black uppercase text-app-muted">Foods</th>
                        <th className="px-4 py-3 text-xs font-black uppercase text-app-muted">Total</th>
                        <th className="px-4 py-3 text-xs font-black uppercase text-app-muted">Invoice</th>
                        <th className="px-4 py-3 text-xs font-black uppercase text-app-muted">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visit.orders.map((order) => (
                          <tr key={`order-${order.id}`} className="border-t hover:bg-app-elevated">
                            <td className="px-4 py-3 font-black">{order.order_number}</td>
                            <td className="px-4 py-3 text-sm text-app-muted">{order.status}</td>
                            <td className="px-4 py-3 text-sm text-app-text">
                              <div className="space-y-1">
                                {order.items.map((item) => (
                                  <div key={item.id} className="flex items-center justify-between gap-3 rounded-md bg-app-elevated px-2 py-1 text-sm">
                                    <span>{item.quantity}× {item.product_name}</span>
                                    <span className="font-black">{item.line_total ? money(item.line_total) : ''}</span>
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm font-black">{money(order.grand_total)}</td>
                            <td className="px-4 py-3 text-sm">{order.invoice ? order.invoice.invoice_number : '-'}</td>
                            <td className="px-4 py-3 text-sm">
                              <div className="inline-flex flex-wrap gap-2">
                                {['SENT', 'PREPARING', 'READY'].includes(order.status) ? (
                                  <button type="button" onClick={() => progressOrder(order)} disabled={working === `order-${order.id}`} className="rounded-md bg-brand-600 px-3 py-2 text-xs font-bold text-white">
                                    {order.status === 'SENT' ? 'Start' : order.status === 'PREPARING' ? 'Ready' : 'Serve'}
                                  </button>
                                ) : null}
                                {order.invoice && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => openInvoiceDocument(order.invoice)}
                                      disabled={previewLoading && viewingInvoiceId === order.invoice.id}
                                      className="rounded-md border border-app-border px-3 py-2 text-xs font-bold text-app-text"
                                    >
                                      {previewLoading && viewingInvoiceId === order.invoice.id ? 'Loading...' : 'View'}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => downloadInvoiceReceipt(order.invoice)}
                                      disabled={working === `receipt-${order.invoice.id}`}
                                      className="rounded-md border border-app-border px-3 py-2 text-xs font-bold text-app-text"
                                    >
                                      {working === `receipt-${order.invoice.id}` ? 'Downloading...' : 'Download'}
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === 'invoices' && (
            <div className="mt-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-app-border bg-app-card px-4 py-3">
                  <p className="text-xs font-black uppercase text-app-muted">Amount billed</p>
                  <p className="mt-2 text-xl font-black text-app-text">{money(totalInvoiceAmount)}</p>
                </div>
                <div className="rounded-lg border border-app-border bg-app-card px-4 py-3">
                  <p className="text-xs font-black uppercase text-app-muted">Collected</p>
                  <p className="mt-2 text-xl font-black text-app-text">{money(totalPaid)}</p>
                </div>
                <div className="rounded-lg border border-app-border bg-app-card px-4 py-3">
                  <p className="text-xs font-black uppercase text-app-muted">Remaining balance</p>
                  <p className="mt-2 text-xl font-black text-app-text">{money(totalBalance)}</p>
                </div>
              </div>
              {invoices.length === 0 ? <div className="text-sm text-app-muted">No invoices for this stay.</div> : invoices.map((inv) => (
                <div key={inv.id} className="rounded-lg border bg-app-elevated p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-black">{inv.invoice_number}</p>
                      <p className="text-sm text-app-muted">Total: {money(inv.grand_total)} · Paid: {money(inv.paid_total)} · Due: {money(inv.balance_due)}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {inv.balance_due > 0 && (
                        <button type="button" onClick={() => openCheckout(inv.id)} disabled={working === `invoice-${inv.id}`} className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-50">
                          {working === `invoice-${inv.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Banknote className="h-4 w-4" />} Collect payment
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => openInvoiceDocument(inv)}
                        disabled={previewLoading && viewingInvoiceId === inv.id}
                        className="inline-flex items-center gap-2 rounded-md border border-app-border px-3 py-2 text-sm font-bold text-app-text disabled:opacity-50"
                      >
                        {previewLoading && viewingInvoiceId === inv.id ? 'Loading...' : 'View document'}
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadInvoiceReceipt(inv)}
                        disabled={working === `receipt-${inv.id}`}
                        className="inline-flex items-center gap-2 rounded-md border border-app-border px-3 py-2 text-sm font-bold text-app-text disabled:opacity-50"
                      >
                        {working === `receipt-${inv.id}` ? 'Downloading...' : 'Download PDF'}
                      </button>
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
      <VisitCheckoutModal
        visit={visit}
        open={checkoutOpen}
        initialInvoiceId={checkoutInvoiceId}
        onClose={closeCheckout}
        onRequestCheckout={submitCheckout}
        onCollectPayment={collectPayment}
        paymentMethods={paymentMethods}
        working={working}
      />
    </div>
  );
}
