import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Banknote, ConciergeBell, Loader2, Martini, Minus, Plus, ReceiptText, ShoppingCart, Utensils } from 'lucide-react';

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
  const [sale, setSale] = useState({
    table_name: '',
    customer_name: '',
    payment_method: '',
    reference: '',
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
        setPaymentMethods((paymentMethodsResponse.data.results || []).filter((method) => method.is_active));
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

  const selectPoint = (point) => {
    setSelectedPointId(point.id);
    setCart([]);
    setSale({ table_name: '', customer_name: '', payment_method: '', reference: '' });
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

  const checkout = async (event) => {
    event.preventDefault();
    if (!selectedPoint || cart.length === 0) return;

    try {
      setSaving(true);
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

      if (sale.payment_method) {
        const invoiceResponse = await api.post(`/api/sales/orders/${orderResponse.data.id}/invoice/`);
        await api.post('/api/sales/payments/', {
          invoice: invoiceResponse.data.id,
          payment_method: sale.payment_method,
          amount: subtotal.toFixed(2),
          reference: sale.reference,
        });
        toast.success('Sale invoiced and paid');
      } else {
        toast.success('Sales order created');
      }

      setCart([]);
      setSale({ table_name: '', customer_name: '', payment_method: '', reference: '' });
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to complete sale');
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
          <button type="button" onClick={() => setSelectedPointId('')} className="inline-flex items-center justify-center gap-2 rounded-md border border-app-border px-4 py-2 text-sm font-bold text-app-text transition hover:bg-app-elevated">
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
        <button type="button" onClick={() => setSelectedPointId('')} className="inline-flex items-center justify-center gap-2 rounded-md border border-app-border px-4 py-2 text-sm font-bold text-app-text transition hover:bg-app-elevated">
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

        <form onSubmit={checkout} className="rounded-lg border border-app-border bg-app-card p-5">
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
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase text-app-muted">Settle now</span>
              <select value={sale.payment_method} onChange={(event) => setSale((current) => ({ ...current, payment_method: event.target.value }))} className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500">
                <option value="">Create order only</option>
                {paymentMethods.map((method) => <option key={method.id} value={method.id}>{method.name}</option>)}
              </select>
            </label>
            {sale.payment_method ? (
              <label className="space-y-2">
                <span className="text-xs font-bold uppercase text-app-muted">Payment reference</span>
                <input value={sale.reference} onChange={(event) => setSale((current) => ({ ...current, reference: event.target.value }))} placeholder="Receipt, M-Pesa, approval ref..." className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" />
              </label>
            ) : null}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-app-border pt-4">
            <span className="text-sm font-black uppercase text-app-muted">Total</span>
            <span className="text-2xl font-black text-app-text">{money(subtotal)}</span>
          </div>
          <button type="submit" disabled={saving || cart.length === 0} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Banknote className="h-4 w-4" />}
            Complete Sale
          </button>
        </form>
      </div>
    </div>
  );
}
