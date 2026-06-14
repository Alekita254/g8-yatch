import { Loader2, ListTree, Save, X } from 'lucide-react';
import ModalLayer from './ModalLayer';

export default function ProductCategoryFormModal({
  isOpen,
  form,
  categories,
  onChange,
  onClose,
  onSubmit,
  isSaving,
  isEditing = false,
}) {
  if (!isOpen) return null;

  return (
    <ModalLayer label={isEditing ? 'Edit product category' : 'Add product category'} onClose={onClose}>
      <form onSubmit={onSubmit} className="w-full max-w-2xl overflow-hidden rounded-lg border border-app-border bg-app-card shadow-2xl">
        <div className="flex items-start justify-between border-b border-app-border bg-app-elevated px-6 py-5">
          <div>
            <div className="flex items-center gap-2 text-brand-500">
              <ListTree className="h-5 w-5" />
              <p className="text-xs font-black uppercase tracking-[0.16em]">{isEditing ? 'Edit Category' : 'Add Category'}</p>
            </div>
            <h2 className="mt-2 text-2xl font-black text-app-text">{isEditing ? 'Update category rulebook' : 'Create category rulebook'}</h2>
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
            <span className="text-xs font-bold uppercase text-app-muted">Code</span>
            <input required value={form.code} onChange={(e) => onChange('code', e.target.value.toLowerCase().replace(/\s+/g, '-'))} className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase text-app-muted">Parent</span>
            <select value={form.parent || ''} onChange={(e) => onChange('parent', e.target.value || null)} className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500">
              <option value="">Root category</option>
              {categories
                .filter((category) => category.id !== form.id)
                .map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase text-app-muted">UI tab</span>
            <input value={form.ui_tab} onChange={(e) => onChange('ui_tab', e.target.value)} placeholder="Dinner" className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase text-app-muted">Tax code</span>
            <input value={form.tax_code} onChange={(e) => onChange('tax_code', e.target.value)} placeholder="KRA_ETIMS_A" className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase text-app-muted">Tax rate</span>
            <input type="number" step="0.01" value={form.tax_rate} onChange={(e) => onChange('tax_rate', e.target.value)} className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase text-app-muted">Route station</span>
            <input value={form.route_station} onChange={(e) => onChange('route_station', e.target.value)} placeholder="Hot Kitchen Seafood" className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase text-app-muted">Printer IP</span>
            <input value={form.route_printer_ip} onChange={(e) => onChange('route_printer_ip', e.target.value)} placeholder="192.168.1.50" className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" />
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-app-border bg-app-elevated px-6 py-4">
          <button type="button" onClick={onClose} disabled={isSaving} className="rounded-md border border-app-border px-4 py-2 text-sm font-bold">Cancel</button>
          <button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isEditing ? 'Update Category' : 'Save Category'}
          </button>
        </div>
      </form>
    </ModalLayer>
  );
}
