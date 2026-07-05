import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  CheckCircle2,
  ClipboardCheck,
  FilePlus2,
  Loader2,
  PackageCheck,
  Plus,
  RefreshCcw,
  Save,
  Send,
  Truck,
  Warehouse,
} from 'lucide-react';

import api from '../api';

const emptyThreshold = {
  product: '',
  minimum_quantity: '',
  reorder_quantity: '',
  is_active: true,
};

const emptyRequest = {
  purchase_pricelist: '',
  supplier_name: '',
  notes: '',
  lines: [],
};

const emptyLine = {
  product: '',
  requested_quantity: '',
  unit_cost: '',
  notes: '',
};

const documentLabels = {
  PURCHASE_REQUEST: 'Purchase Requests',
  REQUISITION: 'Requisitions',
  GOODS_DELIVERY_NOTE: 'Delivery Notes',
  GOODS_RECEIVED_NOTE: 'Goods Received',
};

const statusStyles = {
  DRAFT: 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200',
  SUBMITTED: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200',
  APPROVED: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200',
  RECEIVED: 'border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-200',
  CANCELLED: 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200',
};

function toList(data) {
  return Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
}

function formatQty(value) {
  const number = Number(value || 0);
  return Number.isInteger(number) ? String(number) : number.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
}

function productLabel(product) {
  return `${product.name} (${product.sku})`;
}

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [purchasePricelists, setPurchasePricelists] = useState([]);
  const [thresholds, setThresholds] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [movements, setMovements] = useState([]);
  const [thresholdForm, setThresholdForm] = useState(emptyThreshold);
  const [requestForm, setRequestForm] = useState(emptyRequest);
  const [lineForm, setLineForm] = useState(emptyLine);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const trackedProducts = useMemo(
    () => products.filter((product) => product.is_active && product.is_inventory_tracked),
    [products],
  );

  const productsById = useMemo(
    () => Object.fromEntries(products.map((product) => [String(product.id), product])),
    [products],
  );

  const selectedPurchasePricelist = useMemo(
    () => purchasePricelists.find((pricelist) => String(pricelist.id) === String(requestForm.purchase_pricelist)),
    [purchasePricelists, requestForm.purchase_pricelist],
  );

  const openDocuments = useMemo(
    () => documents.filter((document) => !['RECEIVED', 'CANCELLED'].includes(document.status)),
    [documents],
  );

  const receivedDocuments = useMemo(
    () => documents.filter((document) => document.document_type === 'GOODS_RECEIVED_NOTE'),
    [documents],
  );

  const fetchInventory = async () => {
    try {
      const [productsResponse, thresholdsResponse, lowStockResponse, documentsResponse, movementsResponse, purchaseResponse] = await Promise.all([
        api.get('/api/products/items/', { params: { page_size: 100 } }),
        api.get('/api/inventory/thresholds/', { params: { page_size: 100 } }),
        api.get('/api/inventory/low-stock/', { params: { page_size: 100 } }),
        api.get('/api/inventory/documents/', { params: { page_size: 100 } }),
        api.get('/api/inventory/movements/', { params: { page_size: 10 } }),
        api.get('/api/products/purchase-pricelists/', { params: { page_size: 100 } }),
      ]);
      setProducts(toList(productsResponse.data));
      setPurchasePricelists(toList(purchaseResponse.data));
      setThresholds(toList(thresholdsResponse.data));
      setLowStock(toList(lowStockResponse.data));
      setDocuments(toList(documentsResponse.data));
      setMovements(toList(movementsResponse.data));
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const purchasePriceForProduct = (productId) => {
    const priceItem = selectedPurchasePricelist?.items?.find((item) => String(item.product) === String(productId));
    return priceItem?.price || '';
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const saveThreshold = async (event) => {
    event.preventDefault();
    if (!thresholdForm.product) {
      toast.error('Choose a product first');
      return;
    }

    try {
      setSaving(true);
      await api.post('/api/inventory/thresholds/', {
        ...thresholdForm,
        minimum_quantity: thresholdForm.minimum_quantity || '0',
        reorder_quantity: thresholdForm.reorder_quantity || thresholdForm.minimum_quantity || '0',
      });
      setThresholdForm(emptyThreshold);
      await fetchInventory();
      toast.success('Inventory threshold saved');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save threshold');
    } finally {
      setSaving(false);
    }
  };

  const addRequestLine = (event) => {
    event.preventDefault();
    if (!lineForm.product || !lineForm.requested_quantity) {
      toast.error('Choose a product and quantity');
      return;
    }
    const product = productsById[String(lineForm.product)];
    setRequestForm((current) => ({
      ...current,
      lines: [
        ...current.lines.filter((line) => String(line.product) !== String(lineForm.product)),
        {
          ...lineForm,
          unit_cost: lineForm.unit_cost || purchasePriceForProduct(lineForm.product) || '0',
          product_name: product?.name || '',
          product_sku: product?.sku || '',
        },
      ],
    }));
    setLineForm(emptyLine);
  };

  const addLowStockLine = (product) => {
    const quantity = product.inventory_threshold?.reorder_quantity || product.inventory_threshold?.minimum_quantity || '1';
    const unitCost = purchasePriceForProduct(product.id) || '0';
    setRequestForm((current) => ({
      ...current,
      lines: [
        ...current.lines.filter((line) => String(line.product) !== String(product.id)),
        {
          product: product.id,
          requested_quantity: quantity,
          unit_cost: unitCost,
          notes: 'Low stock replenishment',
          product_name: product.name,
          product_sku: product.sku,
        },
      ],
    }));
    toast.success(`${product.name} added to request`);
  };

  const removeRequestLine = (productId) => {
    setRequestForm((current) => ({
      ...current,
      lines: current.lines.filter((line) => String(line.product) !== String(productId)),
    }));
  };

  const createPurchaseRequest = async (event) => {
    event.preventDefault();
    if (!requestForm.lines.length) {
      toast.error('Add at least one item to the request');
      return;
    }

    try {
      setSaving(true);
      await api.post('/api/inventory/documents/', {
        document_type: 'PURCHASE_REQUEST',
        status: 'SUBMITTED',
        supplier_name: requestForm.supplier_name || selectedPurchasePricelist?.supplier_name || '',
        notes: requestForm.notes,
        lines: requestForm.lines.map((line) => ({
          product: line.product,
          requested_quantity: line.requested_quantity,
          unit_cost: line.unit_cost || '0',
          notes: line.notes || '',
        })),
      });
      setRequestForm(emptyRequest);
      await fetchInventory();
      toast.success('Purchase request created');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create request');
    } finally {
      setSaving(false);
    }
  };

  const runDocumentAction = async (document, action, successMessage) => {
    try {
      setSaving(true);
      await api.post(`/api/inventory/documents/${document.id}/${action}/`);
      await fetchInventory();
      toast.success(successMessage);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update document');
    } finally {
      setSaving(false);
    }
  };

  const renderDocumentActions = (document) => {
    if (document.document_type === 'PURCHASE_REQUEST' && document.status !== 'APPROVED') {
      return (
        <button
          type="button"
          onClick={() => runDocumentAction(document, 'approve', 'Purchase request approved')}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-app-border px-3 py-2 text-xs font-black uppercase tracking-widest text-app-text transition hover:bg-app-card disabled:opacity-50"
        >
          <CheckCircle2 className="h-4 w-4" />
          Approve
        </button>
      );
    }

    if (document.document_type === 'PURCHASE_REQUEST' && document.status === 'APPROVED') {
      return (
        <button
          type="button"
          onClick={() => runDocumentAction(document, 'requisition', 'Requisition created')}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-app-border px-3 py-2 text-xs font-black uppercase tracking-widest text-app-text transition hover:bg-app-card disabled:opacity-50"
        >
          <ClipboardCheck className="h-4 w-4" />
          Requisition
        </button>
      );
    }

    if (document.document_type === 'REQUISITION' && document.status !== 'RECEIVED') {
      return (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => runDocumentAction(document, 'delivery-note', 'Delivery note created')}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-app-border px-3 py-2 text-xs font-black uppercase tracking-widest text-app-text transition hover:bg-app-card disabled:opacity-50"
          >
            <Truck className="h-4 w-4" />
            Delivery Note
          </button>
          <button
            type="button"
            onClick={() => runDocumentAction(document, 'receive', 'Goods received and stock updated')}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-600 px-3 py-2 text-xs font-black uppercase tracking-widest text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            <PackageCheck className="h-4 w-4" />
            Receive
          </button>
        </div>
      );
    }

    if (document.document_type === 'GOODS_DELIVERY_NOTE' && document.status !== 'RECEIVED') {
      return (
        <button
          type="button"
          onClick={() => runDocumentAction(document, 'receive', 'Goods received and stock updated')}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-600 px-3 py-2 text-xs font-black uppercase tracking-widest text-white transition hover:bg-brand-700 disabled:opacity-50"
        >
          <PackageCheck className="h-4 w-4" />
          Receive
        </button>
      );
    }

    return <span className="text-xs font-bold uppercase tracking-widest text-app-muted">No action</span>;
  };

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-lg border border-app-border bg-app-card p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
            <Warehouse className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-app-text sm:text-2xl">Inventory</h2>
            <p className="text-sm text-app-muted">Track stock, prepare purchase requests, receive goods, and update product quantities.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchInventory}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-app-border px-4 py-2 text-sm font-bold text-app-text transition hover:bg-app-card"
        >
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Low Stock', lowStock.length],
          ['Tracked Items', trackedProducts.length],
          ['Thresholds', thresholds.length],
          ['Open Documents', openDocuments.length],
          ['Goods Received', receivedDocuments.length],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-app-border bg-app-card p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-app-muted">{label}</p>
            <p className="mt-2 text-3xl font-black text-app-text">{value}</p>
          </div>
        ))}
      </div>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <form onSubmit={saveThreshold} className="rounded-lg border border-app-border bg-app-card p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <Save className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-black text-app-text">Minimum Stock</h3>
              <p className="text-sm text-app-muted">Choose an existing product and define when it should be requested again.</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-bold text-app-text">
              Product
              <select
                value={thresholdForm.product}
                onChange={(event) => setThresholdForm((current) => ({ ...current, product: event.target.value }))}
                className="mt-1 w-full rounded-md border border-app-border bg-app-bg px-3 py-2 text-sm text-app-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                required
              >
                <option value="">Choose product</option>
                {products.filter((product) => product.is_active).map((product) => (
                  <option key={product.id} value={product.id}>{productLabel(product)}</option>
                ))}
              </select>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-bold text-app-text">
                Minimum
                <input
                  type="number"
                  min="0"
                  step="0.001"
                  value={thresholdForm.minimum_quantity}
                  onChange={(event) => setThresholdForm((current) => ({ ...current, minimum_quantity: event.target.value }))}
                  className="mt-1 w-full rounded-md border border-app-border bg-app-bg px-3 py-2 text-sm text-app-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  required
                />
              </label>
              <label className="block text-sm font-bold text-app-text">
                Request Qty
                <input
                  type="number"
                  min="0"
                  step="0.001"
                  value={thresholdForm.reorder_quantity}
                  onChange={(event) => setThresholdForm((current) => ({ ...current, reorder_quantity: event.target.value }))}
                  className="mt-1 w-full rounded-md border border-app-border bg-app-bg px-3 py-2 text-sm text-app-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </label>
            </div>
            <label className="flex items-center gap-2 text-sm font-bold text-app-text">
              <input
                type="checkbox"
                checked={thresholdForm.is_active}
                onChange={(event) => setThresholdForm((current) => ({ ...current, is_active: event.target.checked }))}
                className="h-4 w-4 rounded border-app-border text-brand-600 focus:ring-brand-500"
              />
              Active threshold
            </label>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-brand-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Threshold
            </button>
          </div>
        </form>

        <div className="rounded-lg border border-app-border bg-app-card p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
              <Warehouse className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-black text-app-text">Below Minimum</h3>
              <p className="text-sm text-app-muted">Items here are ready to be added to a purchase request.</p>
            </div>
          </div>
          <div className="space-y-3">
            {lowStock.length ? lowStock.map((product) => (
              <div key={product.id} className="flex flex-col gap-3 rounded-lg border border-app-border bg-app-bg p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-black text-app-text">{product.name}</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-app-muted">{product.sku} · {product.unit}</p>
                  <p className="mt-1 text-sm text-app-muted">
                    Current {formatQty(product.quantity)} · Minimum {formatQty(product.inventory_threshold?.minimum_quantity)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => addLowStockLine(product)}
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-app-border px-3 py-2 text-xs font-black uppercase tracking-widest text-app-text transition hover:bg-app-card"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </div>
            )) : (
              <div className="rounded-lg border border-dashed border-app-border p-5 text-center text-sm font-bold text-app-muted">
                No items are currently below minimum stock.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-app-border bg-app-card p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
            <FilePlus2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-black text-app-text">Request for Purchase</h3>
            <p className="text-sm text-app-muted">Build the request from low-stock items or enter products manually.</p>
          </div>
        </div>

        <form onSubmit={addRequestLine} className="grid gap-3 lg:grid-cols-[1.4fr_0.6fr_0.6fr_auto]">
          <select
            value={lineForm.product}
            onChange={(event) => {
              const productId = event.target.value;
              setLineForm((current) => ({
                ...current,
                product: productId,
                unit_cost: current.unit_cost || purchasePriceForProduct(productId),
              }));
            }}
            className="rounded-md border border-app-border bg-app-bg px-3 py-2 text-sm text-app-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="">Choose product</option>
            {products.filter((product) => product.is_active).map((product) => (
              <option key={product.id} value={product.id}>{productLabel(product)}</option>
            ))}
          </select>
          <input
            type="number"
            min="0.001"
            step="0.001"
            value={lineForm.requested_quantity}
            onChange={(event) => setLineForm((current) => ({ ...current, requested_quantity: event.target.value }))}
            placeholder="Quantity"
            className="rounded-md border border-app-border bg-app-bg px-3 py-2 text-sm text-app-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          <input
            type="number"
            min="0"
            step="0.01"
            value={lineForm.unit_cost}
            onChange={(event) => setLineForm((current) => ({ ...current, unit_cost: event.target.value }))}
            placeholder="Unit cost"
            className="rounded-md border border-app-border bg-app-bg px-3 py-2 text-sm text-app-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-app-border px-4 py-2 text-sm font-black text-app-text transition hover:bg-app-bg"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </button>
        </form>

        <form onSubmit={createPurchaseRequest} className="mt-4 space-y-4">
          <div className="grid gap-3 lg:grid-cols-2">
            <select
              value={requestForm.purchase_pricelist || ''}
              onChange={(event) => {
                const pricelist = purchasePricelists.find((item) => String(item.id) === String(event.target.value));
                setRequestForm((current) => ({
                  ...current,
                  purchase_pricelist: event.target.value,
                  supplier_name: pricelist?.supplier_name || current.supplier_name,
                  lines: current.lines.map((line) => ({
                    ...line,
                    unit_cost: line.unit_cost && Number(line.unit_cost) > 0
                      ? line.unit_cost
                      : pricelist?.items?.find((item) => String(item.product) === String(line.product))?.price || line.unit_cost,
                  })),
                }));
                if (lineForm.product && !lineForm.unit_cost) {
                  const priceItem = pricelist?.items?.find((item) => String(item.product) === String(lineForm.product));
                  setLineForm((current) => ({ ...current, unit_cost: priceItem?.price || current.unit_cost }));
                }
              }}
              className="rounded-md border border-app-border bg-app-bg px-3 py-2 text-sm text-app-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">Choose purchase pricelist</option>
              {purchasePricelists.filter((pricelist) => pricelist.is_active).map((pricelist) => (
                <option key={pricelist.id} value={pricelist.id}>{pricelist.supplier_name} - {pricelist.code}</option>
              ))}
            </select>
            <input
              value={requestForm.supplier_name}
              onChange={(event) => setRequestForm((current) => ({ ...current, supplier_name: event.target.value }))}
              placeholder="Supplier name"
              className="rounded-md border border-app-border bg-app-bg px-3 py-2 text-sm text-app-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            <input
              value={requestForm.notes}
              onChange={(event) => setRequestForm((current) => ({ ...current, notes: event.target.value }))}
              placeholder="Notes"
              className="rounded-md border border-app-border bg-app-bg px-3 py-2 text-sm text-app-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div className="space-y-2">
            {requestForm.lines.length ? requestForm.lines.map((line) => (
              <div key={line.product} className="flex flex-col gap-3 rounded-lg border border-app-border bg-app-bg p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-black text-app-text">{line.product_name || productsById[String(line.product)]?.name || 'Product'}</p>
                  <p className="text-sm text-app-muted">Qty {formatQty(line.requested_quantity)} · Unit cost {Number(line.unit_cost || 0).toLocaleString()}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeRequestLine(line.product)}
                  className="rounded-md border border-app-border px-3 py-2 text-xs font-black uppercase tracking-widest text-app-muted transition hover:bg-app-card hover:text-red-500"
                >
                  Remove
                </button>
              </div>
            )) : (
              <div className="rounded-lg border border-dashed border-app-border p-5 text-center text-sm font-bold text-app-muted">
                No items added to this request yet.
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={saving || !requestForm.lines.length}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-brand-700 disabled:opacity-50 sm:w-auto"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Create Purchase Request
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-app-border bg-app-card p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
            <ClipboardCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-black text-app-text">Procurement Documents</h3>
            <p className="text-sm text-app-muted">Move documents through approval, requisition, delivery, and receiving.</p>
          </div>
        </div>

        <div className="space-y-3">
          {documents.length ? documents.map((document) => (
            <article key={document.id} className="rounded-lg border border-app-border bg-app-bg p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-black text-app-text">{document.document_number}</h4>
                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black uppercase tracking-widest ${statusStyles[document.status] || statusStyles.DRAFT}`}>
                      {document.status_display || document.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-bold text-app-muted">
                    {documentLabels[document.document_type] || document.document_type}
                    {document.source_document_number ? ` from ${document.source_document_number}` : ''}
                  </p>
                  {document.supplier_name && <p className="mt-1 text-sm text-app-muted">Supplier: {document.supplier_name}</p>}
                </div>
                {renderDocumentActions(document)}
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {(document.lines || []).map((line) => (
                  <div key={line.id} className="rounded-md border border-app-border bg-app-card px-3 py-2">
                    <p className="text-sm font-black text-app-text">{line.product_name}</p>
                    <p className="text-xs font-bold uppercase tracking-widest text-app-muted">
                      Requested {formatQty(line.requested_quantity)}
                      {Number(line.received_quantity || 0) > 0 ? ` · Received ${formatQty(line.received_quantity)}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          )) : (
            <div className="rounded-lg border border-dashed border-app-border p-6 text-center text-sm font-bold text-app-muted">
              No inventory documents yet.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-app-border bg-app-card p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10 text-sky-500">
            <PackageCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-black text-app-text">Recent Stock Updates</h3>
            <p className="text-sm text-app-muted">Latest goods received movements that changed product stock.</p>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {movements.length ? movements.map((movement) => (
            <div key={movement.id} className="rounded-md border border-app-border bg-app-bg p-3">
              <p className="font-black text-app-text">{movement.product_name}</p>
              <p className="text-sm text-app-muted">{movement.document_number || 'Manual movement'} · {movement.movement_type} {formatQty(movement.quantity)}</p>
            </div>
          )) : (
            <div className="rounded-lg border border-dashed border-app-border p-5 text-center text-sm font-bold text-app-muted sm:col-span-2 xl:col-span-3">
              Stock updates will appear after goods are received.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
