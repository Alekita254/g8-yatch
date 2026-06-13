import { Anchor, Clock3, Mail, MapPin, Navigation, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'

const mapQuery = encodeURIComponent(import.meta.env.VITE_GOOGLE_MAP_QUERY || 'G8 Yatch Embu Kenya')
const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`
const contactPhone = import.meta.env.VITE_CONTACT_PHONE
const contactEmail = import.meta.env.VITE_CONTACT_EMAIL

export default function SiteFooter() {
  return (
    <footer className="bg-ink text-white">
      <div className="page-shell grid gap-10 py-12 lg:grid-cols-[0.8fr_1.2fr] lg:py-16">
        <div>
          <Link to="/" className="inline-flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sun text-ink">
              <Anchor className="h-5 w-5" />
            </span>
            <span>
              <strong className="block font-display text-base font-extrabold uppercase tracking-[0.14em]">G8 Yatch</strong>
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-white/50">Embu, Kenya</span>
            </span>
          </Link>
          <p className="mt-5 max-w-md leading-7 text-white/60">
            Food, accommodation, conferences, garden events, team building, family activities and dependable construction materials in Embu.
          </p>
          <div className="mt-6 space-y-3 text-sm text-white/70">
            <a href={directionsUrl} target="_blank" rel="noreferrer" className="flex min-h-11 items-center gap-3 hover:text-white">
              <MapPin className="h-5 w-5 text-sun" /> Embu County, Kenya
            </a>
            {contactPhone && (
              <a href={`tel:${contactPhone.replace(/\s/g, '')}`} className="flex min-h-11 items-center gap-3 hover:text-white">
                <Phone className="h-5 w-5 text-sun" /> {contactPhone}
              </a>
            )}
            {contactEmail && (
              <a href={`mailto:${contactEmail}`} className="flex min-h-11 items-center gap-3 hover:text-white">
                <Mail className="h-5 w-5 text-sun" /> {contactEmail}
              </a>
            )}
            <p className="flex min-h-11 items-center gap-3">
              <Clock3 className="h-5 w-5 text-sun" /> Open daily, 7:00 AM - 10:00 PM
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5">
          <iframe
            title="G8 Yatch location in Embu"
            src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
            className="h-72 w-full border-0 sm:h-80"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold">Find us in Embu</p>
              <p className="mt-1 text-sm text-white/50">Open the map for live directions from your location.</p>
            </div>
            <a href={directionsUrl} target="_blank" rel="noreferrer" className="touch-button shrink-0 bg-sun text-ink">
              <Navigation className="h-4 w-4" /> Get directions
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="page-shell flex flex-col gap-3 py-5 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} G8 Yatch. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/menu" className="hover:text-white">Food Menu</Link>
            <Link to="/hotel" className="hover:text-white">Hotel</Link>
            <Link to="/experiences" className="hover:text-white">Experiences</Link>
            <Link to="/corporate" className="hover:text-white">Corporate</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
