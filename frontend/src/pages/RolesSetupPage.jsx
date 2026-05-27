import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Loader2, Plus, ShieldCheck } from 'lucide-react';

import api from '../api';
import RoleFormModal from '../components/RoleFormModal';

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
  const [showAddModal, setShowAddModal] = useState(false);

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
      setShowAddModal(false);
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
      <div className="flex flex-col gap-4 rounded-lg border border-app-border bg-app-card p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-app-text">Roles</h2>
            <p className="text-sm text-app-muted">Create operational roles and sync them to Keycloak.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          Add Role
        </button>
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

      <RoleFormModal
        isOpen={showAddModal}
        form={form}
        permissionText={permissionText}
        onChange={updateForm}
        onPermissionTextChange={setPermissionText}
        onToggleSync={() => updateForm('sync_to_keycloak', !form.sync_to_keycloak)}
        onClose={() => setShowAddModal(false)}
        onSubmit={createRole}
        isSaving={saving}
      />
    </div>
  );
}
