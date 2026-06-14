import { Sun, Moon } from 'lucide-react';

import { useTheme } from '../context/themeContext';

export default function ThemeToggle({ inverse = false, className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-all ${
        inverse
          ? 'border-white/15 bg-white/8 text-white/70 hover:border-brand-400/50 hover:text-brand-300'
          : 'border-app-border bg-app-elevated text-app-muted shadow-sm hover:border-brand-500/50 hover:text-brand-600'
      } ${className}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-pressed={isDark}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
