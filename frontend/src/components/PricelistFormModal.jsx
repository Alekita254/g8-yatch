import { Link } from 'react-router-dom';
import { Loader2, MapPin, Save, Tags, X } from 'lucide-react';

export default function PricelistFormModal({
  isOpen,
  mode,
  form,
  onChange,
  onClose,
  onSubmit,
  isSaving,
  isEditing = false,
  servicePoints = [],
}) {
  if (!isOpen) return null;

  const purchase = mode === 'purchase';
  const activeServicePoints = servicePoints.filter((point) => point.is_active);
  const selectedServicePoints = Array.isArray(form.service_points) ? form.service_points.map(String) : [];
  const toggleServicePoint = (pointId) => {
    const id = String(pointId);
    const next = selectedServicePoints.includes(id)
      ? selectedServicePoints.filter((selectedId) => selectedId !== id)
      : [...selectedServicePoints, id];
    onChange('service_points', next);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4">
      <form onSubmit={onSubmit} className="w-full max-w-2xl overflow-hidden rounded-lg border border-app-border bg-app-card shadow-2xl">
        <div className="flex items-start justify-between border-b border-app-border bg-app-elevated px-6 py-5">
          <div>
            <div className="flex items-center gap-2 text-brand-500">
              <Tags className="h-5 w-5" />
              <p className="text-xs font-black uppercase tracking-[0.16em]">{isEditing ? 'Edit Pricelist' : 'Add Pricelist'}</p>
            </div>
            <h2 className="mt-2 text-2xl font-black text-app-text">
              {isEditing
                ? purchase ? 'Update purchase pricelist' : 'Update sales pricelist'
                : purchase ? 'Create purchase pricelist' : 'Create sales pricelist'}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-2 text-app-muted hover:bg-app-card hover:text-app-text">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase text-app-muted">{purchase ? 'Supplier name' : 'Name'}</span>
            <input required value={purchase ? form.supplier_name : form.name} onChange={(e) => onChange(purchase ? 'supplier_name' : 'name', e.target.value)} className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase text-app-muted">Code</span>
            <input required value={form.code} onChange={(e) => onChange('code', e.target.value.toLowerCase().replace(/\s+/g, '-'))} className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" />
          </label>
          {!purchase && (
            <div className="space-y-2 md:col-span-2">
              <span className="text-xs font-bold uppercase text-app-muted">Service points</span>
              {activeServicePoints.length ? (
                <div className="rounded-md border border-app-border bg-app-elevated p-3">
                  <div className="grid max-h-44 gap-2 overflow-y-auto md:grid-cols-2">
                    {activeServicePoints.map((point) => {
                      const checked = selectedServicePoints.includes(String(point.id));
                      return (
                        <label key={point.id} className={`flex items-center gap-3 rounded-md border px-3 py-2 text-sm font-bold transition ${checked ? 'border-brand-500 bg-brand-500/10 text-app-text' : 'border-app-border text-app-muted hover:text-app-text'}`}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleServicePoint(point.id)}
                            className="h-4 w-4 accent-brand-600"
                          />
                          <span>{point.name} - {point.kind_display || point.kind}</span>
                        </label>
                      );
                    })}
                  </div>
                  <p className="mt-3 text-xs font-bold text-app-muted">
                    Leave all unchecked to apply this pricelist everywhere.
                  </p>
                </div>
              ) : (
                <div className="rounded-md border border-app-border bg-app-elevated p-3">
                  <p className="text-sm font-bold text-app-muted">Create a service point before assigning this pricelist.</p>
                  <Link to="/users/service-points" onClick={onClose} className="mt-3 inline-flex items-center gap-2 text-sm font-black text-brand-600">
                    <MapPin className="h-4 w-4" />
                    Open service points
                  </Link>
                </div>
              )}
            </div>
          )}
          <label className="space-y-2 md:col-span-2">
            <span className="text-xs font-bold uppercase text-app-muted">Description</span>
            <textarea rows={3} value={form.description} onChange={(e) => onChange('description', e.target.value)} className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" />
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-app-border bg-app-elevated px-6 py-4">
          <button type="button" onClick={onClose} disabled={isSaving} className="rounded-md border border-app-border px-4 py-2 text-sm font-bold">Cancel</button>
          <button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isEditing ? 'Update Pricelist' : 'Save Pricelist'}
          </button>
        </div>
      </form>
    </div>
  );
}
