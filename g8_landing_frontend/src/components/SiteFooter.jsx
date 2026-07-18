import { Clock3, Hexagon, Mail, MapPin, Navigation, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'

const defaultMapEmbedUrl = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.572965093953!2d37.5472915762844!3d-0.6354201352638502!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182639617a98ae4f%3A0xd45d55ee4bc3c5a7!2sG8%20YATCH%20VILLA%20HOTEL!5e0!3m2!1sen!2ske!4v1783357275305!5m2!1sen!2ske'
const mapQuery = encodeURIComponent(import.meta.env.VITE_GOOGLE_MAP_QUERY || 'G8 YATCH VILLA HOTEL')
const mapEmbedUrl = import.meta.env.VITE_GOOGLE_MAP_EMBED_URL || defaultMapEmbedUrl
const directionsUrl = import.meta.env.VITE_GOOGLE_MAP_URL || `https://www.google.com/maps/search/?api=1&query=${mapQuery}`
const contactPhone = import.meta.env.VITE_CONTACT_PHONE
const contactEmail = import.meta.env.VITE_CONTACT_EMAIL

export default function SiteFooter() {
  return (
    <footer className="border-t border-[#e3bd6f]/30 bg-white text-[#10252b]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8 lg:py-16">
        <div>
          <Link to="/" className="inline-flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-md bg-[#e3bd6f] text-white shadow-md shadow-[#e3bd6f]/20 transition-transform hover:rotate-12">
              <Hexagon className="h-5 w-5 fill-current" />
            </span>
            <span>
              <strong className="block font-display text-base font-extrabold uppercase tracking-[0.14em] text-[#10252b]">G8 Yatch</strong>
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#c58452]">Embu, Kenya</span>
            </span>
          </Link>
          <p className="mt-5 max-w-md leading-7 text-[#10252b]/70">
            A pure work of art. Meals, drinks, rooms, meetings, family events and dependable works / cabro in Embu.
          </p>
          <div className="mt-6 space-y-3 text-sm text-[#10252b]/80">
            <a href={directionsUrl} target="_blank" rel="noreferrer" className="flex min-h-11 items-center gap-3 hover:text-[#c58452] transition-colors">
              <MapPin className="h-5 w-5 text-[#c58452]" /> Embu County, Kenya
            </a>
            {contactPhone && (
              <a href={`tel:${contactPhone.replace(/\s/g, '')}`} className="flex min-h-11 items-center gap-3 hover:text-[#c58452] transition-colors">
                <Phone className="h-5 w-5 text-[#c58452]" /> {contactPhone}
              </a>
            )}
            {contactEmail && (
              <a href={`mailto:${contactEmail}`} className="flex min-h-11 items-center gap-3 hover:text-[#c58452] transition-colors">
                <Mail className="h-5 w-5 text-[#c58452]" /> {contactEmail}
              </a>
            )}
            <p className="flex min-h-11 items-center gap-3">
              <Clock3 className="h-5 w-5 text-[#c58452]" /> Open daily, 7:00 AM - 10:00 PM
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#e3bd6f]/30 bg-[#fafafa]">
          <iframe
            title="G8 Yatch location in Embu"
            src={mapEmbedUrl}
            className="h-72 w-full border-0 sm:h-80 filter sepia-[0.3] hue-rotate-[-30deg]"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-t border-[#e3bd6f]/30 bg-white">
            <div>
              <p className="font-bold text-[#c58452]">Find the Hive</p>
              <p className="mt-1 text-sm text-[#10252b]/60">Open the map for live directions from your location.</p>
            </div>
            <a href={directionsUrl} target="_blank" rel="noreferrer" className="touch-button shrink-0 bg-[#e3bd6f] text-white hover:bg-[#c58452] transition-colors rounded-full px-5 py-3 font-bold text-sm inline-flex items-center gap-2">
              <Navigation className="h-4 w-4" /> Get directions
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-[#e3bd6f]/20 bg-[#fafafa]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-[#10252b]/50 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} G8 Yatch. Engineered Hospitality.</p>
          <div className="flex gap-4">
            <Link to="/hotel" className="hover:text-[#c58452] uppercase tracking-wider font-bold">Hotel &amp; Villa</Link>
            <Link to="/cabro-blocks" className="hover:text-[#c58452] uppercase tracking-wider font-bold">Works &amp; Cabro</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
