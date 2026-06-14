import { useCallback, useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { useParams, Link } from 'react-router-dom';
import { Banknote, BellRing, CheckCircle2, Circle, Clock3, Loader2, MapPin, ReceiptText, Utensils } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../api';
import VisitCheckoutModal from './VisitCheckoutModal';

const money = (value) => `KES ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

async function fetchReceipt(invoice) {
  const response = await api.get(`/api/sales/invoices/${invoice.id}/receipt/`, {
    responseType: 'blob',
  });
  return new Blob([response.data], { type: 'application/pdf' });
}

function downloadReceiptBlob(invoice, blob) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `receipt-${invoice.invoice_number}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

function currentJourneyStep(visit, invoices, totalBalance) {
  if (visit.status === 'CLOSED' || (invoices.length > 0 && totalBalance <= 0)) return 5;
  if (visit.status === 'CHECKOUT_REQUESTED' || invoices.length > 0) return 4;
  if (visit.orders.some((order) => ['SERVED', 'INVOICED'].includes(order.status))) return 3;
  if (visit.orders.length) return 2;
  if (visit.waiter_acknowledged_at) return 1;
  return 0;
}

function nextActionFor(visit) {
  if (visit.status === 'CLOSED') return ['Visit complete', 'Payment has been collected and this visit is closed.'];
  if (visit.status === 'CHECKOUT_REQUESTED') return ['Collect payment', 'The guest has requested the bill.'];
  if (visit.waiter_requested_at && !visit.waiter_acknowledged_at) return ['Acknowledge the guest', 'The guest is waiting for a waiter at their service point.'];
  if (visit.orders.some((order) => order.status === 'READY')) return ['Deliver the ready order', 'Food or drinks are ready to be served.'];
  if (visit.orders.some((order) => order.status === 'PREPARING')) return ['Monitor preparation', 'The kitchen or bar is preparing this order.'];
  if (visit.orders.some((order) => order.status === 'SENT')) return ['Start preparing the order', 'The kitchen or bar needs to accept this order.'];
  if (visit.orders.some((order) => order.status === 'SERVED')) return ['Check on the guest', 'Confirm everything is satisfactory before checkout.'];
  return ['Welcome the guest', 'No order or waiter request has been made yet.'];
}

export default function VisitDetailPage() {
  const { id } = useParams();
  const [visit, setVisit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState('');
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
      toast.success('You are assigned to this visit');
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
      toast.error(err.response?.data?.detail || 'Could not checkout the visit');
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
    if (amount == null) amount = invoice.balance_due;

    const method = paymentMethods.find((m) => String(m.id) === String(paymentMethod));
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
        const receipt = await fetchReceipt(invoice);
        downloadReceiptBlob(invoice, receipt);
        toast.success('Payment collected. Receipt downloaded.');
      } catch {
        toast.error('Payment was collected, but the receipt could not be downloaded. Use Download receipt to try again.');
      }
      return true;
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not collect payment');
      return false;
    } finally {
      setWorking('');
    }
  };

  const downloadInvoiceReceipt = async (invoice) => {
    try {
      setWorking(`receipt-${invoice.id}`);
      const blob = await fetchReceipt(invoice);
      downloadReceiptBlob(invoice, blob);
      toast.success('Receipt downloaded');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not download receipt');
    } finally {
      setWorking('');
    }
  };

  const openReceiptDocument = async (invoice) => {
    try {
      setPreviewLoading(true);
      setViewingInvoiceId(invoice.id);
      const blob = await fetchReceipt(invoice);
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
      toast.error(err.response?.data?.detail || 'Could not load payment receipt');
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
  const arrivalTime = visit.arrived_at ? new Date(visit.arrived_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
  const [nextActionTitle, nextActionSubtext] = nextActionFor(visit);
  const journeyStep = currentJourneyStep(visit, invoices, totalBalance);

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
            <article className="overflow-hidden rounded-lg border border-app-border bg-app-card">
              <div className="border-b border-app-border bg-app-elevated px-5 py-4">
                <p className="font-black text-app-text">Next: {nextActionTitle}</p>
                <p className="mt-0.5 text-sm text-app-muted">{nextActionSubtext}</p>
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-600">{visit.visit_number}</p>
                    <h2 className="mt-2 text-xl font-black text-app-text">
                      {visit.service_area}{visit.table_name ? `, ${visit.table_name}` : ''}
                    </h2>
                    <p className="mt-1 text-sm text-app-muted">
                      {visit.guest_name || 'Walk-in guest'}{visit.phone ? ` · ${visit.phone}` : ''} · {arrivalTime}
                    </p>
                  </div>
                  <span className="rounded-full bg-brand-500/10 px-3 py-1.5 text-xs font-black text-brand-600">
                    {visit.status.replaceAll('_', ' ')}
                  </span>
                </div>

                <VisitJourneyTimeline currentStep={journeyStep} />

                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  {visit.orders.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-app-border bg-app-elevated p-6 text-center lg:col-span-2">
                      <MapPin className="mx-auto h-6 w-6 text-brand-500" />
                      <p className="mt-3 font-black text-app-text">Guest has arrived</p>
                      <p className="mt-1 text-sm text-app-muted">No food, drink, waiter, or checkout request yet.</p>
                    </div>
                  ) : visit.orders.map((order) => (
                    <div key={order.id} className="rounded-lg bg-app-elevated p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-black text-app-text">{order.order_number}</p>
                          <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-app-muted">
                            <Clock3 className="h-4 w-4" /> {order.status.replaceAll('_', ' ')}
                          </p>
                        </div>
                        <p className="font-black text-brand-600">{money(order.grand_total)}</p>
                      </div>
                      <ul className="mt-3 space-y-1 text-sm text-app-muted">
                        {order.items.map((item) => (
                          <li key={item.id}>{Number(item.quantity)} × {item.product_name}</li>
                        ))}
                      </ul>
                      {['SENT', 'PREPARING', 'READY'].includes(order.status) ? (
                        <button type="button" onClick={() => progressOrder(order)} disabled={working === `order-${order.id}`} className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-brand-600 px-4 text-xs font-black text-white disabled:opacity-50">
                          {working === `order-${order.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                          {order.status === 'SENT' ? 'Start preparing' : order.status === 'PREPARING' ? 'Mark ready' : 'Mark served'}
                        </button>
                      ) : null}
                      {order.invoice ? (
                        <p className="mt-4 border-t border-app-border pt-3 text-xs font-bold text-app-muted">
                          {order.invoice.invoice_number} · {money(order.invoice.balance_due)} due
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>

                {visit.feedback_rating ? (
                  <p className="mt-5 rounded-md bg-emerald-500/10 p-4 text-sm font-bold text-emerald-700">
                    Guest feedback: {visit.feedback_rating}/5{visit.feedback_comment ? ` · ${visit.feedback_comment}` : ''}
                  </p>
                ) : null}
              </div>
            </article>
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
                                      onClick={() => openReceiptDocument(order.invoice)}
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
              {invoices.length === 0 ? <div className="text-sm text-app-muted">No invoices for this visit.</div> : invoices.map((inv) => (
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
                        onClick={() => openReceiptDocument(inv)}
                        disabled={previewLoading && viewingInvoiceId === inv.id}
                        className="inline-flex items-center gap-2 rounded-md border border-app-border px-3 py-2 text-sm font-bold text-app-text disabled:opacity-50"
                      >
                        {previewLoading && viewingInvoiceId === inv.id ? 'Loading...' : 'View receipt'}
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadInvoiceReceipt(inv)}
                        disabled={working === `receipt-${inv.id}`}
                        className="inline-flex items-center gap-2 rounded-md border border-app-border px-3 py-2 text-sm font-bold text-app-text disabled:opacity-50"
                      >
                        {working === `receipt-${inv.id}` ? 'Downloading...' : 'Download receipt'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'related' && (
            <div className="mt-4 space-y-3">
              {relatedVisits.length === 0 ? <div className="text-sm text-app-muted">No related visits found.</div> : relatedVisits.map((rv) => (
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

function VisitJourneyTimeline({ currentStep }) {
  const steps = [
    ['Arrived', MapPin],
    ['Waiter', BellRing],
    ['Ordered', Utensils],
    ['Served', CheckCircle2],
    ['Checkout', ReceiptText],
    ['Paid', Banknote],
  ];

  return (
    <div className="mt-7 overflow-x-auto pb-2">
      <div className="flex min-w-[620px] items-start">
        {steps.map(([label, Icon], index) => {
          const complete = index <= currentStep;
          return (
            <div key={label} className="relative flex flex-1 flex-col items-center text-center">
              {index > 0 ? (
                <span className={`absolute right-1/2 top-5 h-0.5 w-full ${complete ? 'bg-brand-500' : 'bg-app-border'}`} />
              ) : null}
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
