import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  Loader2,
  Package,
  Plus,
  Search,
  Send,
  ShoppingCart,
  Trash2,
  X,
} from 'lucide-react';

import api from '../api';

const emptyRequest = {
  purchase_pricelist: '',
  supplier_name: '',
  notes: '',
  lines: [],
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

export default function NewRequestForPurchasePage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [purchasePricelists, setPurchasePricelists] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [requestForm, setRequestForm] = useState(emptyRequest);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [itemPickerPricelistId, setItemPickerPricelistId] = useState('');
  const [addingItems, setAddingItems] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const productsById = useMemo(
    () => Object.fromEntries(products.map((product) => [String(product.id), product])),
    [products],
  );

  const selectedPurchasePricelist = useMemo(
    () => purchasePricelists.find((pricelist) => String(pricelist.id) === String(requestForm.purchase_pricelist)),
    [purchasePricelists, requestForm.purchase_pricelist],
  );

  const itemPickerPricelist = useMemo(
    () => purchasePricelists.find((pricelist) => String(pricelist.id) === String(itemPickerPricelistId)),
    [itemPickerPricelistId, purchasePricelists],
  );

  const activePurchasePricelists = useMemo(
    () => purchasePricelists.filter((pricelist) => pricelist.is_active),
    [purchasePricelists],
  );

  const selectedPricelistItems = useMemo(() => {
    if (!itemPickerPricelist) return [];
    return (itemPickerPricelist.items || [])
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
          purchase_pricelist: itemPickerPricelist.id,
          purchase_pricelist_supplier: itemPickerPricelist.supplier_name,
          purchase_pricelist_code: itemPickerPricelist.code,
        };
      })
      .filter((item) => item.productRecord || item.product_name);
  }, [itemPickerPricelist, productsById]);

  const selectedPricelistProductIds = useMemo(
    () => new Set(selectedPricelistItems.map((item) => String(item.product))),
    [selectedPricelistItems],
  );

  const visibleLowStock = useMemo(() => (
    itemPickerPricelist
      ? lowStock.filter((product) => selectedPricelistProductIds.has(String(product.id)))
      : []
  ), [itemPickerPricelist, lowStock, selectedPricelistProductIds]);

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

  const lineSuppliers = useMemo(() => (
    Array.from(new Set(requestForm.lines.map((line) => line.purchase_pricelist_supplier).filter(Boolean)))
  ), [requestForm.lines]);

  const lineKey = (line) => `${line.product}-${line.purchase_pricelist || 'manual'}`;

  const fetchData = async () => {
    try {
      const [productsResponse, purchaseResponse, lowStockResponse] = await Promise.all([
        api.get('/api/products/items/', { params: { page_size: 100 } }),
        api.get('/api/products/purchase-pricelists/', { params: { page_size: 100 } }),
        api.get('/api/inventory/low-stock/', { params: { page_size: 100 } }),
      ]);
      setProducts(toList(productsResponse.data));
      const pricelists = toList(purchaseResponse.data);
      setPurchasePricelists(pricelists);
      setItemPickerPricelistId((current) => current || pricelists.find((pricelist) => pricelist.is_active)?.id || '');
      setLowStock(toList(lowStockResponse.data));
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to load request data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectPricelist = (pricelistId) => {
    const pricelist = purchasePricelists.find((item) => String(item.id) === String(pricelistId));
    setRequestForm((current) => ({
      ...current,
      purchase_pricelist: pricelistId,
      supplier_name: pricelist?.supplier_name || '',
    }));
    setItemPickerPricelistId(pricelistId || itemPickerPricelistId);
    setCatalogSearch('');
  };

  const addPricelistItemLine = (item, quantity = item.suggested_quantity) => {
    if (!itemPickerPricelist) {
      toast.error('Choose a purchase pricelist first');
      return;
    }
    if (!item.product_is_active) {
      toast.error('This product is inactive');
      return;
    }
    const low = visibleLowStock.some((product) => String(product.id) === String(item.product));
    setRequestForm((current) => ({
      ...current,
      lines: [
        ...current.lines.filter((line) => lineKey(line) !== `${item.product}-${item.purchase_pricelist}`),
        {
          product: item.product,
          purchase_pricelist: item.purchase_pricelist,
          purchase_pricelist_supplier: item.purchase_pricelist_supplier,
          purchase_pricelist_code: item.purchase_pricelist_code,
          requested_quantity: quantity || '1',
          unit_cost: item.price || '0',
          notes: low ? 'Low stock replenishment' : 'Purchase pricelist item',
          product_name: item.product_name,
          product_sku: item.product_sku,
          product_unit: item.product_unit || item.unit,
        },
      ],
    }));
  };

  const addAllLowStock = () => {
    if (!visibleLowStock.length) return;
    const catalogByProduct = Object.fromEntries(selectedPricelistItems.map((item) => [String(item.product), item]));
    setRequestForm((current) => {
      const lowStockKeys = new Set(visibleLowStock.map((product) => `${product.id}-${itemPickerPricelist?.id || ''}`));
      const existing = current.lines.filter((line) => !lowStockKeys.has(lineKey(line)));
      const lowStockLines = visibleLowStock.map((product) => {
        const priceItem = catalogByProduct[String(product.id)];
        return {
          product: product.id,
          purchase_pricelist: priceItem?.purchase_pricelist || itemPickerPricelist?.id || '',
          purchase_pricelist_supplier: priceItem?.purchase_pricelist_supplier || itemPickerPricelist?.supplier_name || '',
          purchase_pricelist_code: priceItem?.purchase_pricelist_code || itemPickerPricelist?.code || '',
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

  const removeLine = (targetLine) => {
    setRequestForm((current) => ({
      ...current,
      lines: current.lines.filter((line) => lineKey(line) !== lineKey(targetLine)),
    }));
  };

  const updateLine = (targetLine, field, value) => {
    setRequestForm((current) => ({
      ...current,
      lines: current.lines.map((line) => (
        lineKey(line) === lineKey(targetLine) ? { ...line, [field]: value } : line
      )),
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
      const response = await api.post('/api/inventory/documents/', {
        document_type: 'PURCHASE_REQUEST',
        status: 'SUBMITTED',
        supplier_name: requestForm.supplier_name || selectedPurchasePricelist?.supplier_name || (lineSuppliers.length === 1 ? lineSuppliers[0] : 'Multiple suppliers'),
        purchase_pricelist: selectedPurchasePricelist?.id || null,
        notes: requestForm.notes,
        lines: requestForm.lines.map((line) => ({
          product: line.product,
          purchase_pricelist: line.purchase_pricelist || null,
          requested_quantity: line.requested_quantity,
          unit_cost: line.unit_cost || '0',
          notes: line.notes || '',
        })),
      });
      toast.success('Request for purchase generated');
      navigate(`/inventory/request-for-purchase/${response.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to generate request for purchase');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>;
  }

  return (
    <>
      <form onSubmit={createPurchaseRequest} className="space-y-6">
        <section className="rounded-lg border border-app-border bg-app-card p-4 sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
            <label className="block text-sm font-bold text-app-text">
              Default Purchase Pricelist
              <select
                value={requestForm.purchase_pricelist}
                onChange={(event) => selectPricelist(event.target.value)}
                className="mt-1 w-full rounded-md border border-app-border bg-app-bg px-3 py-2 text-sm text-app-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">No default pricelist</option>
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
                <p className="mt-1 text-2xl font-black text-app-text">{selectedPurchasePricelist.items?.length || 0}</p>
              </div>
              <div className="rounded-lg border border-app-border bg-app-bg p-3">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-app-muted">Cart Suppliers</p>
                <p className="mt-1 text-2xl font-black text-app-text">{lineSuppliers.length || 1}</p>
              </div>
              <div className="rounded-lg border border-app-border bg-app-bg p-3">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-app-muted">Pricelist Code</p>
                <p className="mt-1 truncate text-sm font-black text-app-text">{selectedPurchasePricelist.code}</p>
              </div>
            </div>
          ) : null}
        </section>

        <section className="rounded-lg border border-app-border bg-app-card">
          <div className="flex flex-col gap-4 border-b border-app-border bg-app-elevated p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-black text-app-text">Request Cart</h3>
              <p className="mt-1 text-sm text-app-muted">{requestForm.lines.length} item{requestForm.lines.length === 1 ? '' : 's'} selected for this new request.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              {visibleLowStock.length ? (
                <button type="button" onClick={addAllLowStock} className="inline-flex min-h-11 items-center justify-center rounded-md border border-app-border px-4 text-sm font-black text-app-text transition hover:bg-app-card">
                  Add Low Stock
                </button>
              ) : null}
                <button
                  type="button"
                  onClick={() => setAddingItems(true)}
                  disabled={!activePurchasePricelists.length}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-black text-white transition hover:bg-brand-700 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </button>
            </div>
          </div>

          {requestForm.lines.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="border-b border-app-border bg-app-bg text-xs font-black uppercase tracking-[0.14em] text-app-muted">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Unit Cost</th>
                    <th className="px-4 py-3">Notes</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-app-border">
                  {requestForm.lines.map((line) => (
                    <tr key={lineKey(line)} className="bg-app-card align-top">
                      <td className="px-4 py-4">
                        <p className="font-black text-app-text">{line.product_name}</p>
                        <p className="mt-1 text-xs font-bold uppercase tracking-widest text-brand-500">{line.product_sku}</p>
                        <p className="mt-1 text-xs text-app-muted">{line.purchase_pricelist_supplier || 'No supplier'} · {line.purchase_pricelist_code || 'No pricelist'}</p>
                      </td>
                      <td className="px-4 py-4">
                        <input
                          type="number"
                          min="0.001"
                          step="0.001"
                          value={line.requested_quantity}
                          onChange={(event) => updateLine(line, 'requested_quantity', event.target.value)}
                          className="w-32 rounded-md border border-app-border bg-app-bg px-3 py-2 text-sm font-bold text-app-text outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={line.unit_cost}
                          onChange={(event) => updateLine(line, 'unit_cost', event.target.value)}
                          className="w-36 rounded-md border border-app-border bg-app-bg px-3 py-2 text-sm font-bold text-app-text outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <input
                          value={line.notes || ''}
                          onChange={(event) => updateLine(line, 'notes', event.target.value)}
                          className="w-56 rounded-md border border-app-border bg-app-bg px-3 py-2 text-sm text-app-text outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </td>
                      <td className="px-4 py-4 text-right font-black text-app-text">
                        KES {money(Number(line.requested_quantity || 0) * Number(line.unit_cost || 0))}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button type="button" onClick={() => removeLine(line)} className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-app-border text-app-muted transition hover:bg-app-bg hover:text-red-500" title="Remove item">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-10 text-center">
              <ShoppingCart className="mx-auto h-9 w-9 text-app-muted" />
              <p className="mt-4 font-black text-app-text">No products requested yet</p>
              <p className="mt-2 text-sm text-app-muted">Use Add Item to choose products from any purchase pricelist.</p>
            </div>
          )}

          <div className="border-t border-app-border bg-app-elevated p-4">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
              <label className="block text-sm font-bold text-app-text">
                Request Notes
                <textarea
                  rows={3}
                  value={requestForm.notes}
                  onChange={(event) => setRequestForm((current) => ({ ...current, notes: event.target.value }))}
                  className="mt-1 w-full rounded-md border border-app-border bg-app-card px-3 py-2 text-sm text-app-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </label>
              <div className="rounded-lg border border-app-border bg-app-card p-4 lg:min-w-72">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-app-muted">Estimated Total</p>
                <p className="mt-2 text-2xl font-black text-app-text">KES {money(requestTotal)}</p>
                <button type="submit" disabled={saving || !requestForm.lines.length} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-black text-white transition hover:bg-brand-700 disabled:opacity-50">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Generate Request
                </button>
              </div>
            </div>
          </div>
        </section>
      </form>

      {addingItems ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-0 sm:items-center sm:p-4">
          <div className="flex max-h-[92dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-lg border border-app-border bg-app-card shadow-2xl sm:rounded-lg">
            <div className="flex items-start justify-between gap-4 border-b border-app-border bg-app-elevated p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-app-text">Add Supplier Items</h3>
                  <p className="mt-1 text-sm text-app-muted">Choose any purchase pricelist and add its products to the same request cart.</p>
                </div>
              </div>
              <button type="button" onClick={() => setAddingItems(false)} className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-app-border text-app-muted transition hover:bg-app-card hover:text-app-text" aria-label="Close item picker">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-3 border-b border-app-border p-4 md:grid-cols-[0.8fr_1fr]">
              <label className="block text-sm font-bold text-app-text">
                Item Purchase Pricelist
                <select
                  value={itemPickerPricelistId}
                  onChange={(event) => {
                    setItemPickerPricelistId(event.target.value);
                    setCatalogSearch('');
                  }}
                  className="mt-1 w-full rounded-md border border-app-border bg-app-bg px-3 py-2 text-sm text-app-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  {activePurchasePricelists.map((pricelist) => (
                    <option key={pricelist.id} value={pricelist.id}>{pricelist.supplier_name} - {pricelist.code}</option>
                  ))}
                </select>
              </label>
              <label className="relative block self-end">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app-muted" />
                <input
                  value={catalogSearch}
                  onChange={(event) => setCatalogSearch(event.target.value)}
                  placeholder="Search supplier catalog"
                  className="w-full rounded-md border border-app-border bg-app-bg py-2 pl-9 pr-3 text-sm text-app-text outline-none focus:ring-2 focus:ring-brand-500"
                />
              </label>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredCatalogItems.length ? (
                <div className="divide-y divide-app-border">
                  {filteredCatalogItems.map((item) => {
                    const added = requestForm.lines.some((line) => lineKey(line) === `${item.product}-${item.purchase_pricelist}`);
                    const low = visibleLowStock.some((product) => String(product.id) === String(item.product));
                    return (
                      <div key={item.id || item.product} className="grid gap-4 p-4 md:grid-cols-[1fr_150px_150px_auto] md:items-center">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-black text-app-text">{item.product_name}</p>
                            {low ? <span className="rounded-md bg-red-500/10 px-2 py-1 text-[11px] font-black uppercase text-red-600">Low stock</span> : null}
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
                          <p className="text-xs font-black uppercase tracking-[0.14em] text-app-muted">Price</p>
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
                          {added ? 'Added' : 'Add'}
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
        </div>
      ) : null}
    </>
  );
}
