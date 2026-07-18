import { Hexagon, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const links = [
  ['Metal Works / Tiles / Cabro', '/cabro-blocks'],
]

export default function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-[#e3bd6f]/30 bg-white/95 text-[#10252b] shadow-lg shadow-[#e3bd6f]/5 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
        <Link to="/" className="flex min-h-11 items-center gap-3" onClick={() => setOpen(false)}>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#e3bd6f] to-[#c58452] text-white shadow-md shadow-[#e3bd6f]/20 transition-transform active:scale-95 hover:rotate-12">
            <Hexagon className="h-5 w-5 fill-current" />
          </span>
          <span>
            <strong className="block font-display text-sm font-extrabold uppercase tracking-[0.14em] text-[#10252b]">G8 Yatch</strong>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#c58452]">Engineered Hospitality</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          {links.map(([label, path]) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all duration-200 ${isActive ? 'bg-[#e3bd6f]/15 text-[#c58452] shadow-sm' : 'text-[#10252b]/70 hover:bg-[#e3bd6f]/10 hover:text-[#c58452]'}`}
            >
              {label}
            </NavLink>
          ))}
          <a
            href="tel:+254700000000"
            className="ml-3 rounded-full bg-gradient-to-r from-[#10252b] to-[#1c3a43] px-5 py-2.5 text-xs font-extrabold uppercase tracking-widest text-white shadow-md transition-all hover:bg-[#c58452] hover:shadow-lg active:scale-95"
          >
            Call Us
          </a>
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <a
            href="tel:+254700000000"
            className="rounded-full bg-[#e3bd6f]/20 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#c58452] active:scale-95"
          >
            Call
          </a>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#e3bd6f]/30 bg-[#e3bd6f]/10 text-[#10252b] transition-transform active:scale-90"
            onClick={() => setOpen((value) => !value)}
            aria-label="Toggle navigation"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5 text-[#c58452]" /> : <Menu className="h-5 w-5 text-[#10252b]" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-[#e3bd6f]/20 bg-white/98 px-5 pb-6 pt-3 shadow-2xl backdrop-blur-2xl lg:hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-1.5">
            {links.map(([label, path]) => (
              <NavLink
                key={path}
                to={path}
                onClick={() => setOpen(false)}
                className={({ isActive }) => `flex min-h-12 items-center justify-between rounded-xl px-4 text-xs font-bold uppercase tracking-widest transition-colors ${isActive ? 'bg-gradient-to-r from-[#e3bd6f]/20 to-[#c58452]/10 text-[#c58452] font-black' : 'text-[#10252b]/80 hover:bg-[#fafafa] hover:text-[#c58452]'}`}
              >
                <span>{label}</span>
                <span className="text-[#e3bd6f]/60">→</span>
              </NavLink>
            ))}
          </nav>
          
          <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col gap-2.5">
            <a
              href="tel:+254700000000"
              onClick={() => setOpen(false)}
              className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#c58452] to-[#e3bd6f] text-white font-extrabold text-xs uppercase tracking-widest shadow-md active:scale-95 transition-transform"
            >
              📞 Call Reception
            </a>
            <a
              href="https://www.google.com/maps/search/?api=1&query=G8+YATCH+VILLA+HOTEL"
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
              className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#10252b]/10 bg-[#fafafa] text-[#10252b] font-bold text-xs uppercase tracking-widest active:scale-95 transition-transform"
            >
              📍 Get Directions
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
