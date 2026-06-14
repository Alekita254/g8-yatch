import { Anchor, ClipboardList, Menu, Moon, Sun, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { usePlan } from '../context/planContext'
import { useTheme } from '../context/themeContext'

const links = [
  ['Food Menu', '/menu'],
  ['Hotel', '/hotel'],
  ['Experiences', '/experiences'],
  ['Corporate', '/corporate'],
  ['Cabro Blocks', '/cabro-blocks'],
]

export default function SiteHeader() {
  const [open, setOpen] = useState(false)
  const { planCount } = usePlan()
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/95 text-white backdrop-blur-xl">
      <div className="page-shell flex h-16 items-center justify-between lg:h-20">
        <Link to="/" className="flex min-h-11 items-center gap-3" onClick={() => setOpen(false)}>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sun text-ink">
            <Anchor className="h-5 w-5" />
          </span>
          <span>
            <strong className="block font-display text-sm font-extrabold uppercase tracking-[0.14em]">G8 Yatch</strong>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-white/55">Stay. Gather. Build.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {links.map(([label, path]) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `text-sm font-bold transition ${isActive ? 'text-sun' : 'text-white/65 hover:text-white'}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 transition hover:bg-white/10"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            aria-pressed={theme === 'dark'}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5 text-sun" /> : <Moon className="h-5 w-5" />}
          </button>
          <Link to="/plan" onClick={() => setOpen(false)} className="relative flex h-11 min-w-11 items-center justify-center rounded-full border border-white/15 px-3" aria-label={`My G8 Plan, ${planCount} selected`}>
            <ClipboardList className="h-5 w-5" />
            <span className="ml-2 hidden text-sm font-bold sm:inline">My Visit</span>
            {planCount > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-sun px-1 text-[10px] font-extrabold text-ink">{planCount}</span>}
          </Link>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 lg:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label="Toggle navigation"
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-navigation" className="border-t border-white/10 px-4 pb-4 pt-2 lg:hidden">
          {links.map(([label, path]) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `flex min-h-12 items-center rounded-xl px-4 text-sm font-bold ${isActive ? 'bg-white/10 text-sun' : 'text-white/70'}`}
            >
              {label}
            </NavLink>
          ))}
          <NavLink
            to="/plan"
            onClick={() => setOpen(false)}
            className={({ isActive }) => `flex min-h-12 items-center rounded-xl px-4 text-sm font-bold ${isActive ? 'bg-white/10 text-sun' : 'text-white/70'}`}
          >
            My Visit {planCount > 0 ? `(${planCount})` : ''}
          </NavLink>
        </nav>
      )}
    </header>
  )
}
