import { useState } from 'react';
import { Loader2, Send, X } from 'lucide-react';
import ModalLayer from './ModalLayer';

const ROLE_OPTIONS = [
  { value: 'COMPANY', label: 'Company Staff (Viewer)' },
  { value: 'ADMIN', label: 'Workspace Admin (Executive)' },
];

export default function InviteMemberModal({ isOpen, onClose, onInvite, isLoading }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('COMPANY');

  if (!isOpen) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!email.trim()) return;
    onInvite({ email: email.trim(), role });
  };

  return (
    <ModalLayer label="Invite member" onClose={onClose}>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-app-border bg-app-card p-8 space-y-6 shadow-2xl"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-app-text">Invite Member</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-md p-1 transition hover:bg-app-border/50 disabled:opacity-50"
            aria-label="Close invite member modal"
          >
            <X className="h-5 w-5 text-app-muted" />
          </button>
        </div>

        <div className="space-y-2">
          <label htmlFor="invite-email" className="text-xs font-bold uppercase tracking-wider text-app-muted">
            Email Address
          </label>
          <input
            id="invite-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isLoading}
            className="w-full rounded-lg border border-app-border bg-app-card px-4 py-3 text-sm text-app-text focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
            placeholder="colleague@company.com"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="invite-role" className="text-xs font-bold uppercase tracking-wider text-app-muted">
            Workspace Role
          </label>
          <select
            id="invite-role"
            value={role}
            onChange={(event) => setRole(event.target.value)}
            disabled={isLoading}
            className="w-full rounded-lg border border-app-border bg-app-card px-4 py-3 text-sm text-app-text focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
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
            type="submit"
            disabled={isLoading || !email.trim()}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send Invite
          </button>
        </div>
      </form>
    </ModalLayer>
  );
}
