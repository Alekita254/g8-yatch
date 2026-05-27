import { Loader2, Save, X } from 'lucide-react';

export default function TaxSetupFormModal({
  isOpen,
  title,
  eyebrow,
  icon: Icon,
  form,
  fields,
  onChange,
  onClose,
  onSubmit,
  isSaving,
  isEditing = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4">
      <form onSubmit={onSubmit} className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-app-border bg-app-card shadow-2xl">
        <div className="flex items-start justify-between border-b border-app-border bg-app-elevated px-6 py-5">
          <div>
            <div className="flex items-center gap-2 text-brand-500">
              <Icon className="h-5 w-5" />
              <p className="text-xs font-black uppercase tracking-[0.16em]">{isEditing ? `Edit ${eyebrow}` : `Add ${eyebrow}`}</p>
            </div>
            <h2 className="mt-2 text-2xl font-black text-app-text">{isEditing ? `Update ${title}` : `Create ${title}`}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-2 text-app-muted hover:bg-app-card hover:text-app-text">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-2">
          {fields.map((field) => {
            if (field.type === 'select') {
              return (
                <label key={field.name} className={`space-y-2 ${field.wide ? 'md:col-span-2' : ''}`}>
                  <span className="text-xs font-bold uppercase text-app-muted">{field.label}</span>
                  <select
                    required={field.required}
                    multiple={field.multiple}
                    value={form[field.name] ?? (field.multiple ? [] : '')}
                    onChange={(e) => {
                      const value = field.multiple
                        ? Array.from(e.target.selectedOptions).map((option) => option.value)
                        : e.target.value;
                      onChange(field.name, value);
                    }}
                    className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {field.placeholder && <option value="">{field.placeholder}</option>}
                    {field.options.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>
              );
            }

            if (field.type === 'textarea') {
              return (
                <label key={field.name} className="space-y-2 md:col-span-2">
                  <span className="text-xs font-bold uppercase text-app-muted">{field.label}</span>
                  <textarea rows={3} value={form[field.name] || ''} onChange={(e) => onChange(field.name, e.target.value)} className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" />
                </label>
              );
            }

            if (field.type === 'checkbox') {
              return (
                <label key={field.name} className="flex items-center gap-3 rounded-md border border-app-border bg-app-elevated px-3 py-2">
                  <input type="checkbox" checked={Boolean(form[field.name])} onChange={(e) => onChange(field.name, e.target.checked)} className="h-4 w-4 rounded border-app-border text-brand-600 focus:ring-brand-500" />
                  <span className="text-sm font-bold text-app-text">{field.label}</span>
                </label>
              );
            }

            return (
              <label key={field.name} className={`space-y-2 ${field.wide ? 'md:col-span-2' : ''}`}>
                <span className="text-xs font-bold uppercase text-app-muted">{field.label}</span>
                <input
                  required={field.required}
                  type={field.type || 'text'}
                  step={field.step}
                  min={field.min}
                  value={form[field.name] ?? ''}
                  onChange={(e) => onChange(field.name, field.transform ? field.transform(e.target.value) : e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                />
              </label>
            );
          })}
        </div>

        <div className="flex justify-end gap-2 border-t border-app-border bg-app-elevated px-6 py-4">
          <button type="button" onClick={onClose} disabled={isSaving} className="rounded-md border border-app-border px-4 py-2 text-sm font-bold">Cancel</button>
          <button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isEditing ? 'Update' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}
