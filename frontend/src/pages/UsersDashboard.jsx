import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  AlertCircle,
  Check,
  Edit3,
  Loader2,
  KeyRound,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  UserPlus,
  Users,
} from 'lucide-react';

import api, { emptyPagination, paginationFromResponse } from '../api';
import DataTable from '../components/DataTable';
import ModalLayer from '../components/ModalLayer';
import UserRoleModal from '../components/UserRoleModal';

const emptyForm = {
  username: '',
  email: '',
  first_name: '',
  last_name: '',
  password: '',
  realm_roles: ['WAITER'],
};

const emptyEditForm = {
  email: '',
  first_name: '',
  last_name: '',
  is_active: true,
};

const emptyPasswordForm = {
  password: '',
  confirm_password: '',
  temporary: true,
};

export default function UsersDashboard({ embedded = false }) {
  const [users, setUsers] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingUser, setSavingUser] = useState(false);
  const [savingRoleFor, setSavingRoleFor] = useState(null);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [roleModalUser, setRoleModalUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [passwordUser, setPasswordUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [pagination, setPagination] = useState(emptyPagination);

  const totalManagers = useMemo(
    () => users.filter((user) => user.realm_roles?.includes('POS_MANAGER')).length,
    [users]
  );

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/users/', { params: { page, page_size: pageSize } });
      setUsers(Array.isArray(response.data.results) ? response.data.results : []);
      setPagination(paginationFromResponse(response.data, page, pageSize));
    } catch (err) {
      setError(err);
      toast.error(err.response?.data?.detail || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get('/api/users/roles/', { params: { page_size: 100 } });
      const roles = Array.isArray(response.data.results) ? response.data.results : [];
      setRoleOptions(roles.map((role) => ({ value: role.key, label: role.name })));
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to load role options');
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [page, pageSize]);

  const visibleUsers = users.filter((user) => [
    user.first_name,
    user.last_name,
    user.username,
    user.email,
    ...(user.realm_roles || []),
  ].join(' ').toLowerCase().includes(searchTerm.trim().toLowerCase()));

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const openEditUser = (user) => {
    setEditingUser(user);
    setEditForm({
      email: user.email || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      is_active: user.is_active !== false,
    });
  };

  const openPasswordReset = (user) => {
    setPasswordUser(user);
    setPasswordForm(emptyPasswordForm);
  };

  const toggleFormRole = (role) => {
    setForm((current) => {
      const roles = current.realm_roles.includes(role)
        ? current.realm_roles.filter((item) => item !== role)
        : [...current.realm_roles, role];
      return { ...current, realm_roles: roles };
    });
  };

  const saveUserRoles = async (user, nextRoles) => {
    try {
      setSavingRoleFor(user.keycloak_sub);
      const response = await api.patch(`/api/users/${user.keycloak_sub}/roles/`, {
        realm_roles: nextRoles,
      });
      setUsers((current) =>
        current.map((item) =>
          item.keycloak_sub === user.keycloak_sub ? response.data : item
        )
      );
      toast.success('Roles updated');
      setRoleModalUser(null);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update roles');
    } finally {
      setSavingRoleFor(null);
    }
  };

  const createUser = async (event) => {
    event.preventDefault();
    try {
      setSavingUser(true);
      const response = await api.post('/api/users/', form);
      setForm(emptyForm);
      setShowCreate(false);
      toast.success('User created in Keycloak');
      if (page !== 1) {
        setPage(1);
      } else {
        setUsers((current) => [response.data, ...current].slice(0, pageSize));
        setPagination((current) => ({ ...current, total: current.total + 1 }));
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create user');
    } finally {
      setSavingUser(false);
    }
  };

  const saveUserDetails = async (event) => {
    event.preventDefault();
    if (!editingUser) return;

    try {
      setSavingUser(true);
      const response = await api.patch(`/api/users/${editingUser.keycloak_sub}/`, editForm);
      setUsers((current) => current.map((user) => (
        user.keycloak_sub === editingUser.keycloak_sub ? response.data : user
      )));
      setEditingUser(null);
      toast.success('User details updated');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update user details');
    } finally {
      setSavingUser(false);
    }
  };

  const resetUserPassword = async (event) => {
    event.preventDefault();
    if (!passwordUser) return;
    if (passwordForm.password !== passwordForm.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setSavingUser(true);
      await api.post(`/api/users/${passwordUser.keycloak_sub}/password/`, {
        password: passwordForm.password,
        temporary: passwordForm.temporary,
      });
      setPasswordUser(null);
      setPasswordForm(emptyPasswordForm);
      toast.success('Password reset');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to reset password');
    } finally {
      setSavingUser(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-12 h-12 text-brand-500 animate-spin" />
        <p className="text-sm font-bold text-app-muted animate-pulse">Loading admin users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-lg font-bold text-app-text">
          {error.response?.status === 403
            ? 'You need the POS_MANAGER role to manage users.'
            : 'Unable to load users.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {!embedded && (
        <div className="flex flex-col gap-5 rounded-lg border border-app-border bg-app-card p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-app-text">User Management</h2>
              <p className="text-sm text-app-muted">Create Keycloak users and manage realm roles.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={fetchUsers}
              className="inline-flex items-center gap-2 rounded-md border border-app-border px-4 py-2 text-sm font-bold text-app-text transition hover:bg-app-elevated"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => setShowCreate((value) => !value)}
              className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-700"
            >
              <Plus className="h-4 w-4" />
              Add User
            </button>
          </div>
        </div>
      )}

      {embedded && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={fetchUsers}
            className="inline-flex items-center gap-2 rounded-md border border-app-border px-4 py-2 text-sm font-bold text-app-text transition hover:bg-app-elevated"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setShowCreate((value) => !value)}
            className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" />
            Add User
          </button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-app-border bg-app-card p-5">
          <p className="text-xs font-black uppercase text-app-muted">Total Users</p>
          <p className="mt-2 text-3xl font-black text-app-text">{pagination.total}</p>
        </div>
        <div className="rounded-lg border border-app-border bg-app-card p-5">
          <p className="text-xs font-black uppercase text-app-muted">Managers</p>
          <p className="mt-2 text-3xl font-black text-app-text">{totalManagers}</p>
        </div>
        <div className="rounded-lg border border-app-border bg-app-card p-5">
          <p className="text-xs font-black uppercase text-app-muted">Available Roles</p>
          <p className="mt-2 text-3xl font-black text-app-text">{roleOptions.length}</p>
        </div>
      </div>

      {showCreate && (
        <form onSubmit={createUser} className="rounded-lg border border-app-border bg-app-card p-6">
          <div className="mb-5 flex items-center gap-3">
            <UserPlus className="h-5 w-5 text-brand-500" />
            <h3 className="text-lg font-black text-app-text">Add User</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ['username', 'Username'],
              ['email', 'Email'],
              ['first_name', 'First name'],
              ['last_name', 'Last name'],
              ['password', 'Temporary password'],
            ].map(([field, label]) => (
              <label key={field} className="space-y-2">
                <span className="text-xs font-bold uppercase text-app-muted">{label}</span>
                <input
                  type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                  value={form[field]}
                  required={['username', 'email', 'password'].includes(field)}
                  onChange={(event) => updateForm(field, event.target.value)}
                  className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm text-app-text outline-none focus:ring-2 focus:ring-brand-500"
                />
              </label>
            ))}
          </div>
          <div className="mt-5">
            <p className="mb-3 text-xs font-bold uppercase text-app-muted">Roles</p>
            <div className="flex flex-wrap gap-2">
              {roleOptions.map((role) => {
                const active = form.realm_roles.includes(role.value);
                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => toggleFormRole(role.value)}
                    className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-black transition ${
                      active
                        ? 'border-brand-500 bg-brand-500/10 text-brand-500'
                        : 'border-app-border text-app-muted hover:text-app-text'
                    }`}
                  >
                    {active && <Check className="h-3 w-3" />}
                    {role.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={savingUser}
              className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-50"
            >
              {savingUser ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Create User
            </button>
          </div>
        </form>
      )}

      <DataTable
        rows={visibleUsers}
        columns={[
          {
            key: 'user',
            header: 'User',
            render: (user) => (
              <>
                <p className="font-bold text-app-text">
                  {[user.first_name, user.last_name].filter(Boolean).join(' ') || user.username}
                </p>
                <p className="text-xs text-app-muted">{user.username}</p>
              </>
            ),
          },
          { key: 'email', header: 'Email', render: (user) => user.email || '-' },
          {
            key: 'roles',
            header: 'Realm Roles',
            render: (user) => (
              <div className="flex flex-wrap gap-2">
                {(user.realm_roles || []).slice(0, 3).map((role) => (
                  <span key={role} className="inline-flex items-center gap-1 rounded-md bg-brand-500/10 px-2 py-1 text-xs font-bold text-brand-500">
                    <ShieldCheck className="h-3 w-3" />
                    {role}
                  </span>
                ))}
                {(user.realm_roles || []).length > 3 ? (
                  <span className="rounded-md bg-app-elevated px-2 py-1 text-xs font-bold text-app-muted">
                    +{user.realm_roles.length - 3}
                  </span>
                ) : null}
              </div>
            ),
          },
          {
            key: 'actions',
            header: 'Action',
            headerClassName: 'text-right',
            cellClassName: 'text-right',
            render: (user) => (
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => openEditUser(user)}
                  className="rounded-md border border-app-border p-2 text-app-muted transition hover:bg-app-elevated hover:text-brand-500"
                  title="Edit user details"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => openPasswordReset(user)}
                  className="rounded-md border border-app-border p-2 text-app-muted transition hover:bg-app-elevated hover:text-brand-500"
                  title="Reset password"
                >
                  <KeyRound className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setRoleModalUser(user)}
                  className="rounded-md border border-app-border px-3 py-2 text-xs font-black text-app-text transition hover:bg-app-elevated"
                >
                  Roles
                </button>
              </div>
            ),
          },
        ]}
        getRowKey={(user) => user.keycloak_sub}
        title={`${visibleUsers.length} users`}
        description="Search by name, username, email, or realm role."
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search users"
        emptyMessage={users.length ? 'No users match your search.' : 'No users have signed in or been created yet.'}
        minWidth="860px"
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

      <UserRoleModal
        key={roleModalUser?.id || 'closed-role-modal'}
        isOpen={Boolean(roleModalUser)}
        user={roleModalUser}
        roleOptions={roleOptions}
        onClose={() => setRoleModalUser(null)}
        onSave={saveUserRoles}
        isSaving={Boolean(savingRoleFor)}
      />

      {editingUser ? (
        <ModalLayer label="Edit user details" onClose={() => setEditingUser(null)}>
          <form onSubmit={saveUserDetails} className="w-full max-w-2xl rounded-lg border border-app-border bg-app-card shadow-2xl">
            <div className="border-b border-app-border bg-app-elevated px-6 py-5">
              <div className="flex items-center gap-2 text-brand-500">
                <Edit3 className="h-5 w-5" />
                <p className="text-xs font-black uppercase tracking-[0.16em]">Edit user</p>
              </div>
              <h2 className="mt-2 text-2xl font-black text-app-text">{editingUser.username}</h2>
            </div>
            <div className="grid gap-4 p-6 md:grid-cols-2">
              {[
                ['first_name', 'First name', 'text'],
                ['last_name', 'Last name', 'text'],
                ['email', 'Email', 'email'],
              ].map(([field, label, type]) => (
                <label key={field} className="space-y-2">
                  <span className="text-xs font-bold uppercase text-app-muted">{label}</span>
                  <input
                    type={type}
                    value={editForm[field]}
                    required={field === 'email'}
                    onChange={(event) => setEditForm((current) => ({ ...current, [field]: event.target.value }))}
                    className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm text-app-text outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </label>
              ))}
              <label className="flex items-center gap-3 rounded-md border border-app-border bg-app-elevated px-3 py-2">
                <input
                  type="checkbox"
                  checked={editForm.is_active}
                  onChange={(event) => setEditForm((current) => ({ ...current, is_active: event.target.checked }))}
                  className="h-4 w-4 rounded border-app-border text-brand-600 focus:ring-brand-500"
                />
                <span className="text-sm font-bold text-app-text">Active user</span>
              </label>
            </div>
            <div className="flex justify-end gap-2 border-t border-app-border bg-app-elevated px-6 py-4">
              <button type="button" onClick={() => setEditingUser(null)} disabled={savingUser} className="rounded-md border border-app-border px-4 py-2 text-sm font-bold text-app-text">Cancel</button>
              <button type="submit" disabled={savingUser} className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
                {savingUser ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save details
              </button>
            </div>
          </form>
        </ModalLayer>
      ) : null}

      {passwordUser ? (
        <ModalLayer label="Reset user password" onClose={() => setPasswordUser(null)}>
          <form onSubmit={resetUserPassword} className="w-full max-w-2xl rounded-lg border border-app-border bg-app-card shadow-2xl">
            <div className="border-b border-app-border bg-app-elevated px-6 py-5">
              <div className="flex items-center gap-2 text-brand-500">
                <KeyRound className="h-5 w-5" />
                <p className="text-xs font-black uppercase tracking-[0.16em]">Reset password</p>
              </div>
              <h2 className="mt-2 text-2xl font-black text-app-text">{passwordUser.username}</h2>
            </div>
            <div className="grid gap-4 p-6 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs font-bold uppercase text-app-muted">New password</span>
                <input
                  type="password"
                  minLength={8}
                  required
                  value={passwordForm.password}
                  onChange={(event) => setPasswordForm((current) => ({ ...current, password: event.target.value }))}
                  className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm text-app-text outline-none focus:ring-2 focus:ring-brand-500"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-bold uppercase text-app-muted">Confirm password</span>
                <input
                  type="password"
                  minLength={8}
                  required
                  value={passwordForm.confirm_password}
                  onChange={(event) => setPasswordForm((current) => ({ ...current, confirm_password: event.target.value }))}
                  className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm text-app-text outline-none focus:ring-2 focus:ring-brand-500"
                />
              </label>
              <label className="flex items-center gap-3 rounded-md border border-app-border bg-app-elevated px-3 py-2 md:col-span-2">
                <input
                  type="checkbox"
                  checked={passwordForm.temporary}
                  onChange={(event) => setPasswordForm((current) => ({ ...current, temporary: event.target.checked }))}
                  className="h-4 w-4 rounded border-app-border text-brand-600 focus:ring-brand-500"
                />
                <span className="text-sm font-bold text-app-text">Require user to change password after login</span>
              </label>
            </div>
            <div className="flex justify-end gap-2 border-t border-app-border bg-app-elevated px-6 py-4">
              <button type="button" onClick={() => setPasswordUser(null)} disabled={savingUser} className="rounded-md border border-app-border px-4 py-2 text-sm font-bold text-app-text">Cancel</button>
              <button type="submit" disabled={savingUser} className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
                {savingUser ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                Reset password
              </button>
            </div>
          </form>
        </ModalLayer>
      ) : null}
    </div>
  );
}
