import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Check, Loader2, Plus, Save, ShieldCheck } from 'lucide-react';

import api from '../api';

const emptyRole = {
  key: '',
  name: '',
  description: '',
  permissions: [],
  sync_to_keycloak: true,
  is_active: true,
};

export default function RolesSetupPage() {
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState(emptyRole);
  const [permissionText, setPermissionText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/users/roles/');
      setRoles(Array.isArray(response.data.results) ? response.data.results : []);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const createRole = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const permissions = permissionText
        .split(',')
        .map((permission) => permission.trim())
        .filter(Boolean);
      const response = await api.post('/api/users/roles/', { ...form, permissions });
      setRoles((current) => [response.data, ...current]);
      setForm(emptyRole);
      setPermissionText('');
      toast.success('Role created');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create role');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-app-border bg-app-card p-6">
        <div className="mb-5 flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-brand-500" />
          <div>
            <h2 className="text-2xl font-black text-app-text">Roles</h2>
            <p className="text-sm text-app-muted">Create operational roles and sync them to Keycloak.</p>
          </div>
        </div>

        <form onSubmit={createRole} className="grid gap-4 lg:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase text-app-muted">Role key</span>
            <input
              value={form.key}
              onChange={(event) => updateForm('key', event.target.value.toUpperCase().replace(/\s+/g, '_'))}
              required
              placeholder="POS_MANAGER"
              className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm text-app-text outline-none focus:ring-2 focus:ring-brand-500"
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase text-app-muted">Display name</span>
            <input
              value={form.name}
              onChange={(event) => updateForm('name', event.target.value)}
              required
              placeholder="POS Manager"
              className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm text-app-text outline-none focus:ring-2 focus:ring-brand-500"
            />
          </label>
          <label className="space-y-2 lg:col-span-2">
            <span className="text-xs font-bold uppercase text-app-muted">Description</span>
            <textarea
              value={form.description}
              onChange={(event) => updateForm('description', event.target.value)}
              rows={3}
              className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm text-app-text outline-none focus:ring-2 focus:ring-brand-500"
            />
          </label>
          <label className="space-y-2 lg:col-span-2">
            <span className="text-xs font-bold uppercase text-app-muted">Permissions optional</span>
            <input
              value={permissionText}
              onChange={(event) => setPermissionText(event.target.value)}
              placeholder="Leave empty for now, or add users.manage, pos.void_items"
              className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm text-app-text outline-none focus:ring-2 focus:ring-brand-500"
            />
            <p className="text-xs text-app-muted">
              You can create roles without permissions and attach permission rules later.
            </p>
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => updateForm('sync_to_keycloak', !form.sync_to_keycloak)}
              className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-black ${
                form.sync_to_keycloak
                  ? 'border-brand-500 bg-brand-500/10 text-brand-500'
                  : 'border-app-border text-app-muted'
              }`}
            >
              {form.sync_to_keycloak && <Check className="h-3 w-3" />}
              Sync to Keycloak
            </button>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Role
            </button>
          </div>
        </form>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {roles.map((role) => (
          <article key={role.id} className="rounded-lg border border-app-border bg-app-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-app-text">{role.name}</h3>
                <p className="text-xs font-bold uppercase text-brand-500">{role.key}</p>
              </div>
              <span className="rounded-md bg-app-elevated px-2 py-1 text-xs font-bold text-app-muted">
                {role.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-app-muted">{role.description || 'No description yet.'}</p>
            {(role.permissions || []).length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {role.permissions.map((permission) => (
                  <span key={permission} className="rounded-md bg-brand-500/10 px-2 py-1 text-xs font-bold text-brand-500">
                    {permission}
                  </span>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
