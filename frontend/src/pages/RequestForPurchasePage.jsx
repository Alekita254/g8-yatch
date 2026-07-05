import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { CheckCircle2, ClipboardCheck, Download, FilePlus2, Loader2, Package, Plus, RefreshCcw, Send, Trash2 } from 'lucide-react';

import api from '../api';
import DataTable from '../components/DataTable';

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

function productLabel(product) {
  return `${product.name} (${product.sku})`;
}

export default function RequestForPurchasePage() {
  const [products, setProducts] = useState([]);
  const [purchasePricelists, setPurchasePricelists] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [requestForm, setRequestForm] = useState(emptyRequest);
  const [lineForm, setLineForm] = useState(emptyLine);
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

  const purchasePriceForProduct = (productId) => {
    const priceItem = selectedPurchasePricelist?.items?.find((item) => String(item.product) === String(productId));
    return priceItem?.price || '';
  };

  const addLine = (event) => {
    event.preventDefault();
    if (!selectedPurchasePricelist) {
      toast.error('Choose a purchase pricelist first');
      return;
    }
    if (!lineForm.product || !lineForm.requested_quantity) {
      toast.error('Choose a product and quantity');
      return;
    }
    if (!selectedPricelistProductIds.has(String(lineForm.product))) {
      toast.error('This product is not in the selected purchase pricelist');
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
          product_unit: product?.unit || '',
        },
      ],
    }));
    setLineForm(emptyLine);
  };

  const addLowStockLine = (product) => {
    if (selectedPurchasePricelist && !selectedPricelistProductIds.has(String(product.id))) {
      toast.error('This product is not in the selected purchase pricelist');
      return;
    }
    const quantity = product.inventory_threshold?.reorder_quantity || product.inventory_threshold?.minimum_quantity || '1';
    setRequestForm((current) => ({
      ...current,
      lines: [
        ...current.lines.filter((line) => String(line.product) !== String(product.id)),
        {
          product: product.id,
          requested_quantity: quantity,
          unit_cost: purchasePriceForProduct(product.id) || '0',
          notes: 'Low stock replenishment',
          product_name: product.name,
          product_sku: product.sku,
          product_unit: product.unit,
        },
      ],
    }));
  };

  const addPricelistItemLine = (item) => {
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
          requested_quantity: item.suggested_quantity,
          unit_cost: item.price || '0',
          notes: 'Purchase pricelist item',
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
      toast.error(err.response?.data?.detail || 'Could not download PDF');
    } finally {
      setWorkingDocument('');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-lg border border-app-border bg-app-card p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
            <FilePlus2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-app-text sm:text-2xl">Request for Purchase</h2>
            <p className="text-sm text-app-muted">Create the request, download it as PDF, approve it, then generate the requisition document.</p>
          </div>
        </div>
        <button type="button" onClick={fetchData} className="inline-flex items-center justify-center gap-2 rounded-md border border-app-border px-4 py-2 text-sm font-bold text-app-text transition hover:bg-app-card">
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <form onSubmit={createPurchaseRequest} className="space-y-5 rounded-lg border border-app-border bg-app-card p-4 sm:p-5">
          <div>
            <h3 className="font-black text-app-text">Request Details</h3>
            <p className="mt-1 text-sm text-app-muted">Choose the supplier price list first so item costs can be filled automatically.</p>
          </div>

          <label className="block text-sm font-bold text-app-text">
            Purchase Pricelist
            <select
              value={requestForm.purchase_pricelist}
              onChange={(event) => {
                const pricelist = purchasePricelists.find((item) => String(item.id) === String(event.target.value));
                const allowedProductIds = new Set((pricelist?.items || []).map((item) => String(item.product)));
                setRequestForm((current) => ({
                  ...current,
                  purchase_pricelist: event.target.value,
                  supplier_name: pricelist?.supplier_name || current.supplier_name,
                  lines: current.lines
                    .filter((line) => !event.target.value || allowedProductIds.has(String(line.product)))
                    .map((line) => ({
                      ...line,
                      unit_cost: line.unit_cost && Number(line.unit_cost) > 0
                        ? line.unit_cost
                        : pricelist?.items?.find((item) => String(item.product) === String(line.product))?.price || line.unit_cost,
                    })),
                }));
                setLineForm(emptyLine);
              }}
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

          <label className="block text-sm font-bold text-app-text">
            Notes
            <textarea
              rows={3}
              value={requestForm.notes}
              onChange={(event) => setRequestForm((current) => ({ ...current, notes: event.target.value }))}
              className="mt-1 w-full rounded-md border border-app-border bg-app-bg px-3 py-2 text-sm text-app-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </label>

          <div className="rounded-lg border border-app-border bg-app-bg p-4">
            <h4 className="font-black text-app-text">Add Product</h4>
            <div className="mt-4 space-y-4">
              <label className="block text-sm font-bold text-app-text">
                Product
                <select
                  value={lineForm.product}
                  onChange={(event) => {
                    const productId = event.target.value;
                    setLineForm((current) => ({
                      ...current,
                      product: productId,
                      unit_cost: purchasePriceForProduct(productId) || current.unit_cost,
                    }));
                  }}
                  className="mt-1 w-full rounded-md border border-app-border bg-app-card px-3 py-2 text-sm text-app-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="">Choose product</option>
                  {selectedPricelistItems
                    .filter((item) => item.product_is_active)
                    .map((item) => item.productRecord || productsById[String(item.product)])
                    .filter(Boolean)
                    .map((product) => (
                    <option key={product.id} value={product.id}>{productLabel(product)}</option>
                  ))}
                </select>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-bold text-app-text">
                  Quantity
                  <input
                    type="number"
                    min="0.001"
                    step="0.001"
                    value={lineForm.requested_quantity}
                    onChange={(event) => setLineForm((current) => ({ ...current, requested_quantity: event.target.value }))}
                    className="mt-1 w-full rounded-md border border-app-border bg-app-card px-3 py-2 text-sm text-app-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </label>
                <label className="block text-sm font-bold text-app-text">
                  Unit Cost
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={lineForm.unit_cost}
                    onChange={(event) => setLineForm((current) => ({ ...current, unit_cost: event.target.value }))}
                    className="mt-1 w-full rounded-md border border-app-border bg-app-card px-3 py-2 text-sm text-app-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </label>
              </div>

              <label className="block text-sm font-bold text-app-text">
                Line Notes
                <input
                  value={lineForm.notes}
                  onChange={(event) => setLineForm((current) => ({ ...current, notes: event.target.value }))}
                  className="mt-1 w-full rounded-md border border-app-border bg-app-card px-3 py-2 text-sm text-app-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </label>

              <button type="button" onClick={addLine} className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-app-border px-4 py-2 text-sm font-black text-app-text transition hover:bg-app-card sm:w-auto">
                <Plus className="h-4 w-4" />
                Add to Table
              </button>
            </div>
          </div>

          <DataTable
            rows={requestForm.lines}
            columns={[
              { key: 'product', header: 'Product', render: (line) => <><p className="font-black text-app-text">{line.product_name}</p><p className="text-xs font-bold uppercase text-brand-500">{line.product_sku}</p></> },
              { key: 'qty', header: 'Qty', render: (line) => `${formatQty(line.requested_quantity)} ${line.product_unit || ''}` },
              { key: 'cost', header: 'Unit Cost', render: (line) => `KES ${money(line.unit_cost)}` },
              { key: 'total', header: 'Total', render: (line) => <span className="font-black text-app-text">KES {money(Number(line.requested_quantity || 0) * Number(line.unit_cost || 0))}</span> },
              { key: 'actions', header: 'Actions', headerClassName: 'text-right', cellClassName: 'text-right', render: (line) => (
                <button type="button" onClick={() => removeLine(line.product)} className="rounded-md border border-app-border p-2 text-app-muted transition hover:bg-app-card hover:text-red-500" title="Remove item">
                  <Trash2 className="h-4 w-4" />
                </button>
              ) },
            ]}
            getRowKey={(line) => line.product}
            title={`${requestForm.lines.length} request items`}
            description={`Estimated total: KES ${money(requestTotal)}`}
            emptyMessage="Add products to build the request for purchase."
            minWidth="720px"
          />

          <button type="submit" disabled={saving || !requestForm.lines.length} className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-brand-700 disabled:opacity-50 sm:w-auto">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Generate Request for Purchase
          </button>
        </form>

        <div className="space-y-6">
        <div className="rounded-lg border border-app-border bg-app-card p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-black text-app-text">Pricelist Store Items</h3>
              <p className="text-sm text-app-muted">Only products from the selected purchase pricelist appear here.</p>
            </div>
          </div>
          <DataTable
            rows={selectedPricelistItems}
            columns={[
              { key: 'product', header: 'Product', render: (item) => <><p className="font-black text-app-text">{item.product_name}</p><p className="text-xs font-bold uppercase text-brand-500">{item.product_sku}</p></> },
              { key: 'category', header: 'Category', render: (item) => item.product_category_name },
              { key: 'stock', header: 'In Store', render: (item) => `${formatQty(item.product_quantity)} ${item.product_unit || item.unit}` },
              { key: 'price', header: 'Purchase Price', render: (item) => <span className="font-black text-app-text">KES {money(item.price)} / {item.unit}</span> },
              { key: 'status', header: 'Status', render: (item) => (
                <span className={`rounded-md px-2 py-1 text-xs font-black uppercase ${item.product_is_active ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                  {item.product_is_active ? 'Active' : 'Inactive'}
                </span>
              ) },
              { key: 'actions', header: 'Action', headerClassName: 'text-right', cellClassName: 'text-right', render: (item) => {
                const added = requestForm.lines.some((line) => String(line.product) === String(item.product));
                return (
                  <button
                    type="button"
                    onClick={() => addPricelistItemLine(item)}
                    disabled={!item.product_is_active}
                    className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-black uppercase tracking-widest transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      added
                        ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-600'
                        : 'border border-app-border text-app-text hover:bg-app-card'
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                    {added ? 'Added' : 'Request'}
                  </button>
                );
              } },
            ]}
            getRowKey={(item) => item.id || item.product}
            title={selectedPurchasePricelist ? `${selectedPricelistItems.length} supplier products` : 'Choose a purchase pricelist'}
            description={selectedPurchasePricelist ? `Products listed under ${selectedPurchasePricelist.supplier_name}.` : 'Select a purchase pricelist to show its available products.'}
            emptyMessage={selectedPurchasePricelist ? 'This purchase pricelist has no products yet.' : 'Choose a purchase pricelist above.'}
            minWidth="860px"
          />
        </div>

        <div className="rounded-lg border border-app-border bg-app-card p-4 sm:p-5">
          <h3 className="font-black text-app-text">Below Minimum</h3>
          <p className="mt-1 text-sm text-app-muted">
            {selectedPurchasePricelist
              ? 'Low-stock products are limited to the selected purchase pricelist.'
              : 'Choose a purchase pricelist to keep the request tied to one supplier.'}
          </p>
          <div className="mt-4 space-y-3">
            {visibleLowStock.length ? visibleLowStock.map((product) => (
              <div key={product.id} className="flex flex-col gap-3 rounded-lg border border-app-border bg-app-bg p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-black text-app-text">{product.name}</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-app-muted">{product.sku} · {product.unit}</p>
                  <p className="mt-1 text-sm text-app-muted">Current {formatQty(product.quantity)} · Minimum {formatQty(product.inventory_threshold?.minimum_quantity)}</p>
                </div>
                <button type="button" onClick={() => addLowStockLine(product)} className="inline-flex items-center justify-center gap-2 rounded-md border border-app-border px-3 py-2 text-xs font-black uppercase tracking-widest text-app-text transition hover:bg-app-card">
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </div>
            )) : (
              <div className="rounded-lg border border-dashed border-app-border p-5 text-center text-sm font-bold text-app-muted">No selected-pricelist items are currently below minimum stock.</div>
            )}
          </div>
        </div>
        </div>
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
