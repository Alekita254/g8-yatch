import { Edit2 } from 'lucide-react';

const ROLE_OPTIONS = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'COMPANY', label: 'Company Staff' },
  { value: 'NORMAL', label: 'Normal' },
];

/**
 * MemberTable renders members in a table layout.
 * Props:
 *   - members: array of member objects with id, first_name, last_name, username, email, role
 *   - onEditRole: callback(member) to open edit modal
 */
export default function MemberTable({ members, onEditRole }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-app-border">
        <thead className="bg-app-card/60">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-app-muted uppercase">Name</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-app-muted uppercase">Email</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-app-muted uppercase">Role</th>
            <th className="px-4 py-2 text-center text-xs font-medium text-app-muted uppercase">Action</th>
          </tr>
        </thead>
        <tbody className="bg-app-card/30">
          {members.map(member => {
            const name = member.first_name
              ? `${member.first_name} ${member.last_name || ''}`
              : member.username;
            const role = member.role || 'NORMAL';
            const roleLabel = ROLE_OPTIONS.find((option) => option.value === role)?.label || role;
            return (
              <tr key={member.id} className="hover:bg-app-card/40">
                <td className="px-4 py-2 text-sm text-app-text">{name}</td>
                <td className="px-4 py-2 text-sm text-app-muted">{member.email}</td>
                <td className="px-4 py-2 text-sm text-app-muted font-semibold">{roleLabel}</td>
                <td className="px-4 py-2 text-center">
                  <button
                    type="button"
                    onClick={() => onEditRole(member)}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold text-brand-600 hover:bg-brand-500/10 transition"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
