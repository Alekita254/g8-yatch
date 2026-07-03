import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Loader2, Pencil, Plus, ShieldCheck } from 'lucide-react';

import api, { emptyPagination, paginationFromResponse } from '../api';
import { APP_PERMISSION_OPTIONS } from '../accessControl';
import DataTable from '../components/DataTable';
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
  const [editingRole, setEditingRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [pagination, setPagination] = useState(emptyPagination);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/users/roles/', { params: { page, page_size: pageSize } });
      setRoles(Array.isArray(response.data.results) ? response.data.results : []);
      setPagination(paginationFromResponse(response.data, page, pageSize));
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [page, pageSize]);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const visibleRoles = roles.filter((role) => [
    role.name,
    role.key,
    role.description,
    ...(role.permissions || []),
  ].join(' ').toLowerCase().includes(searchTerm.trim().toLowerCase()));

  const nonAppPermissions = (permissions) => permissions.filter((permission) => !permission.startsWith('app.'));
  const selectedAppKeys = (permissions) => APP_PERMISSION_OPTIONS
    .filter((app) => permissions.includes(app.permission))
    .map((app) => app.value);
  const permissionsFromForm = () => {
    const manualPermissions = permissionText
      .split(',')
      .map((permission) => permission.trim())
      .filter(Boolean)
      .filter((permission) => !permission.startsWith('app.'));
    return Array.from(new Set([...manualPermissions, ...(form.permissions || [])]));
  };

  const openCreateModal = () => {
    setForm(emptyRole);
    setPermissionText('');
    setEditingRole(null);
    setShowAddModal(true);
  };

  const openEditModal = (role) => {
    setForm({
      key: role.key,
      name: role.name,
      description: role.description || '',
      permissions: role.permissions || [],
      sync_to_keycloak: role.sync_to_keycloak,
      is_active: role.is_active,
    });
    setPermissionText(nonAppPermissions(role.permissions || []).join(', '));
    setEditingRole(role);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setForm(emptyRole);
    setPermissionText('');
    setEditingRole(null);
    setShowAddModal(false);
  };

  const toggleAppPermission = (appKey) => {
    const app = APP_PERMISSION_OPTIONS.find((item) => item.value === appKey);
    if (!app) return;

    setForm((current) => {
      const permissions = new Set(current.permissions || []);
      if (permissions.has(app.permission)) {
        permissions.delete(app.permission);
      } else {
        permissions.add(app.permission);
      }
      return { ...current, permissions: Array.from(permissions) };
    });
  };

  const saveRole = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const permissions = permissionsFromForm();
      if (editingRole) {
        const response = await api.patch(`/api/users/roles/${editingRole.id}/`, { ...form, permissions });
        setRoles((current) => current.map((role) => role.id === editingRole.id ? response.data : role));
        toast.success('Role updated');
      } else {
        const response = await api.post('/api/users/roles/', { ...form, permissions });
        setRoles((current) => [response.data, ...current]);
        toast.success('Role created');
      }
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.detail || `Failed to ${editingRole ? 'update' : 'create'} role`);
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
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          Add Role
        </button>
      </div>

      <DataTable
        rows={visibleRoles}
        columns={[
          {
            key: 'role',
            header: 'Role',
            render: (role) => (
              <>
                <p className="font-black text-app-text">{role.name}</p>
                <p className="mt-1 text-xs font-bold uppercase text-brand-500">{role.key}</p>
              </>
            ),
          },
          { key: 'description', header: 'Description', render: (role) => role.description || 'No description yet.' },
          {
            key: 'apps',
            header: 'Apps',
            render: (role) => {
              const apps = selectedAppKeys(role.permissions || [])
                .map((appKey) => APP_PERMISSION_OPTIONS.find((app) => app.value === appKey)?.label)
                .filter(Boolean);
              return apps.length ? (
                <div className="flex flex-wrap gap-2">
                  {apps.map((app) => (
                    <span key={app} className="rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">{app}</span>
                  ))}
                </div>
              ) : '-';
            },
          },
          {
            key: 'permissions',
            header: 'Permissions',
            render: (role) => nonAppPermissions(role.permissions || []).length ? (
              <div className="flex flex-wrap gap-2">
                {nonAppPermissions(role.permissions || []).map((permission) => (
                  <span key={permission} className="rounded-md bg-brand-500/10 px-2 py-1 text-xs font-bold text-brand-500">{permission}</span>
                ))}
              </div>
            ) : '-',
          },
          {
            key: 'actions',
            header: 'Actions',
            render: (role) => (
              <button
                type="button"
                onClick={() => openEditModal(role)}
                className="inline-flex min-h-10 items-center gap-2 rounded-md border border-app-border px-3 text-xs font-black text-app-text transition hover:bg-app-elevated"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>
            ),
          },
          {
            key: 'status',
            header: 'Status',
            render: (role) => (
              <span className={`rounded-md px-2 py-1 text-xs font-black uppercase ${role.is_active ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                {role.is_active ? 'Active' : 'Inactive'}
              </span>
            ),
          },
        ]}
        getRowKey={(role) => role.id}
        title={`${visibleRoles.length} roles`}
        description="Search by role, key, description, or permission."
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search roles"
        emptyMessage="No roles match your search."
        minWidth="880px"
        pagination={{
          total: pagination.total,
          page: pagination.page,
          pageSize: pagination.pageSize,
          totalPages: pagination.totalPages,
          onPageChange: setPage,
          onPageSizeChange: (nextPageSize) => {
            setPageSize(nextPageSize);
            setPage(1);
          },
        }}
      />

      <RoleFormModal
        isOpen={showAddModal}
        form={form}
        title={editingRole ? 'Edit operational role' : 'Create operational role'}
        mode={editingRole ? 'edit' : 'create'}
        permissionText={permissionText}
        appOptions={APP_PERMISSION_OPTIONS}
        selectedAppKeys={selectedAppKeys(form.permissions || [])}
        onChange={updateForm}
        onPermissionTextChange={setPermissionText}
        onToggleAppPermission={toggleAppPermission}
        onToggleSync={() => updateForm('sync_to_keycloak', !form.sync_to_keycloak)}
        onClose={closeModal}
        onSubmit={saveRole}
        isSaving={saving}
      />
    </div>
  );
}
