import { Loader2, MapPin, Save, X } from 'lucide-react';

const KIND_OPTIONS = [
  ['POS_TERMINAL', 'POS Terminal'],
  ['FRONTDESK', 'Frontdesk'],
  ['BAR', 'Bar'],
  ['RESTAURANT', 'Restaurant'],
  ['WORKSHOP', 'Workshop'],
  ['MARINA', 'Marina'],
];

export default function ServicePointFormModal({
  isOpen,
  form,
  onChange,
  onClose,
  onSubmit,
  isSaving,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4">
      <form onSubmit={onSubmit} className="w-full max-w-2xl overflow-hidden rounded-lg border border-app-border bg-app-card shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-app-border bg-app-elevated px-6 py-5">
          <div>
            <div className="flex items-center gap-2 text-brand-500">
              <MapPin className="h-5 w-5" />
              <p className="text-xs font-black uppercase tracking-[0.16em]">Add Service Point</p>
            </div>
            <h2 className="mt-2 text-2xl font-black text-app-text">Register physical point</h2>
            <p className="text-sm text-app-muted">Track where staff perform service and POS actions.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-app-muted transition hover:bg-app-card hover:text-app-text"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 p-6 lg:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase text-app-muted">Name</span>
            <input
              value={form.name}
              onChange={(event) => onChange('name', event.target.value)}
              required
              placeholder="Pool Bar POS"
              className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm text-app-text outline-none focus:ring-2 focus:ring-brand-500"
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase text-app-muted">Code</span>
            <input
              value={form.code}
              onChange={(event) => onChange('code', event.target.value.toLowerCase().replace(/\s+/g, '-'))}
              required
              placeholder="pool-bar-pos"
              className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm text-app-text outline-none focus:ring-2 focus:ring-brand-500"
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase text-app-muted">Kind</span>
            <select
              value={form.kind}
              onChange={(event) => onChange('kind', event.target.value)}
              className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm text-app-text outline-none focus:ring-2 focus:ring-brand-500"
            >
              {KIND_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase text-app-muted">Terminal MAC</span>
            <input
              value={form.mac_address}
              onChange={(event) => onChange('mac_address', event.target.value)}
              placeholder="AA:BB:CC:DD:EE:FF"
              className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm text-app-text outline-none focus:ring-2 focus:ring-brand-500"
            />
          </label>
          <label className="space-y-2 lg:col-span-2">
            <span className="text-xs font-bold uppercase text-app-muted">Location</span>
            <input
              value={form.location}
              onChange={(event) => onChange('location', event.target.value)}
              placeholder="Pool bar"
              className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm text-app-text outline-none focus:ring-2 focus:ring-brand-500"
            />
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-app-border bg-app-elevated px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-md border border-app-border px-4 py-2 text-sm font-bold text-app-text transition hover:bg-app-card disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Service Point
          </button>
        </div>
      </form>
    </div>
  );
}
