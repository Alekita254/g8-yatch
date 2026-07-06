import { Building2, Clock3, Mail, MapPin, Navigation, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'

const defaultMapEmbedUrl = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.572965093953!2d37.5472915762844!3d-0.6354201352638502!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182639617a98ae4f%3A0xd45d55ee4bc3c5a7!2sG8%20YATCH%20VILLA%20HOTEL!5e0!3m2!1sen!2ske!4v1783357275305!5m2!1sen!2ske'
const mapQuery = encodeURIComponent(import.meta.env.VITE_GOOGLE_MAP_QUERY || 'G8 YATCH VILLA HOTEL')
const mapEmbedUrl = import.meta.env.VITE_GOOGLE_MAP_EMBED_URL || defaultMapEmbedUrl
const directionsUrl = import.meta.env.VITE_GOOGLE_MAP_URL || `https://www.google.com/maps/search/?api=1&query=${mapQuery}`
const contactPhone = import.meta.env.VITE_CONTACT_PHONE
const contactEmail = import.meta.env.VITE_CONTACT_EMAIL

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white text-ink transition-colors dark:border-white/10 dark:bg-ink dark:text-white">
      <div className="page-shell grid gap-10 py-12 lg:grid-cols-[0.8fr_1.2fr] lg:py-16">
        <div>
          <Link to="/" className="inline-flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sun text-ink">
              <Building2 className="h-5 w-5" />
            </span>
            <span>
              <strong className="block font-display text-base font-extrabold uppercase tracking-[0.14em]">G8 Yatch</strong>
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-white/50">Embu, Kenya</span>
            </span>
          </Link>
          <p className="mt-5 max-w-md leading-7 text-slate-600 dark:text-white/60">
            Meals, drinks, rooms, meetings, family events and dependable cabro blocks in Embu.
          </p>
          <div className="mt-6 space-y-3 text-sm text-slate-600 dark:text-white/70">
            <a href={directionsUrl} target="_blank" rel="noreferrer" className="flex min-h-11 items-center gap-3 hover:text-lake dark:hover:text-white">
              <MapPin className="h-5 w-5 text-sun" /> Embu County, Kenya
            </a>
            {contactPhone && (
              <a href={`tel:${contactPhone.replace(/\s/g, '')}`} className="flex min-h-11 items-center gap-3 hover:text-lake dark:hover:text-white">
                <Phone className="h-5 w-5 text-sun" /> {contactPhone}
              </a>
            )}
            {contactEmail && (
              <a href={`mailto:${contactEmail}`} className="flex min-h-11 items-center gap-3 hover:text-lake dark:hover:text-white">
                <Mail className="h-5 w-5 text-sun" /> {contactEmail}
              </a>
            )}
            <p className="flex min-h-11 items-center gap-3">
              <Clock3 className="h-5 w-5 text-sun" /> Open daily, 7:00 AM - 10:00 PM
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-stone-50 shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none">
          <iframe
            title="G8 Yatch location in Embu"
            src={mapEmbedUrl}
            className="h-72 w-full border-0 sm:h-80"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold">Find us in Embu</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-white/50">Open the map for live directions from your location.</p>
            </div>
            <a href={directionsUrl} target="_blank" rel="noreferrer" className="touch-button shrink-0 bg-sun text-ink">
              <Navigation className="h-4 w-4" /> Get directions
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 bg-stone-50 dark:border-white/10 dark:bg-transparent">
        <div className="page-shell flex flex-col gap-3 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between dark:text-white/40">
          <p>© {new Date().getFullYear()} G8 Yatch. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/menu" className="hover:text-lake dark:hover:text-white">Food Menu</Link>
            <Link to="/hotel" className="hover:text-lake dark:hover:text-white">Hotel</Link>
            <Link to="/experiences" className="hover:text-lake dark:hover:text-white">Experiences</Link>
            <Link to="/corporate" className="hover:text-lake dark:hover:text-white">Corporate</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
