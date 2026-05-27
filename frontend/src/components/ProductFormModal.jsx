import { Loader2, Package, Save, Tags, Truck, X } from 'lucide-react';

const units = ['EACH', 'KG', 'G', 'L', 'ML', 'HOUR'];
const packageTypes = [
  ['INDIVIDUAL', 'Individual item'],
  ['DOZEN', 'Dozen'],
  ['CARTON', 'Carton'],
  ['BALE', 'Bale'],
  ['BAG', 'Bag'],
  ['SACK', 'Sack'],
  ['BOX', 'Box'],
  ['CRATE', 'Crate'],
  ['BOTTLE', 'Bottle'],
  ['CAN', 'Can'],
  ['JAR', 'Jar'],
  ['PACK', 'Pack'],
];

export default function ProductFormModal({
  isOpen,
  form,
  categories,
  purchasePricelists = [],
  salesPricelists = [],
  onChange,
  onClose,
  onSubmit,
  isSaving,
  isEditing = false,
}) {
  if (!isOpen) return null;

  const packageLabel = packageTypes.find(([value]) => value === form.package_type)?.[1] || 'Package';
  const inventoryPreview = `${form.quantity || 0} ${packageLabel.toLowerCase()}${Number(form.quantity) === 1 ? '' : 's'} x ${form.pack_size || 0} ${form.unit}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4">
      <form onSubmit={onSubmit} className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-app-border bg-app-card shadow-2xl">
        <div className="flex items-start justify-between border-b border-app-border bg-app-elevated px-6 py-5">
          <div>
            <div className="flex items-center gap-2 text-brand-500">
              <Package className="h-5 w-5" />
              <p className="text-xs font-black uppercase tracking-[0.16em]">{isEditing ? 'Edit Product' : 'Add Product'}</p>
            </div>
            <h2 className="mt-2 text-2xl font-black text-app-text">{isEditing ? 'Update product or inventory item' : 'Create product or inventory item'}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-2 text-app-muted hover:bg-app-card hover:text-app-text">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase text-app-muted">Name</span>
            <input required value={form.name} onChange={(e) => onChange('name', e.target.value)} className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase text-app-muted">SKU</span>
            <input required value={form.sku} onChange={(e) => onChange('sku', e.target.value.toUpperCase().replace(/\s+/g, '-'))} className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase text-app-muted">Type</span>
            <select value={form.product_type} onChange={(e) => onChange('product_type', e.target.value)} className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500">
              <option value="BILLABLE">Billable Unit</option>
              <option value="RAW">Raw Inventory</option>
              <option value="SERVICE">Service</option>
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase text-app-muted">Category</span>
            <select required value={form.category} onChange={(e) => onChange('category', e.target.value)} className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500">
              <option value="">Select category</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase text-app-muted">Quantity</span>
            <input required type="number" min="0" step="0.001" value={form.quantity} onChange={(e) => onChange('quantity', e.target.value)} className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase text-app-muted">Package type</span>
            <select value={form.package_type} onChange={(e) => onChange('package_type', e.target.value)} className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500">
              {packageTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase text-app-muted">Contents per package</span>
            <input required type="number" min="0.001" step="0.001" value={form.pack_size} onChange={(e) => onChange('pack_size', e.target.value)} className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase text-app-muted">Unit of measure</span>
            <select value={form.unit} onChange={(e) => onChange('unit', e.target.value)} className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500">
              {units.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
            </select>
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-xs font-bold uppercase text-app-muted">Description</span>
            <textarea rows={3} value={form.description} onChange={(e) => onChange('description', e.target.value)} className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" />
          </label>
          <label className="flex items-center gap-3 rounded-md border border-app-border bg-app-elevated px-3 py-2">
            <input type="checkbox" checked={form.is_sellable} onChange={(e) => onChange('is_sellable', e.target.checked)} className="h-4 w-4 rounded border-app-border text-brand-600 focus:ring-brand-500" />
            <span className="text-sm font-bold text-app-text">Sellable</span>
          </label>
          <label className="flex items-center gap-3 rounded-md border border-app-border bg-app-elevated px-3 py-2">
            <input type="checkbox" checked={form.is_inventory_tracked} onChange={(e) => onChange('is_inventory_tracked', e.target.checked)} className="h-4 w-4 rounded border-app-border text-brand-600 focus:ring-brand-500" />
            <span className="text-sm font-bold text-app-text">Inventory tracked</span>
          </label>
          <div className="rounded-md border border-brand-500/30 bg-brand-500/10 px-3 py-2 md:col-span-2">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-brand-500">Inventory unit preview</p>
            <p className="mt-1 text-sm font-bold text-app-text">{inventoryPreview}</p>
          </div>
        </div>

        <div className="border-t border-app-border px-6 py-5">
          <div className="flex items-center gap-2 text-brand-500">
            <Truck className="h-4 w-4" />
            <p className="text-xs font-black uppercase tracking-[0.16em]">Purchase pricelist</p>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-4">
            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-bold uppercase text-app-muted">Supplier pricelist</span>
              <select value={form.purchase_pricelist} onChange={(e) => onChange('purchase_pricelist', e.target.value)} className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500">
                <option value="">Do not add yet</option>
                {purchasePricelists.map((pricelist) => (
                  <option key={pricelist.id} value={pricelist.id}>{pricelist.supplier_name} - {pricelist.code}</option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase text-app-muted">Purchase price</span>
              <input type="number" min="0" step="0.01" value={form.purchase_price} onChange={(e) => onChange('purchase_price', e.target.value)} className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase text-app-muted">Currency</span>
              <input maxLength={3} value={form.purchase_currency} onChange={(e) => onChange('purchase_currency', e.target.value.toUpperCase())} className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" />
            </label>
          </div>
        </div>

        <div className="border-t border-app-border px-6 py-5">
          <div className="flex items-center gap-2 text-brand-500">
            <Tags className="h-4 w-4" />
            <p className="text-xs font-black uppercase tracking-[0.16em]">Sales pricelist</p>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-4">
            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-bold uppercase text-app-muted">Sales pricelist</span>
              <select value={form.sales_pricelist} onChange={(e) => onChange('sales_pricelist', e.target.value)} className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500">
                <option value="">Do not add yet</option>
                {salesPricelists.map((pricelist) => (
                  <option key={pricelist.id} value={pricelist.id}>{pricelist.name} - {pricelist.code}</option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase text-app-muted">Sales price</span>
              <input type="number" min="0" step="0.01" value={form.sales_price} onChange={(e) => onChange('sales_price', e.target.value)} className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase text-app-muted">Currency</span>
              <input maxLength={3} value={form.sales_currency} onChange={(e) => onChange('sales_currency', e.target.value.toUpperCase())} className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" />
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-app-border bg-app-elevated px-6 py-4">
          <button type="button" onClick={onClose} disabled={isSaving} className="rounded-md border border-app-border px-4 py-2 text-sm font-bold">Cancel</button>
          <button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isEditing ? 'Update Product' : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
