
/**
 * MemberCard renders a single organization member as a card.
 * Props:
 *   - member: object containing id, first_name, last_name, username, email, role
 */
export default function MemberCard({ member }) {
  const name = member.first_name
    ? `${member.first_name} ${member.last_name || ''}`
    : member.username;
  const avatarLetter = member.first_name ? member.first_name[0] : member.username[0].toUpperCase();
  const role = member.role || 'Staff';

  return (
    <div className="flex items-center justify-between p-6 hover:bg-app-card/30 transition-all">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-brand-500/5 border border-brand-500/10 flex items-center justify-center font-black text-sm text-brand-500 shadow-inner">
          {avatarLetter}
        </div>
        <div>
          <p className="text-sm font-black text-app-text">{name}</p>
          <p className="text-xs font-semibold text-app-muted mt-0.5">{member.email}</p>
        </div>
      </div>
      <span
        className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${
          role === 'ADMIN'
            ? 'bg-brand-500/10 border-brand-500/20 text-brand-500'
            : 'bg-app-card border-app-border text-app-muted'
        }`}
      >
        {role}
      </span>
    </div>
  );
}
