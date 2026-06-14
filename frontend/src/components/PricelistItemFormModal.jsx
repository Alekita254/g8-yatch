import { Loader2, Plus, Save, X } from 'lucide-react';
import ModalLayer from './ModalLayer';

const units = ['EACH', 'KG', 'G', 'L', 'ML', 'HOUR'];

export default function PricelistItemFormModal({
  isOpen,
  mode,
  form,
  products,
  onChange,
  onClose,
  onSubmit,
  isSaving,
}) {
  if (!isOpen) return null;

  const purchase = mode === 'purchase';
  const productOptions = purchase
    ? products.filter((product) => product.product_type === 'RAW' || product.is_inventory_tracked)
    : products.filter((product) => product.is_sellable);

  return (
    <ModalLayer label="Add product price" onClose={onClose}>
      <form onSubmit={onSubmit} className="w-full max-w-xl overflow-hidden rounded-lg border border-app-border bg-app-card shadow-2xl">
        <div className="flex items-start justify-between border-b border-app-border bg-app-elevated px-6 py-5">
          <div>
            <div className="flex items-center gap-2 text-brand-500">
              <Plus className="h-5 w-5" />
              <p className="text-xs font-black uppercase tracking-[0.16em]">Add Price</p>
            </div>
            <h2 className="mt-2 text-2xl font-black text-app-text">
              {purchase ? 'Add supplier product price' : 'Add selling product price'}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-2 text-app-muted hover:bg-app-card hover:text-app-text">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-2">
          <label className="space-y-2 md:col-span-2">
            <span className="text-xs font-bold uppercase text-app-muted">Product</span>
            <select required value={form.product} onChange={(e) => onChange('product', e.target.value)} className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500">
              <option value="">Select product</option>
              {productOptions.map((product) => (
                <option key={product.id} value={product.id}>{product.name} - {product.sku}</option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase text-app-muted">Price</span>
            <input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => onChange('price', e.target.value)} className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase text-app-muted">Currency</span>
            <input required maxLength={3} value={form.currency} onChange={(e) => onChange('currency', e.target.value.toUpperCase())} className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" />
          </label>
          {purchase && (
            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-bold uppercase text-app-muted">Purchase unit</span>
              <select value={form.unit} onChange={(e) => onChange('unit', e.target.value)} className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500">
                {units.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
              </select>
            </label>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-app-border bg-app-elevated px-6 py-4">
          <button type="button" onClick={onClose} disabled={isSaving} className="rounded-md border border-app-border px-4 py-2 text-sm font-bold">Cancel</button>
          <button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Price
          </button>
        </div>
      </form>
    </ModalLayer>
  );
}
