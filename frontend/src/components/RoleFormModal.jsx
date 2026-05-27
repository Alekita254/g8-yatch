import { Check, Loader2, Save, ShieldCheck, X } from 'lucide-react';

export default function RoleFormModal({
  isOpen,
  form,
  permissionText,
  onChange,
  onPermissionTextChange,
  onToggleSync,
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
              <ShieldCheck className="h-5 w-5" />
              <p className="text-xs font-black uppercase tracking-[0.16em]">Add Role</p>
            </div>
            <h2 className="mt-2 text-2xl font-black text-app-text">Create operational role</h2>
            <p className="text-sm text-app-muted">Roles can be synced to Keycloak and assigned to users.</p>
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
            <span className="text-xs font-bold uppercase text-app-muted">Role key</span>
            <input
              value={form.key}
              onChange={(event) => onChange('key', event.target.value.toUpperCase().replace(/\s+/g, '_'))}
              required
              placeholder="POS_MANAGER"
              className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm text-app-text outline-none focus:ring-2 focus:ring-brand-500"
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase text-app-muted">Display name</span>
            <input
              value={form.name}
              onChange={(event) => onChange('name', event.target.value)}
              required
              placeholder="POS Manager"
              className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm text-app-text outline-none focus:ring-2 focus:ring-brand-500"
            />
          </label>
          <label className="space-y-2 lg:col-span-2">
            <span className="text-xs font-bold uppercase text-app-muted">Description</span>
            <textarea
              value={form.description}
              onChange={(event) => onChange('description', event.target.value)}
              rows={3}
              className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm text-app-text outline-none focus:ring-2 focus:ring-brand-500"
            />
          </label>
          <label className="space-y-2 lg:col-span-2">
            <span className="text-xs font-bold uppercase text-app-muted">Permissions optional</span>
            <input
              value={permissionText}
              onChange={(event) => onPermissionTextChange(event.target.value)}
              placeholder="Leave empty for now, or add users.manage, pos.void_items"
              className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm text-app-text outline-none focus:ring-2 focus:ring-brand-500"
            />
            <p className="text-xs text-app-muted">You can create roles without permissions and attach permission rules later.</p>
          </label>
          <button
            type="button"
            onClick={onToggleSync}
            className={`inline-flex w-fit items-center gap-2 rounded-md border px-3 py-2 text-xs font-black ${
              form.sync_to_keycloak
                ? 'border-brand-500 bg-brand-500/10 text-brand-500'
                : 'border-app-border text-app-muted'
            }`}
          >
            {form.sync_to_keycloak && <Check className="h-3 w-3" />}
            Sync to Keycloak
          </button>
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
            Save Role
          </button>
        </div>
      </form>
    </div>
  );
}
