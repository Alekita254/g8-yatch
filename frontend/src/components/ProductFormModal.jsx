import { Loader2, Package, Save, X } from 'lucide-react';

export default function ProductFormModal({ isOpen, form, categories, onChange, onClose, onSubmit, isSaving, isEditing = false }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4">
      <form onSubmit={onSubmit} className="w-full max-w-2xl overflow-hidden rounded-lg border border-app-border bg-app-card shadow-2xl">
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
            <span className="text-xs font-bold uppercase text-app-muted">Unit</span>
            <select value={form.unit} onChange={(e) => onChange('unit', e.target.value)} className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500">
              {['EACH', 'KG', 'G', 'L', 'ML', 'HOUR'].map((unit) => <option key={unit} value={unit}>{unit}</option>)}
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
