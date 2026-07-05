import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  CheckCircle2,
  ClipboardCheck,
  Download,
  FilePlus2,
  Loader2,
  Package,
  Plus,
  RefreshCcw,
  Search,
  Send,
  ShoppingCart,
  Trash2,
} from 'lucide-react';

import api from '../api';
import DataTable from '../components/DataTable';

const emptyRequest = {
  purchase_pricelist: '',
  supplier_name: '',
  notes: '',
  lines: [],
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

function money(value) {
  return Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function errorDetail(error, fallback) {
  const data = error.response?.data;
  if (data instanceof ArrayBuffer) {
    try {
      const text = new TextDecoder().decode(data);
      return JSON.parse(text).detail || fallback;
    } catch {
      return fallback;
    }
  }
  return data?.detail || fallback;
}

export default function RequestForPurchasePage() {
  const [products, setProducts] = useState([]);
  const [purchasePricelists, setPurchasePricelists] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [requestForm, setRequestForm] = useState(emptyRequest);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [workingDocument, setWorkingDocument] = useState('');

  const productsById = useMemo(
    () => Object.fromEntries(products.map((product) => [String(product.id), product])),
    [products],
  );

  const selectedPurchasePricelist = useMemo(
    () => purchasePricelists.find((pricelist) => String(pricelist.id) === String(requestForm.purchase_pricelist)),
    [purchasePricelists, requestForm.purchase_pricelist],
  );

  const selectedPricelistItems = useMemo(() => {
    if (!selectedPurchasePricelist) return [];
    return (selectedPurchasePricelist.items || [])
      .map((item) => {
        const product = productsById[String(item.product)];
        return {
          ...item,
          productRecord: product,
          product_is_active: product?.is_active ?? true,
          product_quantity: product?.quantity || '0.000',
          product_unit: product?.unit || item.unit,
          product_category_name: product?.category_name || '-',
          suggested_quantity: product?.inventory_threshold?.reorder_quantity || product?.inventory_threshold?.minimum_quantity || '1',
          minimum_quantity: product?.inventory_threshold?.minimum_quantity || null,
        };
      })
      .filter((item) => item.productRecord || item.product_name);
  }, [productsById, selectedPurchasePricelist]);

  const selectedPricelistProductIds = useMemo(
    () => new Set(selectedPricelistItems.map((item) => String(item.product))),
    [selectedPricelistItems],
  );

  const visibleLowStock = useMemo(() => (
    selectedPurchasePricelist
      ? lowStock.filter((product) => selectedPricelistProductIds.has(String(product.id)))
      : []
  ), [lowStock, selectedPricelistProductIds, selectedPurchasePricelist]);

  const filteredCatalogItems = useMemo(() => {
    const search = catalogSearch.trim().toLowerCase();
    if (!search) return selectedPricelistItems;
    return selectedPricelistItems.filter((item) => [
      item.product_name,
      item.product_sku,
      item.product_category_name,
      item.product_unit,
      item.unit,
      item.price,
    ].join(' ').toLowerCase().includes(search));
  }, [catalogSearch, selectedPricelistItems]);

  const requestTotal = requestForm.lines.reduce((total, line) => (
    total + (Number(line.requested_quantity || 0) * Number(line.unit_cost || 0))
  ), 0);

  const fetchData = async () => {
    try {
      const [productsResponse, purchaseResponse, lowStockResponse, documentsResponse] = await Promise.all([
        api.get('/api/products/items/', { params: { page_size: 100 } }),
        api.get('/api/products/purchase-pricelists/', { params: { page_size: 100 } }),
        api.get('/api/inventory/low-stock/', { params: { page_size: 100 } }),
        api.get('/api/inventory/documents/', { params: { page_size: 100 } }),
      ]);
      setProducts(toList(productsResponse.data));
      setPurchasePricelists(toList(purchaseResponse.data));
      setLowStock(toList(lowStockResponse.data));
      setDocuments(toList(documentsResponse.data).filter((document) => (
        ['PURCHASE_REQUEST', 'REQUISITION'].includes(document.document_type)
      )));
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to load request for purchase data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectPricelist = (pricelistId) => {
    const pricelist = purchasePricelists.find((item) => String(item.id) === String(pricelistId));
    const allowedProductIds = new Set((pricelist?.items || []).map((item) => String(item.product)));
    setRequestForm((current) => ({
      ...current,
      purchase_pricelist: pricelistId,
      supplier_name: pricelist?.supplier_name || '',
      lines: current.lines
        .filter((line) => !pricelistId || allowedProductIds.has(String(line.product)))
        .map((line) => ({
          ...line,
          unit_cost: line.unit_cost && Number(line.unit_cost) > 0
            ? line.unit_cost
            : pricelist?.items?.find((item) => String(item.product) === String(line.product))?.price || line.unit_cost,
        })),
    }));
    setCatalogSearch('');
  };

  const addPricelistItemLine = (item, quantity = item.suggested_quantity) => {
    if (!selectedPurchasePricelist) {
      toast.error('Choose a purchase pricelist first');
      return;
    }
    if (!item.product_is_active) {
      toast.error('This product is inactive');
      return;
    }
    setRequestForm((current) => ({
      ...current,
      lines: [
        ...current.lines.filter((line) => String(line.product) !== String(item.product)),
        {
          product: item.product,
          requested_quantity: quantity || '1',
          unit_cost: item.price || '0',
          notes: visibleLowStock.some((product) => String(product.id) === String(item.product))
            ? 'Low stock replenishment'
            : 'Purchase pricelist item',
          product_name: item.product_name,
          product_sku: item.product_sku,
          product_unit: item.product_unit || item.unit,
        },
      ],
    }));
  };

  const removeLine = (productId) => {
    setRequestForm((current) => ({
      ...current,
      lines: current.lines.filter((line) => String(line.product) !== String(productId)),
    }));
  };

  const updateLine = (productId, field, value) => {
    setRequestForm((current) => ({
      ...current,
      lines: current.lines.map((line) => (
        String(line.product) === String(productId) ? { ...line, [field]: value } : line
      )),
    }));
  };

  const addAllLowStock = () => {
    if (!visibleLowStock.length) return;
    const catalogByProduct = Object.fromEntries(selectedPricelistItems.map((item) => [String(item.product), item]));
    setRequestForm((current) => {
      const existing = current.lines.filter((line) => !visibleLowStock.some((product) => String(product.id) === String(line.product)));
      const lowStockLines = visibleLowStock.map((product) => {
        const priceItem = catalogByProduct[String(product.id)];
        return {
          product: product.id,
          requested_quantity: product.inventory_threshold?.reorder_quantity || product.inventory_threshold?.minimum_quantity || '1',
          unit_cost: priceItem?.price || '0',
          notes: 'Low stock replenishment',
          product_name: product.name,
          product_sku: product.sku,
          product_unit: product.unit,
        };
      });
      return { ...current, lines: [...existing, ...lowStockLines] };
    });
  };

  const createPurchaseRequest = async (event) => {
    event.preventDefault();
    if (!selectedPurchasePricelist) {
      toast.error('Choose a purchase pricelist first');
      return;
    }
    if (!requestForm.lines.length) {
      toast.error('Add at least one item to the request');
      return;
    }

    try {
      setSaving(true);
      await api.post('/api/inventory/documents/', {
        document_type: 'PURCHASE_REQUEST',
        status: 'SUBMITTED',
        supplier_name: requestForm.supplier_name || selectedPurchasePricelist.supplier_name || '',
        purchase_pricelist: selectedPurchasePricelist.id,
        notes: requestForm.notes,
        lines: requestForm.lines.map((line) => ({
          product: line.product,
          requested_quantity: line.requested_quantity,
          unit_cost: line.unit_cost || '0',
          notes: line.notes || '',
        })),
      });
      setRequestForm(emptyRequest);
      setCatalogSearch('');
      await fetchData();
      toast.success('Request for purchase generated');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to generate request for purchase');
    } finally {
      setSaving(false);
    }
  };

  const runDocumentAction = async (document, action, successMessage) => {
    try {
      setWorkingDocument(`${action}-${document.id}`);
      await api.post(`/api/inventory/documents/${document.id}/${action}/`);
      await fetchData();
      toast.success(successMessage);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update document');
    } finally {
      setWorkingDocument('');
    }
  };

  const downloadDocument = async (inventoryDocument) => {
    try {
      setWorkingDocument(`pdf-${inventoryDocument.id}`);
      const response = await api.get(`/api/inventory/documents/${inventoryDocument.id}/pdf/`, { responseType: 'arraybuffer' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${inventoryDocument.document_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(errorDetail(err, 'Could not download PDF. Refresh the page and try again.'));
    } finally {
      setWorkingDocument('');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-app-border bg-app-card p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
              <FilePlus2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-app-text sm:text-2xl">Request for Purchase</h2>
              <p className="mt-1 text-sm text-app-muted">Choose a supplier pricelist, add products from that supplier catalog, then generate the request PDF.</p>
            </div>
          </div>
          <button type="button" onClick={fetchData} className="inline-flex items-center justify-center gap-2 rounded-md border border-app-border px-4 py-2 text-sm font-bold text-app-text transition hover:bg-app-elevated">
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            ['1', 'Choose supplier', selectedPurchasePricelist ? selectedPurchasePricelist.supplier_name : 'Waiting'],
            ['2', 'Build request', `${requestForm.lines.length} item${requestForm.lines.length === 1 ? '' : 's'}`],
            ['3', 'Generate document', requestForm.lines.length ? `KES ${money(requestTotal)}` : 'No total yet'],
          ].map(([step, label, value]) => (
            <div key={step} className="rounded-lg border border-app-border bg-app-bg p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-app-muted">Step {step}</p>
              <p className="mt-2 font-black text-app-text">{label}</p>
              <p className="mt-1 truncate text-sm text-app-muted">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="space-y-6">
          <div className="rounded-lg border border-app-border bg-app-card p-4 sm:p-5">
            <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
              <label className="block text-sm font-bold text-app-text">
                Purchase Pricelist
                <select
                  value={requestForm.purchase_pricelist}
                  onChange={(event) => selectPricelist(event.target.value)}
                  className="mt-1 w-full rounded-md border border-app-border bg-app-bg px-3 py-2 text-sm text-app-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="">Choose purchase pricelist</option>
                  {purchasePricelists.filter((pricelist) => pricelist.is_active).map((pricelist) => (
                    <option key={pricelist.id} value={pricelist.id}>{pricelist.supplier_name} - {pricelist.code}</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-bold text-app-text">
                Supplier
                <input
                  value={requestForm.supplier_name}
                  onChange={(event) => setRequestForm((current) => ({ ...current, supplier_name: event.target.value }))}
                  className="mt-1 w-full rounded-md border border-app-border bg-app-bg px-3 py-2 text-sm text-app-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </label>
            </div>

            {selectedPurchasePricelist ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-app-border bg-app-bg p-3">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-app-muted">Supplier Items</p>
                  <p className="mt-1 text-2xl font-black text-app-text">{selectedPricelistItems.length}</p>
                </div>
                <div className="rounded-lg border border-app-border bg-app-bg p-3">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-app-muted">Below Minimum</p>
                  <p className="mt-1 text-2xl font-black text-app-text">{visibleLowStock.length}</p>
                </div>
                <div className="rounded-lg border border-app-border bg-app-bg p-3">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-app-muted">Code</p>
                  <p className="mt-1 truncate text-sm font-black text-app-text">{selectedPurchasePricelist.code}</p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-lg border border-app-border bg-app-card">
            <div className="flex flex-col gap-4 border-b border-app-border bg-app-elevated p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-app-text">Supplier Catalog</h3>
                  <p className="text-sm text-app-muted">Only products in the selected purchase pricelist are available.</p>
                </div>
              </div>
              <label className="relative w-full lg:w-80">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app-muted" />
                <input
                  value={catalogSearch}
                  onChange={(event) => setCatalogSearch(event.target.value)}
                  placeholder="Search supplier catalog"
                  className="w-full rounded-md border border-app-border bg-app-card py-2 pl-9 pr-3 text-sm text-app-text outline-none focus:ring-2 focus:ring-brand-500"
                />
              </label>
            </div>

            {!selectedPurchasePricelist ? (
              <div className="p-10 text-center">
                <ShoppingCart className="mx-auto h-9 w-9 text-app-muted" />
                <p className="mt-4 font-black text-app-text">Choose a purchase pricelist first</p>
                <p className="mt-2 text-sm text-app-muted">The supplier catalog will appear here once a pricelist is selected.</p>
              </div>
            ) : filteredCatalogItems.length ? (
              <div className="divide-y divide-app-border">
                {filteredCatalogItems.map((item) => {
                  const added = requestForm.lines.some((line) => String(line.product) === String(item.product));
                  const low = visibleLowStock.some((product) => String(product.id) === String(item.product));
                  return (
                    <div key={item.id || item.product} className="grid gap-4 p-4 lg:grid-cols-[1fr_160px_170px_auto] lg:items-center">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-black text-app-text">{item.product_name}</p>
                          {low ? <span className="rounded-md bg-red-500/10 px-2 py-1 text-[11px] font-black uppercase text-red-600">Low stock</span> : null}
                          <span className={`rounded-md px-2 py-1 text-[11px] font-black uppercase ${item.product_is_active ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                            {item.product_is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="mt-1 text-xs font-bold uppercase tracking-widest text-brand-500">{item.product_sku}</p>
                        <p className="mt-1 text-sm text-app-muted">{item.product_category_name}</p>
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-app-muted">In Store</p>
                        <p className="mt-1 font-black text-app-text">{formatQty(item.product_quantity)} {item.product_unit || item.unit}</p>
                        {item.minimum_quantity ? <p className="text-xs text-app-muted">Min {formatQty(item.minimum_quantity)}</p> : null}
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-app-muted">Purchase Price</p>
                        <p className="mt-1 font-black text-app-text">KES {money(item.price)}</p>
                        <p className="text-xs text-app-muted">per {item.unit}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => addPricelistItemLine(item)}
                        disabled={!item.product_is_active}
                        className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          added
                            ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-600'
                            : 'bg-brand-600 text-white hover:bg-brand-700'
                        }`}
                      >
                        <Plus className="h-4 w-4" />
                        {added ? 'Added' : 'Request'}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-10 text-center text-sm font-bold text-app-muted">No supplier products match your search.</div>
            )}
          </div>
        </div>

        <form onSubmit={createPurchaseRequest} className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <div className="rounded-lg border border-app-border bg-app-card">
            <div className="border-b border-app-border bg-app-elevated p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-black text-app-text">Request Cart</h3>
                  <p className="text-sm text-app-muted">{requestForm.lines.length} item{requestForm.lines.length === 1 ? '' : 's'} selected</p>
                </div>
                {visibleLowStock.length ? (
                  <button type="button" onClick={addAllLowStock} className="rounded-md border border-app-border px-3 py-2 text-xs font-black uppercase tracking-widest text-app-text transition hover:bg-app-card">
                    Add Low Stock
                  </button>
                ) : null}
              </div>
            </div>

            <div className="max-h-[48rem] overflow-y-auto p-4">
              {requestForm.lines.length ? (
                <div className="space-y-3">
                  {requestForm.lines.map((line) => (
                    <div key={line.product} className="rounded-lg border border-app-border bg-app-bg p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-black text-app-text">{line.product_name}</p>
                          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-brand-500">{line.product_sku}</p>
                        </div>
                        <button type="button" onClick={() => removeLine(line.product)} className="rounded-md border border-app-border p-2 text-app-muted transition hover:bg-app-card hover:text-red-500" title="Remove item">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                        <label className="block text-xs font-black uppercase tracking-[0.12em] text-app-muted">
                          Quantity
                          <input
                            type="number"
                            min="0.001"
                            step="0.001"
                            value={line.requested_quantity}
                            onChange={(event) => updateLine(line.product, 'requested_quantity', event.target.value)}
                            className="mt-1 w-full rounded-md border border-app-border bg-app-card px-3 py-2 text-sm font-bold text-app-text outline-none focus:ring-2 focus:ring-brand-500"
                          />
                        </label>
                        <label className="block text-xs font-black uppercase tracking-[0.12em] text-app-muted">
                          Unit Cost
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={line.unit_cost}
                            onChange={(event) => updateLine(line.product, 'unit_cost', event.target.value)}
                            className="mt-1 w-full rounded-md border border-app-border bg-app-card px-3 py-2 text-sm font-bold text-app-text outline-none focus:ring-2 focus:ring-brand-500"
                          />
                        </label>
                      </div>
                      <label className="mt-3 block text-xs font-black uppercase tracking-[0.12em] text-app-muted">
                        Notes
                        <input
                          value={line.notes || ''}
                          onChange={(event) => updateLine(line.product, 'notes', event.target.value)}
                          className="mt-1 w-full rounded-md border border-app-border bg-app-card px-3 py-2 text-sm font-bold text-app-text outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </label>
                      <div className="mt-3 flex items-center justify-between rounded-md bg-app-card px-3 py-2 text-sm">
                        <span className="font-bold text-app-muted">Line total</span>
                        <span className="font-black text-app-text">KES {money(Number(line.requested_quantity || 0) * Number(line.unit_cost || 0))}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-app-border p-8 text-center">
                  <ShoppingCart className="mx-auto h-8 w-8 text-app-muted" />
                  <p className="mt-3 font-black text-app-text">No products requested yet</p>
                  <p className="mt-2 text-sm text-app-muted">Add items from the supplier catalog to build this request.</p>
                </div>
              )}
            </div>

            <div className="border-t border-app-border bg-app-elevated p-4">
              <label className="block text-sm font-bold text-app-text">
                Request Notes
                <textarea
                  rows={3}
                  value={requestForm.notes}
                  onChange={(event) => setRequestForm((current) => ({ ...current, notes: event.target.value }))}
                  className="mt-1 w-full rounded-md border border-app-border bg-app-card px-3 py-2 text-sm text-app-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </label>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-black uppercase tracking-[0.14em] text-app-muted">Estimated Total</span>
                <span className="text-2xl font-black text-app-text">KES {money(requestTotal)}</span>
              </div>
              <button type="submit" disabled={saving || !requestForm.lines.length || !selectedPurchasePricelist} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-black text-white transition hover:bg-brand-700 disabled:opacity-50">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Generate Request for Purchase
              </button>
            </div>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-app-border bg-app-card p-4 sm:p-5">
        <div className="mb-4">
          <h3 className="font-black text-app-text">Requests and Requisitions</h3>
          <p className="mt-1 text-sm text-app-muted">Download the request PDF, approve it, then create and download the requisition PDF.</p>
        </div>
        <DataTable
          rows={documents}
          columns={[
            { key: 'number', header: 'Document', render: (document) => <><p className="font-black text-app-text">{document.document_number}</p><p className="text-xs font-bold uppercase text-brand-500">{document.document_type_display}</p></> },
            { key: 'supplier', header: 'Supplier', render: (document) => document.supplier_name || '-' },
            { key: 'status', header: 'Status', render: (document) => <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black uppercase tracking-widest ${statusStyles[document.status] || statusStyles.DRAFT}`}>{document.status_display || document.status}</span> },
            { key: 'items', header: 'Items', render: (document) => `${document.lines?.length || 0} items` },
            { key: 'actions', header: 'Actions', headerClassName: 'text-right', cellClassName: 'text-right', render: (document) => (
              <div className="flex flex-wrap justify-end gap-2">
                <button type="button" onClick={() => downloadDocument(document)} disabled={Boolean(workingDocument)} className="inline-flex items-center justify-center gap-2 rounded-md border border-app-border px-3 py-2 text-xs font-black uppercase tracking-widest text-app-text transition hover:bg-app-card disabled:opacity-50">
                  {workingDocument === `pdf-${document.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  PDF
                </button>
                {document.document_type === 'PURCHASE_REQUEST' && document.status !== 'APPROVED' ? (
                  <button type="button" onClick={() => runDocumentAction(document, 'approve', 'Purchase request approved')} disabled={Boolean(workingDocument)} className="inline-flex items-center justify-center gap-2 rounded-md border border-app-border px-3 py-2 text-xs font-black uppercase tracking-widest text-app-text transition hover:bg-app-card disabled:opacity-50">
                    {workingDocument === `approve-${document.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Approve
                  </button>
                ) : null}
                {document.document_type === 'PURCHASE_REQUEST' && document.status === 'APPROVED' ? (
                  <button type="button" onClick={() => runDocumentAction(document, 'requisition', 'Requisition generated')} disabled={Boolean(workingDocument)} className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-600 px-3 py-2 text-xs font-black uppercase tracking-widest text-white transition hover:bg-brand-700 disabled:opacity-50">
                    {workingDocument === `requisition-${document.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardCheck className="h-4 w-4" />}
                    Requisition
                  </button>
                ) : null}
              </div>
            ) },
          ]}
          getRowKey={(document) => document.id}
          title={`${documents.length} documents`}
          description="Purchase requests become requisitions after approval."
          emptyMessage="No requests or requisitions have been generated yet."
          minWidth="900px"
        />
      </section>
    </div>
  );
}
