import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  AlertCircle,
  Check,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  UserPlus,
  Users,
} from 'lucide-react';

import api from '../api';

const ROLE_OPTIONS = [
  { value: 'POS_MANAGER', label: 'POS Manager' },
  { value: 'WAITER', label: 'Waiter' },
  { value: 'NAIROBI_BRANCH', label: 'Nairobi Branch' },
];

const emptyForm = {
  username: '',
  email: '',
  first_name: '',
  last_name: '',
  password: '',
  realm_roles: ['WAITER'],
};

export default function UsersDashboard({ embedded = false }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingUser, setSavingUser] = useState(false);
  const [savingRoleFor, setSavingRoleFor] = useState(null);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const totalManagers = useMemo(
    () => users.filter((user) => user.realm_roles?.includes('POS_MANAGER')).length,
    [users]
  );

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/users/');
      setUsers(Array.isArray(response.data.results) ? response.data.results : []);
    } catch (err) {
      setError(err);
      toast.error(err.response?.data?.detail || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const toggleFormRole = (role) => {
    setForm((current) => {
      const roles = current.realm_roles.includes(role)
        ? current.realm_roles.filter((item) => item !== role)
        : [...current.realm_roles, role];
      return { ...current, realm_roles: roles };
    });
  };

  const toggleUserRole = async (user, role) => {
    const currentRoles = user.realm_roles || [];
    const nextRoles = currentRoles.includes(role)
      ? currentRoles.filter((item) => item !== role)
      : [...currentRoles, role];

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
      setUsers((current) => [response.data, ...current]);
      setForm(emptyForm);
      setShowCreate(false);
      toast.success('User created in Keycloak');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create user');
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
          <p className="mt-2 text-3xl font-black text-app-text">{users.length}</p>
        </div>
        <div className="rounded-lg border border-app-border bg-app-card p-5">
          <p className="text-xs font-black uppercase text-app-muted">Managers</p>
          <p className="mt-2 text-3xl font-black text-app-text">{totalManagers}</p>
        </div>
        <div className="rounded-lg border border-app-border bg-app-card p-5">
          <p className="text-xs font-black uppercase text-app-muted">Available Roles</p>
          <p className="mt-2 text-3xl font-black text-app-text">{ROLE_OPTIONS.length}</p>
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
              {ROLE_OPTIONS.map((role) => {
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

      <div className="overflow-hidden rounded-lg border border-app-border bg-app-card">
        <div className="grid grid-cols-[1.2fr_1.4fr_1.5fr] border-b border-app-border bg-app-elevated px-4 py-3 text-xs font-black uppercase text-app-muted">
          <span>User</span>
          <span>Email</span>
          <span>Realm Roles</span>
        </div>
        {users.length === 0 ? (
          <div className="p-10 text-center text-sm text-app-muted">No users have signed in or been created yet.</div>
        ) : (
          users.map((user) => (
            <div
              key={user.keycloak_sub}
              className="grid grid-cols-[1.2fr_1.4fr_1.5fr] items-center gap-4 border-b border-app-border px-4 py-4 last:border-b-0"
            >
              <div>
                <p className="font-bold text-app-text">
                  {[user.first_name, user.last_name].filter(Boolean).join(' ') || user.username}
                </p>
                <p className="text-xs text-app-muted">{user.username}</p>
              </div>
              <p className="text-sm text-app-muted">{user.email || '-'}</p>
              <div className="flex flex-wrap gap-2">
                {ROLE_OPTIONS.map((role) => {
                  const active = user.realm_roles?.includes(role.value);
                  return (
                    <button
                      key={role.value}
                      type="button"
                      disabled={savingRoleFor === user.keycloak_sub}
                      onClick={() => toggleUserRole(user, role.value)}
                      className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-black transition disabled:opacity-50 ${
                        active
                          ? 'border-brand-500 bg-brand-500/10 text-brand-500'
                          : 'border-app-border text-app-muted hover:text-app-text'
                      }`}
                    >
                      {savingRoleFor === user.keycloak_sub ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : active ? (
                        <ShieldCheck className="h-3 w-3" />
                      ) : null}
                      {role.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
