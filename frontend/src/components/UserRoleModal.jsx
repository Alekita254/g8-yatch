import { useEffect, useMemo, useState } from 'react';
import { Check, Loader2, Search, ShieldCheck, X } from 'lucide-react';

export default function UserRoleModal({
  isOpen,
  user,
  roleOptions,
  onClose,
  onSave,
  isSaving,
}) {
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (user) {
      setSelectedRoles(user.realm_roles || []);
      setQuery('');
    }
  }, [user]);

  const filteredRoles = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return roleOptions;
    return roleOptions.filter((role) =>
      `${role.label} ${role.value}`.toLowerCase().includes(normalized)
    );
  }, [query, roleOptions]);

  if (!isOpen || !user) return null;

  const userName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username;

  const toggleRole = (role) => {
    setSelectedRoles((current) =>
      current.includes(role)
        ? current.filter((item) => item !== role)
        : [...current, role]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-lg border border-app-border bg-app-card shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-app-border bg-app-elevated px-6 py-5">
          <div>
            <div className="flex items-center gap-2 text-brand-500">
              <ShieldCheck className="h-5 w-5" />
              <p className="text-xs font-black uppercase tracking-[0.16em]">Manage Roles</p>
            </div>
            <h2 className="mt-2 text-2xl font-black text-app-text">{userName}</h2>
            <p className="text-sm text-app-muted">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-app-muted transition hover:bg-app-card hover:text-app-text"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app-muted" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search roles..."
              className="h-11 w-full rounded-md border border-app-border bg-app-elevated pl-9 pr-3 text-sm text-app-text outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="mt-5 max-h-80 space-y-2 overflow-y-auto pr-1">
            {filteredRoles.length === 0 ? (
              <p className="rounded-md border border-app-border p-4 text-sm text-app-muted">
                No roles match your search.
              </p>
            ) : (
              filteredRoles.map((role) => {
                const active = selectedRoles.includes(role.value);
                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => toggleRole(role.value)}
                    className={`flex w-full items-center justify-between gap-4 rounded-md border px-4 py-3 text-left transition ${
                      active
                        ? 'border-brand-500 bg-brand-500/10'
                        : 'border-app-border bg-app-card hover:bg-app-elevated'
                    }`}
                  >
                    <span>
                      <span className="block text-sm font-black text-app-text">{role.label}</span>
                      <span className="text-xs font-bold uppercase text-app-muted">{role.value}</span>
                    </span>
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-md border ${
                        active
                          ? 'border-brand-500 bg-brand-500 text-white'
                          : 'border-app-border text-transparent'
                      }`}
                    >
                      <Check className="h-4 w-4" />
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-app-border bg-app-elevated px-6 py-4">
          <p className="text-sm font-bold text-app-muted">
            {selectedRoles.length} role{selectedRoles.length === 1 ? '' : 's'} selected
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-md border border-app-border px-4 py-2 text-sm font-bold text-app-text transition hover:bg-app-card disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onSave(user, selectedRoles)}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-50"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Roles
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
