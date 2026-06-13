import { Check, ChevronRight, Minus, Plus, ShoppingBag, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { getMenu, getRooms, placeHospitalityOrder } from '../api/hospitalityService'
import BottomSheet from '../components/BottomSheet'
import SectionHeading from '../components/SectionHeading'

const categories = ['Starters', 'Mains', 'Drinks']
const money = (value) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(value)

export default function HospitalityPage() {
  const [rooms, setRooms] = useState([])
  const [menu, setMenu] = useState([])
  const [category, setCategory] = useState('Starters')
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [orderForm, setOrderForm] = useState({ customerName: '', location: '' })
  const [status, setStatus] = useState('')

  useEffect(() => {
    Promise.all([getRooms(), getMenu()]).then(([roomData, menuData]) => {
      setRooms(roomData)
      setMenu(menuData)
    })
  }, [])

  const visibleMenu = menu.filter((item) => item.category === category)
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0)
  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart])

  const changeQuantity = (item, delta) => {
    setCart((current) => {
      const existing = current.find((entry) => entry.id === item.id)
      if (!existing && delta > 0) return [...current, { ...item, quantity: 1 }]
      return current
        .map((entry) => entry.id === item.id ? { ...entry, quantity: entry.quantity + delta } : entry)
        .filter((entry) => entry.quantity > 0)
    })
  }

  const placeOrder = async (event) => {
    event.preventDefault()
    setStatus('sending')
    try {
      const response = await placeHospitalityOrder({ items: cart, ...orderForm })
      setStatus(`Order ${response.order_number} received`)
      setCart([])
    } catch {
      setStatus('We could not send the order. Please try again.')
    }
  }

  return (
    <main className="pb-24">
      <section className="relative min-h-[520px] overflow-hidden bg-ink text-white">
        <img src="https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1800&q=90" alt="G8 lakeside pool" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/10" />
        <div className="page-shell relative flex min-h-[520px] items-end pb-10">
          <div className="max-w-2xl">
            <p className="eyebrow text-sun">Rooms & Restaurant</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-6xl">Slow mornings. Long lunches. Lake air.</h1>
            <p className="mt-4 max-w-xl leading-7 text-white/70">Stay close to the water and order from wherever the day finds you.</p>
          </div>
        </div>
      </section>

      <section className="page-shell py-14 sm:py-20">
        <SectionHeading eyebrow="Stay your way" title="Rooms made for switching off." text="Swipe through our most-loved spaces. Each stay includes breakfast and access to the pool and gardens." />
        <div className="-mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-3 lg:px-0 hide-scrollbar">
          {rooms.map((room) => (
            <article key={room.id} className="min-w-[86vw] snap-center overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm sm:min-w-[52vw] lg:min-w-0">
              <img src={room.image} alt={room.name} className="h-56 w-full object-cover" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-extrabold text-ink">{room.name}</h3>
                    <span className="mt-2 inline-flex items-center gap-1 text-sm text-slate-500"><Users className="h-4 w-4" /> Up to {room.guests} guests</span>
                  </div>
                  <p className="text-right text-sm font-bold text-lake">{money(room.price)}<span className="block text-xs font-medium text-slate-400">per night</span></p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {room.amenities.map((amenity) => <span key={amenity} className="rounded-full bg-sand px-3 py-1.5 text-xs font-semibold text-ink">{amenity}</span>)}
                </div>
                <button type="button" onClick={() => { setSelectedRoom(room); setBookingOpen(true) }} className="touch-button mt-5 w-full bg-ink text-white">
                  Check availability <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="menu" className="bg-sand/65 py-14 sm:py-20">
        <div className="page-shell">
          <SectionHeading eyebrow="Order from your table" title="Fresh food, a few taps away." text="Choose your location at checkout and your order will be sent to the right service point." />
          <div className="sticky top-16 z-20 -mx-4 mt-8 border-y border-stone-200 bg-stone-50/95 px-4 py-3 backdrop-blur md:top-20 sm:-mx-6 sm:px-6 lg:mx-0 lg:rounded-full lg:border">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar">
              {categories.map((item) => (
                <button key={item} type="button" onClick={() => setCategory(item)} className={`min-h-11 shrink-0 rounded-full px-5 text-sm font-bold ${category === item ? 'bg-lake text-white' : 'bg-white text-slate-600'}`}>
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {visibleMenu.map((item) => {
              const quantity = cart.find((entry) => entry.id === item.id)?.quantity || 0
              return (
                <article key={item.id} className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-extrabold text-ink">{item.name}</h3>
                    <p className="mt-1 text-sm leading-5 text-slate-500">{item.description}</p>
                    <p className="mt-2 text-sm font-bold text-lake">{money(item.price)}</p>
                  </div>
                  {quantity ? (
                    <div className="flex items-center rounded-full bg-ink text-white">
                      <button type="button" onClick={() => changeQuantity(item, -1)} className="flex h-11 w-11 items-center justify-center"><Minus className="h-4 w-4" /></button>
                      <span className="w-6 text-center text-sm font-bold">{quantity}</span>
                      <button type="button" onClick={() => changeQuantity(item, 1)} className="flex h-11 w-11 items-center justify-center"><Plus className="h-4 w-4" /></button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => changeQuantity(item, 1)} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-lake text-white" aria-label={`Add ${item.name}`}>
                      <Plus className="h-5 w-5" />
                    </button>
                  )}
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {itemCount > 0 && (
        <div className="fixed inset-x-0 bottom-4 z-30 px-4">
          <button type="button" onClick={() => setCartOpen(true)} className="mx-auto flex min-h-14 w-full max-w-lg items-center justify-between rounded-full bg-ink px-5 text-white shadow-2xl shadow-ink/30">
            <span className="flex items-center gap-2 font-bold"><ShoppingBag className="h-5 w-5" /> {itemCount} item{itemCount === 1 ? '' : 's'}</span>
            <span className="font-extrabold">{money(total)}</span>
          </button>
        </div>
      )}

      <BottomSheet open={bookingOpen} onClose={() => setBookingOpen(false)} title={`Check ${selectedRoom?.name || 'room'} availability`}>
        <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); setBookingOpen(false) }}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Check in" type="date" required />
            <Field label="Check out" type="date" required />
          </div>
          <Field label="Your name" placeholder="Full name" required />
          <Field label="Phone number" type="tel" placeholder="+254..." required />
          <button className="touch-button w-full bg-lake text-white">Request availability</button>
        </form>
      </BottomSheet>

      <BottomSheet open={cartOpen} onClose={() => setCartOpen(false)} title="Your order">
        {status && status !== 'sending' ? (
          <div className="rounded-2xl bg-lake/10 p-5 text-center">
            <Check className="mx-auto h-8 w-8 text-lake" />
            <p className="mt-3 font-bold text-ink">{status}</p>
          </div>
        ) : (
          <form onSubmit={placeOrder}>
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                  <div><p className="font-bold text-ink">{item.name}</p><p className="text-sm text-slate-500">{item.quantity} × {money(item.price)}</p></div>
                  <button type="button" onClick={() => changeQuantity(item, -1)} className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100"><Minus className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
            <div className="mt-5 space-y-4">
              <Field label="Name optional" value={orderForm.customerName} onChange={(event) => setOrderForm({ ...orderForm, customerName: event.target.value })} placeholder="Guest name" />
              <label className="block text-sm font-bold text-ink">Where should we bring it?
                <select required value={orderForm.location} onChange={(event) => setOrderForm({ ...orderForm, location: event.target.value })} className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 font-normal outline-none focus:border-lake">
                  <option value="">Select your location</option>
                  <option>Restaurant table</option>
                  <option>Pool side</option>
                  <option>Garden</option>
                  <option>Room delivery</option>
                </select>
              </label>
            </div>
            <button disabled={status === 'sending'} className="touch-button mt-5 w-full bg-lake text-white disabled:opacity-60">
              {status === 'sending' ? 'Sending order...' : `Place order · ${money(total)}`}
            </button>
          </form>
        )}
      </BottomSheet>
    </main>
  )
}

function Field({ label, ...props }) {
  return (
    <label className="block text-sm font-bold text-ink">{label}
      <input {...props} className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 px-3 font-normal outline-none focus:border-lake" />
    </label>
  )
}
