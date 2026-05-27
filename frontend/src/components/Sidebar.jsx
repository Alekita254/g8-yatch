import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import { 
  LayoutDashboard, FileText, Users, FolderOpen, 
  Zap, Building2, Target, LogOut 
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Tenders', path: '/tenders', icon: FileText },
  { name: 'CRM', path: '/crm', icon: Target },
  { name: 'Documents', path: '/documents', icon: FolderOpen },
  { name: 'Organisation', path: '/organisation', icon: Building2 },
  { name: 'Users', path: '/users', icon: Users },
];

export default function Sidebar({ djangoUser }) {
  const auth = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  // Extract initials and name from loaded SSO context
  const userName = djangoUser?.first_name 
    ? `${djangoUser.first_name} ${djangoUser.last_name || ''}`.trim() 
    : 'User Profile';
  const userInitials = userName ? userName.substring(0, 2).toUpperCase() : "US";

  return (
    <aside className="w-72 bg-app-card border-r border-app-border h-screen flex flex-col shrink-0 z-20 shadow-2xl shadow-black/5">
      {/* Logo */}
      <div className="h-20 flex items-center px-8 border-b border-app-border">
        <Link to="/" className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-110 transition-transform">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black text-app-text tracking-tight uppercase">
            Tender<span className="text-brand-500 font-medium">Safi</span>
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-8 flex flex-col gap-2 px-4">
        {navItems.map((item) => {
          // Check active state
          const active = item.path === '/dashboard' 
            ? currentPath === '/dashboard' || currentPath === '/dashboard/'
            : currentPath.startsWith(item.path);

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all duration-300 border-2 ${
                active
                  ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/20 shadow-inner'
                  : 'text-app-muted hover:bg-app-elevated hover:text-app-text border-transparent hover:border-app-border/50'
              }`}
            >
              <item.icon className={`w-5 h-5 ${active ? 'text-brand-500' : 'text-app-muted'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Company/User Footer with 1-Click Logout */}
      <div className="p-6 border-t border-app-border bg-app-elevated/20">
        <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-app-card border border-app-border shadow-sm hover:border-brand-500/30 transition-all group">
          <Link 
            to="/profile" 
            className="flex items-center gap-4 flex-1 overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-black text-sm shadow-md group-hover:scale-105 transition-transform">
              {userInitials}
            </div>
            <div className="flex-1 overflow-hidden text-left">
              <p className="text-sm font-black text-app-text truncate leading-tight">{userName}</p>
              <p className="text-[10px] font-bold text-app-muted truncate uppercase tracking-tighter">
                {djangoUser?.role || 'Manage Account'}
              </p>
            </div>
          </Link>
          <button
            onClick={() => auth.signoutRedirect()}
            className="p-2.5 rounded-xl hover:bg-red-500/10 text-app-muted hover:text-red-500 transition-all cursor-pointer flex items-center justify-center"
            title="Sign Out"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
