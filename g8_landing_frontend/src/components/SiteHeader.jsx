import { Hexagon, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const links = [
  ['Metal Works / Tiles / Cabro', '/cabro-blocks'],
]

export default function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-[#e3bd6f]/30 bg-white/90 text-[#10252b] shadow-lg shadow-[#e3bd6f]/5 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
        <Link to="/" className="flex min-h-11 items-center gap-3" onClick={() => setOpen(false)}>
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#e3bd6f] text-white shadow-md shadow-[#e3bd6f]/20 transition-transform hover:rotate-12">
            <Hexagon className="h-5 w-5 fill-current" />
          </span>
          <span>
            <strong className="block font-display text-sm font-extrabold uppercase tracking-[0.14em] text-[#10252b]">G8 Yatch</strong>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#c58452]">Engineered Hospitality</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {links.map(([label, path]) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `rounded-full px-4 py-2 text-sm font-bold uppercase tracking-widest transition ${isActive ? 'bg-[#e3bd6f]/10 text-[#c58452]' : 'text-[#10252b]/60 hover:text-[#c58452]'}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center lg:hidden">
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-md border border-[#e3bd6f]/30 bg-[#e3bd6f]/5 text-[#10252b]"
            onClick={() => setOpen((value) => !value)}
            aria-label="Toggle navigation"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-[#e3bd6f]/20 bg-white px-4 pb-4 pt-2 shadow-2xl lg:hidden">
          {links.map(([label, path]) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `flex min-h-12 items-center rounded-md px-4 text-sm font-bold uppercase tracking-widest ${isActive ? 'bg-[#e3bd6f]/10 text-[#c58452]' : 'text-[#10252b]/60 hover:text-[#c58452]'}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}
