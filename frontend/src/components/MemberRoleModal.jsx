import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ROLE_OPTIONS = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'COMPANY', label: 'Company Staff' },
  { value: 'NORMAL', label: 'Normal' },
];

export default function MemberRoleModal({ isOpen, member, onClose, onSave, isLoading }) {
  const [selectedRole, setSelectedRole] = useState(member?.role || 'NORMAL');

  useEffect(() => {
    if (member) {
      setSelectedRole(member.role || 'NORMAL');
    }
  }, [member]);

  if (!isOpen || !member) return null;

  const handleSave = () => {
    onSave(member.id, selectedRole);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl bg-app-card border border-app-border p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-app-text">Update Member Role</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-md p-1 hover:bg-app-border/50 transition"
          >
            <X className="w-5 h-5 text-app-muted" />
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-app-muted">
            <span className="font-semibold text-app-text">{member.first_name || member.username}</span>
            {' '}
            ({member.email})
          </p>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-app-muted">
            Workspace Role
          </label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-lg border border-app-border bg-app-card px-4 py-3 text-sm text-app-text focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 rounded-lg border border-app-border px-4 py-3 text-sm font-semibold text-app-text transition hover:bg-app-border/50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading || selectedRole === member.role}
            className="flex-1 rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            {isLoading ? 'Updating...' : 'Update Role'}
          </button>
        </div>
      </div>
    </div>
  );
}
