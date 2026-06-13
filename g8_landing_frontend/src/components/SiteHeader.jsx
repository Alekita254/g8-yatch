import { Anchor, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const links = [
  ['Food Menu', '/menu'],
  ['Hotel', '/hotel'],
  ['Corporate', '/corporate'],
  ['Cabro Blocks', '/cabro-blocks'],
]

export default function SiteHeader() {
  const [open, setOpen] = useState(false)

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

        <nav className="hidden items-center gap-5 md:flex lg:gap-7">
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

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle navigation"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-white/10 px-4 pb-4 pt-2 md:hidden">
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
        </nav>
      )}
    </header>
  )
}
