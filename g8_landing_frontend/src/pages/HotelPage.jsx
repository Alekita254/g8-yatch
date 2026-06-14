import { CheckCircle2, ChevronRight, Coffee, MapPin, Users, Wifi } from 'lucide-react'
import { useEffect, useState } from 'react'

import { getRooms, requestRoomAvailability } from '../api/hospitalityService'
import BottomSheet from '../components/BottomSheet'
import SectionHeading from '../components/SectionHeading'

const money = (value) => new Intl.NumberFormat('en-KE', {
  style: 'currency',
  currency: 'KES',
  maximumFractionDigits: 0,
}).format(value)

export default function HotelPage() {
  const [rooms, setRooms] = useState([])
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [status, setStatus] = useState('')
  const [form, setForm] = useState({ check_in: '', check_out: '', name: '', phone: '', guests: '1' })

  useEffect(() => {
    getRooms().then(setRooms).catch(() => setLoadError('Rooms could not be loaded. Please refresh and try again.'))
  }, [])

  const openBooking = (room) => {
    setSelectedRoom(room)
    setStatus('')
    setBookingOpen(true)
  }

  const submitAvailability = async (event) => {
    event.preventDefault()
    setStatus('sending')
    try {
      await requestRoomAvailability({
        ...form,
        room_id: selectedRoom.id,
        room_name: selectedRoom.name,
      })
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <main>
      <section className="relative min-h-[72svh] overflow-hidden bg-ink text-white lg:min-h-[calc(100svh-5rem)]">
        <img
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1800&q=90"
          alt="Comfortable hotel accommodation in Embu"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/10 lg:bg-gradient-to-r lg:from-ink/95 lg:via-ink/45 lg:to-transparent" />
        <div className="page-shell relative flex min-h-[72svh] items-end pb-12 pt-24 lg:min-h-[calc(100svh-5rem)] lg:items-center lg:pb-20">
          <div className="max-w-2xl">
            <p className="eyebrow text-sun">Hotel in Embu</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-6xl lg:text-7xl">A comfortable place to pause and feel at home.</h1>
            <p className="mt-4 max-w-xl leading-7 text-white/70">Choose your room, check your dates and let our accommodation team handle the rest.</p>
          </div>
        </div>
      </section>

      <section className="page-shell py-14 sm:py-20">
        <SectionHeading
          eyebrow="Choose your room"
          title="Accommodation without the clutter."
          text="This page is dedicated to stays only, so guests can compare rooms and request availability with confidence."
        />
        <div className="-mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-3 lg:px-0 hide-scrollbar">
          {rooms.map((room) => (
            <article key={room.id} className="min-w-[86vw] snap-center overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#10252b] sm:min-w-[52vw] lg:min-w-0">
              <img src={room.image} alt={room.name} className="h-56 w-full object-cover" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-extrabold text-ink dark:text-white">{room.name}</h2>
                    <span className="mt-2 inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-300">
                      <Users className="h-4 w-4" /> Up to {room.guests} guests
                    </span>
                  </div>
                  <p className="text-right text-sm font-bold text-lake">
                    {money(room.price)}
                    <span className="block text-xs font-medium text-slate-400">per night</span>
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {room.amenities.map((amenity) => (
                    <span key={amenity} className="rounded-full bg-sand px-3 py-1.5 text-xs font-semibold text-ink dark:bg-white/10 dark:text-slate-100">{amenity}</span>
                  ))}
                </div>
                <button type="button" onClick={() => openBooking(room)} className="touch-button mt-5 w-full bg-ink text-white">
                  Check availability <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
        {loadError && <p className="mt-6 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{loadError}</p>}
      </section>

      <section className="bg-sand py-14 dark:bg-[#0a1d22]">
        <div className="page-shell grid gap-4 sm:grid-cols-3">
          {[
            [Coffee, 'Breakfast available', 'Start the morning with a fresh meal from our kitchen.'],
            [Wifi, 'Reliable Wi-Fi', 'Stay connected for work, travel planning and entertainment.'],
            [MapPin, 'Conveniently in Embu', 'A practical base for business and leisure around Embu County.'],
          ].map(([Icon, title, text]) => (
            <article key={title} className="rounded-2xl bg-white p-5 dark:bg-[#10252b] dark:ring-1 dark:ring-white/10">
              <Icon className="h-6 w-6 text-lake" />
              <h2 className="mt-4 text-lg font-extrabold text-ink dark:text-white">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <BottomSheet open={bookingOpen} onClose={() => setBookingOpen(false)} title={`Check ${selectedRoom?.name || 'room'} availability`}>
        {status === 'success' ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-lake" />
            <h3 className="mt-4 text-xl font-extrabold text-ink dark:text-white">Availability request received</h3>
            <p className="mt-2 text-slate-600 dark:text-slate-300">Our hotel team will confirm your dates and room options.</p>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={submitAvailability}>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Check in" type="date" value={form.check_in} onChange={(event) => setForm({ ...form, check_in: event.target.value })} required />
              <Field label="Check out" type="date" value={form.check_out} onChange={(event) => setForm({ ...form, check_out: event.target.value })} required />
            </div>
            <Field label="Your name" placeholder="Full name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            <Field label="Phone number" type="tel" placeholder="+254..." value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required />
            <Field label="Number of guests" type="number" min="1" max={selectedRoom?.guests} value={form.guests} onChange={(event) => setForm({ ...form, guests: event.target.value })} required />
            {status === 'error' && <p className="text-sm font-bold text-red-600">We could not send your request. Please try again.</p>}
            <button disabled={status === 'sending'} className="touch-button w-full bg-lake text-white disabled:opacity-60">
              {status === 'sending' ? 'Sending request...' : 'Request availability'}
            </button>
          </form>
        )}
      </BottomSheet>
    </main>
  )
}

function Field({ label, ...props }) {
  return (
    <label className="block text-sm font-bold text-ink dark:text-slate-100">
      {label}
      <input {...props} className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 px-3 font-normal outline-none focus:border-lake" />
    </label>
  )
}
