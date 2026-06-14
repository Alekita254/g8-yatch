import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Banknote, CheckCircle2, ConciergeBell, CreditCard, Loader2, Martini, Minus, Plus, ReceiptText, ShoppingCart, Utensils } from 'lucide-react';

import api from '../api';
import FrontdeskPosPage from './FrontdeskPosPage';

const salesKinds = new Set(['BAR', 'RESTAURANT', 'MARINA', 'POS_TERMINAL']);
const folioKinds = new Set(['FRONTDESK']);

const iconForKind = {
  BAR: Martini,
  RESTAURANT: Utensils,
  MARINA: ShoppingCart,
  POS_TERMINAL: ShoppingCart,
  FRONTDESK: ConciergeBell,
};

const money = (value) => `KES ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function lineTotal(line) {
  return Number(line.quantity || 0) * Number(line.price || 0);
}

export default function FrontdeskServicePointsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [servicePoints, setServicePoints] = useState([]);
  const [products, setProducts] = useState([]);
  const [pricelists, setPricelists] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPointId, setSelectedPointId] = useState('');
  const [cart, setCart] = useState([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [sale, setSale] = useState({
    table_name: '',
    customer_name: '',
    payment_method: '',
    reference: '',
    amount_received: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [pointsResponse, productsResponse, pricelistsResponse, paymentMethodsResponse] = await Promise.all([
          api.get('/api/users/service-points/', { params: { page_size: 100 } }),
          api.get('/api/products/items/', { params: { page_size: 100 } }),
          api.get('/api/products/sales-pricelists/', { params: { page_size: 100 } }),
          api.get('/api/payments/methods/', { params: { page_size: 100 } }),
        ]);
        setServicePoints((pointsResponse.data.results || []).filter((point) => point.is_active));
        setProducts((productsResponse.data.results || []).filter((product) => product.is_active && product.is_sellable));
        setPricelists((pricelistsResponse.data.results || []).filter((pricelist) => pricelist.is_active));
        setPaymentMethods((paymentMethodsResponse.data.results || [])
          .filter((method) => method.is_active && !method.requires_room_verification));
      } catch (err) {
        toast.error(err.response?.data?.detail || 'Failed to load service point POS data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const selectedPoint = servicePoints.find((point) => String(point.id) === String(selectedPointId));
  const productById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);

  const saleItems = useMemo(() => {
    if (!selectedPoint) return [];
    const matchingPricelists = pricelists.filter((pricelist) => {
      if (pricelist.service_points?.length) {
        return pricelist.service_points.map(String).includes(String(selectedPoint.id));
      }
      if (pricelist.service_point) return String(pricelist.service_point) === String(selectedPoint.id);
      return !pricelist.service_point_kind || pricelist.service_point_kind === selectedPoint.kind;
    });
    const uniqueItems = new Map();

    matchingPricelists.forEach((pricelist) => {
      (pricelist.items || []).forEach((item) => {
        const product = productById.get(item.product);
        if (!product || uniqueItems.has(item.product)) return;
        uniqueItems.set(item.product, {
          product: item.product,
          name: item.product_name || product.name,
          sku: item.product_sku || product.sku,
          category: product.category_name || 'General',
          price: Number(item.price || 0),
          currency: item.currency || 'KES',
        });
      });
    });

    return Array.from(uniqueItems.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [pricelists, productById, selectedPoint]);

  const groupedItems = useMemo(() => {
    return saleItems.reduce((groups, item) => {
      const key = item.category || 'General';
      groups[key] = groups[key] || [];
      groups[key].push(item);
      return groups;
    }, {});
  }, [saleItems]);

  const subtotal = cart.reduce((sum, line) => sum + lineTotal(line), 0);
  const selectedPaymentMethod = paymentMethods.find((method) => String(method.id) === String(sale.payment_method));
  const isCashPayment = selectedPaymentMethod?.method_type === 'CASH';
  const amountReceived = Number(sale.amount_received || 0);
  const changeDue = isCashPayment ? Math.max(amountReceived - subtotal, 0) : 0;

  const selectPoint = (point) => {
    setSelectedPointId(point.id);
    setCart([]);
    setCheckoutOpen(false);
    setReceipt(null);
    setSale({ table_name: '', customer_name: '', payment_method: '', reference: '', amount_received: '' });
  };

  const addItem = (item) => {
    setCart((current) => {
      const existing = current.find((line) => line.product === item.product);
      if (existing) {
        return current.map((line) => (line.product === item.product ? { ...line, quantity: line.quantity + 1 } : line));
      }
      return [...current, { ...item, quantity: 1 }];
    });
  };

  const changeQuantity = (productId, amount) => {
    setCart((current) => current
      .map((line) => (line.product === productId ? { ...line, quantity: Math.max(line.quantity + amount, 0) } : line))
      .filter((line) => line.quantity > 0));
  };

  const resetSale = () => {
    setCart([]);
    setCheckoutOpen(false);
    setSale({ table_name: '', customer_name: '', payment_method: '', reference: '', amount_received: '' });
  };

  const createOrder = async () => {
    const orderResponse = await api.post('/api/sales/orders/', {
      service_point: selectedPoint.id,
      table_name: sale.table_name,
      customer_name: sale.customer_name,
      subtotal: subtotal.toFixed(2),
      tax_total: '0.00',
      discount_total: '0.00',
      grand_total: subtotal.toFixed(2),
      notes: `${selectedPoint.name} POS sale`,
      items: cart.map((line) => ({
        product: line.product,
        service_point: selectedPoint.id,
        quantity: String(line.quantity),
        unit_price: Number(line.price).toFixed(2),
        tax_total: '0.00',
        discount_total: '0.00',
        line_total: lineTotal(line).toFixed(2),
      })),
    });
    await api.post(`/api/sales/orders/${orderResponse.data.id}/send/`);
    return orderResponse.data;
  };

  const sendOrder = async () => {
    if (!selectedPoint || cart.length === 0) return;

    try {
      setSaving(true);
      const order = await createOrder();
      setReceipt({ orderNumber: order.order_number, visitId: order.visit, total: subtotal, paid: false });
      resetSale();
      toast.success('Order sent to service');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to send order');
    } finally {
      setSaving(false);
    }
  };

  const checkout = async (event) => {
    event.preventDefault();
    if (!selectedPoint || cart.length === 0 || !selectedPaymentMethod) return;
    if (selectedPaymentMethod.requires_reference && !sale.reference.trim()) {
      toast.error(`${selectedPaymentMethod.name} requires a payment reference`);
      return;
    }
    if (selectedPaymentMethod.requires_customer && !sale.customer_name.trim()) {
      toast.error(`${selectedPaymentMethod.name} requires a customer name`);
      return;
    }
    if (isCashPayment && amountReceived < subtotal) {
      toast.error('Cash received cannot be less than the amount due');
      return;
    }

    try {
      setSaving(true);
      const order = await createOrder();
      const invoiceResponse = await api.post(`/api/sales/orders/${order.id}/invoice/`);
      await api.post('/api/sales/payments/', {
        invoice: invoiceResponse.data.id,
        payment_method: selectedPaymentMethod.id,
        amount: subtotal.toFixed(2),
        reference: sale.reference.trim(),
      });
      setReceipt({
        orderNumber: order.order_number,
        invoiceNumber: invoiceResponse.data.invoice_number,
        paymentMethod: selectedPaymentMethod.name,
        total: subtotal,
        amountReceived: isCashPayment ? amountReceived : subtotal,
        change: changeDue,
        paid: true,
      });
      resetSale();
      toast.success('Payment collected and invoice closed');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to complete checkout');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>;
  }

  if (!selectedPoint) {
    return (
      <div className="space-y-6">
        <section className="rounded-lg border border-app-border bg-app-card p-6">
          <h2 className="text-2xl font-black text-app-text">Service Points</h2>
          <p className="mt-1 text-sm text-app-muted">Choose where the guest is being served, then open the POS that matches that point.</p>
        </section>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {servicePoints.map((point) => {
            const Icon = iconForKind[point.kind] || ShoppingCart;
            const mode = folioKinds.has(point.kind) ? 'Folio POS' : salesKinds.has(point.kind) ? 'Sales POS' : 'Service desk';
            return (
              <button
                key={point.id}
                type="button"
                onClick={() => selectPoint(point)}
                className="group rounded-lg border border-app-border bg-app-card p-5 text-left transition hover:border-brand-500/60 hover:bg-app-elevated"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-md bg-app-elevated px-2 py-1 text-xs font-black uppercase text-app-muted">{mode}</span>
                </div>
                <h3 className="mt-5 text-xl font-black text-app-text">{point.name}</h3>
                <p className="mt-1 text-xs font-bold uppercase text-brand-500">{point.kind_display || point.kind}</p>
                <p className="mt-3 min-h-10 text-sm leading-5 text-app-muted">{point.location || point.description || 'No location set'}</p>
                <span className="mt-5 inline-flex text-sm font-black text-brand-600 transition group-hover:translate-x-1">Open POS</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const SelectedIcon = iconForKind[selectedPoint.kind] || ShoppingCart;

  if (folioKinds.has(selectedPoint.kind)) {
    return (
      <div className="space-y-6">
        <section className="flex flex-col gap-4 rounded-lg border border-app-border bg-app-card p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
              <SelectedIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-app-text">{selectedPoint.name} POS</h2>
              <p className="text-sm text-app-muted">Hotel folio posting for room charges, payments, and adjustments.</p>
            </div>
          </div>
          <button type="button" onClick={() => selectPoint({ id: '' })} className="inline-flex items-center justify-center gap-2 rounded-md border border-app-border px-4 py-2 text-sm font-bold text-app-text transition hover:bg-app-elevated">
            <ArrowLeft className="h-4 w-4" />
            Service Points
          </button>
        </section>

        <FrontdeskPosPage />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-lg border border-app-border bg-app-card p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
            <SelectedIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-app-text">{selectedPoint.name} POS</h2>
            <p className="text-sm text-app-muted">{selectedPoint.kind_display || selectedPoint.kind} product checkout.</p>
          </div>
        </div>
        <button type="button" onClick={() => selectPoint({ id: '' })} className="inline-flex items-center justify-center gap-2 rounded-md border border-app-border px-4 py-2 text-sm font-bold text-app-text transition hover:bg-app-elevated">
          <ArrowLeft className="h-4 w-4" />
          Service Points
        </button>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="space-y-5">
          {Object.keys(groupedItems).length === 0 ? (
            <div className="rounded-lg border border-app-border bg-app-card p-8 text-center">
              <p className="text-sm font-bold text-app-muted">No active sales pricelist items match this service point.</p>
              <Link to="/products/sales-pricelists" className="mt-4 inline-flex text-sm font-black text-brand-600">Set up sales pricelists</Link>
            </div>
          ) : Object.entries(groupedItems).map(([category, items]) => (
            <div key={category} className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-[0.16em] text-app-muted">{category}</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <button key={item.product} type="button" onClick={() => addItem(item)} className="rounded-lg border border-app-border bg-app-card p-4 text-left transition hover:border-brand-500/60 hover:bg-app-elevated">
                    <p className="text-base font-black text-app-text">{item.name}</p>
                    <p className="mt-1 text-xs font-bold uppercase text-app-muted">{item.sku}</p>
                    <p className="mt-5 text-lg font-black text-brand-600">{money(item.price)}</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </section>

        <form onSubmit={checkout} className="rounded-lg border border-app-border bg-app-card p-5 xl:sticky xl:top-5 xl:self-start">
          <div className="flex items-center gap-3">
            <ReceiptText className="h-5 w-5 text-brand-500" />
            <h3 className="text-xl font-black text-app-text">Current Sale</h3>
          </div>

          <div className="mt-5 space-y-2">
            {cart.length === 0 ? (
              <p className="rounded-md bg-app-elevated p-4 text-sm font-bold text-app-muted">Add products to start a sale.</p>
            ) : cart.map((line) => (
              <div key={line.product} className="rounded-md bg-app-elevated p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-app-text">{line.name}</p>
                    <p className="text-xs font-bold text-app-muted">{money(line.price)} each</p>
                  </div>
                  <p className="text-sm font-black text-app-text">{money(lineTotal(line))}</p>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button type="button" onClick={() => changeQuantity(line.product, -1)} className="rounded-md border border-app-border p-1.5 text-app-muted transition hover:text-app-text">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-black text-app-text">{line.quantity}</span>
                  <button type="button" onClick={() => changeQuantity(line.product, 1)} className="rounded-md border border-app-border p-1.5 text-app-muted transition hover:text-app-text">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-3">
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase text-app-muted">Table / area</span>
              <input value={sale.table_name} onChange={(event) => setSale((current) => ({ ...current, table_name: event.target.value }))} placeholder="Bar counter, Table 4..." className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase text-app-muted">Customer</span>
              <input value={sale.customer_name} onChange={(event) => setSale((current) => ({ ...current, customer_name: event.target.value }))} placeholder="Walk-in guest" className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" />
            </label>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-app-border pt-4">
            <span className="text-sm font-black uppercase text-app-muted">Total</span>
            <span className="text-2xl font-black text-app-text">{money(subtotal)}</span>
          </div>

          {!checkoutOpen ? (
            <div className="mt-5 grid gap-3">
              <button type="button" onClick={() => setCheckoutOpen(true)} disabled={saving || cart.length === 0} className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-50">
                <CreditCard className="h-4 w-4" />
                Checkout and collect payment
              </button>
              <button type="button" onClick={sendOrder} disabled={saving || cart.length === 0} className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-app-border px-4 py-3 text-sm font-bold text-app-text transition hover:bg-app-elevated disabled:opacity-50">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Utensils className="h-4 w-4" />}
                Send order without payment
              </button>
              <p className="text-center text-xs leading-5 text-app-muted">Use checkout for walk-in payments. Send without payment when the guest will settle later.</p>
            </div>
          ) : (
            <div className="mt-5 space-y-4 rounded-lg border border-brand-500/30 bg-brand-500/5 p-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-brand-600">Collect payment</p>
                <p className="mt-1 text-sm text-app-muted">Choose how the guest is paying before closing the invoice.</p>
              </div>
              <label className="block space-y-2">
                <span className="text-xs font-bold uppercase text-app-muted">Payment method</span>
                <select required value={sale.payment_method} onChange={(event) => setSale((current) => ({ ...current, payment_method: event.target.value, reference: '', amount_received: '' }))} className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500">
                  <option value="">Select payment method</option>
                  {paymentMethods.map((method) => <option key={method.id} value={method.id}>{method.name}</option>)}
                </select>
              </label>
              {isCashPayment ? (
                <label className="block space-y-2">
                  <span className="text-xs font-bold uppercase text-app-muted">Cash received</span>
                  <input required min={subtotal} step="0.01" type="number" inputMode="decimal" value={sale.amount_received} onChange={(event) => setSale((current) => ({ ...current, amount_received: event.target.value }))} placeholder={subtotal.toFixed(2)} className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500" />
                </label>
              ) : null}
              {selectedPaymentMethod?.requires_reference ? (
                <label className="block space-y-2">
                  <span className="text-xs font-bold uppercase text-app-muted">Payment reference</span>
                  <input required value={sale.reference} onChange={(event) => setSale((current) => ({ ...current, reference: event.target.value }))} placeholder="M-Pesa code, card approval, bank ref..." className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500" />
                </label>
              ) : null}
              {isCashPayment && amountReceived >= subtotal ? (
                <div className="flex items-center justify-between rounded-md bg-app-elevated p-3">
                  <span className="text-sm font-bold text-app-muted">Change to return</span>
                  <span className="text-lg font-black text-app-text">{money(changeDue)}</span>
                </div>
              ) : null}
              <button type="submit" disabled={saving || !selectedPaymentMethod} className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-50">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Banknote className="h-4 w-4" />}
                Collect {money(subtotal)}
              </button>
              <button type="button" onClick={() => setCheckoutOpen(false)} disabled={saving} className="w-full rounded-md px-4 py-2 text-sm font-bold text-app-muted transition hover:bg-app-elevated hover:text-app-text">
                Back to order
              </button>
            </div>
          )}
        </form>
      </div>

      {receipt ? (
        <section className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />
            <div className="min-w-0">
              <h3 className="text-lg font-black text-app-text">{receipt.paid ? 'Payment received' : 'Order sent'}</h3>
              <p className="mt-1 text-sm text-app-muted">
                Order {receipt.orderNumber}
                {receipt.invoiceNumber ? ` · Invoice ${receipt.invoiceNumber}` : ''}
              </p>
              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <span className="font-bold text-app-text">Total: {money(receipt.total)}</span>
                {receipt.paymentMethod ? <span className="font-bold text-app-text">Method: {receipt.paymentMethod}</span> : null}
                {receipt.change > 0 ? <span className="font-black text-emerald-700">Change: {money(receipt.change)}</span> : null}
              </div>
              {receipt.visitId && !receipt.paid ? (
                <Link to="/frontdesk/visits" className="mt-4 inline-flex min-h-10 items-center rounded-md bg-emerald-600 px-4 text-sm font-bold text-white">
                  Follow this stay in Guest Stays
                </Link>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
