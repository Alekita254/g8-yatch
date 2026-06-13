import { CheckCircle2, Minus, Plus, ShoppingBag, Utensils } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { getMenu, placeHospitalityOrder } from '../api/hospitalityService'
import BottomSheet from '../components/BottomSheet'
import SectionHeading from '../components/SectionHeading'

const categories = ['Starters', 'Mains', 'Drinks']
const money = (value) => new Intl.NumberFormat('en-KE', {
  style: 'currency',
  currency: 'KES',
  maximumFractionDigits: 0,
}).format(value)

export default function MenuPage() {
  const [menu, setMenu] = useState([])
  const [category, setCategory] = useState('Starters')
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [orderForm, setOrderForm] = useState({ customerName: '', location: '' })
  const [status, setStatus] = useState('')
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    getMenu().then(setMenu).catch(() => setLoadError('The menu could not be loaded. Please refresh and try again.'))
  }, [])

  const visibleMenu = menu.filter((item) => item.category === category)
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0)
  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  )

  const changeQuantity = (item, delta) => {
    setCart((current) => {
      const existing = current.find((entry) => entry.id === item.id)
      if (!existing && delta > 0) return [...current, { ...item, quantity: 1 }]
      return current
        .map((entry) => entry.id === item.id
          ? { ...entry, quantity: entry.quantity + delta }
          : entry)
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
      <section className="bg-ink py-14 text-white sm:py-20">
        <div className="page-shell grid gap-8 lg:grid-cols-[1fr_.75fr] lg:items-center">
          <div>
            <p className="eyebrow text-sun">Food Menu</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-6xl">Start with something delicious.</h1>
            <p className="mt-4 max-w-xl leading-7 text-white/70">
              Browse the G8 kitchen menu, add your favourites and tell us where in the Embu property to serve them.
            </p>
          </div>
          <div className="overflow-hidden rounded-[2rem]">
            <img
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=88"
              alt="Fresh food served at G8 Yatch"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="bg-sand/65 py-12 sm:py-16">
        <div className="page-shell">
          <SectionHeading
            eyebrow="Order from your table"
            title="Fresh food, a few taps away."
            text="Choose a category, build your order and select your serving location at checkout."
          />
          <div className="sticky top-16 z-20 -mx-4 mt-8 border-y border-stone-200 bg-stone-50/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 md:top-20 lg:mx-0 lg:rounded-full lg:border">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`min-h-11 shrink-0 rounded-full px-5 text-sm font-bold ${category === item ? 'bg-lake text-white' : 'bg-white text-slate-600'}`}
                >
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
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sand text-lake">
                    <Utensils className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-extrabold text-ink">{item.name}</h2>
                    <p className="mt-1 text-sm leading-5 text-slate-500">{item.description}</p>
                    <p className="mt-2 text-sm font-bold text-lake">{money(item.price)}</p>
                  </div>
                  {quantity ? (
                    <div className="flex items-center rounded-full bg-ink text-white">
                      <button type="button" onClick={() => changeQuantity(item, -1)} className="flex h-11 w-10 items-center justify-center" aria-label={`Remove one ${item.name}`}>
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-5 text-center text-sm font-bold">{quantity}</span>
                      <button type="button" onClick={() => changeQuantity(item, 1)} className="flex h-11 w-10 items-center justify-center" aria-label={`Add one ${item.name}`}>
                        <Plus className="h-4 w-4" />
                      </button>
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
          {loadError && <p className="mt-6 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{loadError}</p>}
        </div>
      </section>

      {itemCount > 0 && (
        <div className="fixed inset-x-0 bottom-4 z-30 px-4">
          <button type="button" onClick={() => { setStatus(''); setCartOpen(true) }} className="mx-auto flex min-h-14 w-full max-w-lg items-center justify-between rounded-full bg-ink px-5 text-white shadow-2xl shadow-ink/30">
            <span className="flex items-center gap-2 font-bold"><ShoppingBag className="h-5 w-5" /> {itemCount} item{itemCount === 1 ? '' : 's'}</span>
            <span className="font-extrabold">{money(total)}</span>
          </button>
        </div>
      )}

      <BottomSheet open={cartOpen} onClose={() => setCartOpen(false)} title="Your food order">
        {status && status !== 'sending' ? (
          <div className={`rounded-2xl p-5 text-center ${status.startsWith('Order ') ? 'bg-lake/10' : 'bg-red-50'}`}>
            <CheckCircle2 className={`mx-auto h-9 w-9 ${status.startsWith('Order ') ? 'text-lake' : 'text-red-600'}`} />
            <p className="mt-3 font-bold text-ink">{status}</p>
          </div>
        ) : (
          <form onSubmit={placeOrder}>
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                  <div>
                    <p className="font-bold text-ink">{item.name}</p>
                    <p className="text-sm text-slate-500">{item.quantity} × {money(item.price)}</p>
                  </div>
                  <button type="button" onClick={() => changeQuantity(item, -1)} className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100" aria-label={`Remove one ${item.name}`}>
                    <Minus className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-5 space-y-4">
              <Field label="Name optional" value={orderForm.customerName} onChange={(event) => setOrderForm({ ...orderForm, customerName: event.target.value })} placeholder="Guest name" />
              <label className="block text-sm font-bold text-ink">
                Where should we bring it?
                <select required value={orderForm.location} onChange={(event) => setOrderForm({ ...orderForm, location: event.target.value })} className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 font-normal outline-none focus:border-lake">
                  <option value="">Select your location</option>
                  <option>Restaurant table</option>
                  <option>Outdoor seating</option>
                  <option>Conference room</option>
                  <option>Hotel room delivery</option>
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
    <label className="block text-sm font-bold text-ink">
      {label}
      <input {...props} className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 px-3 font-normal outline-none focus:border-lake" />
    </label>
  )
}
