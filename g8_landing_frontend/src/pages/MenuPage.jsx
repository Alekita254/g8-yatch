import { BellRing, CheckCircle2, Minus, Plus, ShoppingBag } from 'lucide-react'
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
  const [orderForm, setOrderForm] = useState({
    customerName: '',
    serviceArea: 'Restaurant table',
    tableNumber: '',
    hasArrived: true,
    notes: '',
  })
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
      <section className="relative min-h-[540px] overflow-hidden bg-ink text-white lg:min-h-[680px]">
        <img
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=2000&q=90"
          alt="Fresh food served at G8 Yatch"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/65 to-ink/15 lg:bg-gradient-to-r lg:from-ink lg:via-ink/60 lg:to-ink/10" />
        <div className="page-shell relative flex min-h-[540px] items-end pb-12 pt-24 lg:min-h-[680px] lg:items-center lg:pb-20">
          <div className="max-w-2xl">
            <p className="eyebrow text-sun">Food Menu</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-6xl">Start with something delicious.</h1>
            <p className="mt-4 max-w-xl leading-7 text-white/70">
              Browse the G8 kitchen menu, add your favourites and tell us exactly where you are seated.
            </p>
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

          <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {visibleMenu.map((item) => {
              const quantity = cart.find((entry) => entry.id === item.id)?.quantity || 0
              return (
                <article key={item.id} className="overflow-hidden rounded-[1.5rem] bg-white shadow-sm">
                  <div className="relative">
                    <img src={item.image} alt={item.name} className="h-48 w-full object-cover" loading="lazy" />
                    <p className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1.5 text-sm font-extrabold text-lake shadow-sm">{money(item.price)}</p>
                  </div>
                  <div className="flex min-h-44 flex-col p-4">
                    <h2 className="font-extrabold text-ink">{item.name}</h2>
                    <p className="mt-1 text-sm leading-5 text-slate-500">{item.description}</p>
                    <div className="mt-auto pt-4">
                      {quantity ? (
                        <div className="flex items-center justify-between rounded-full bg-ink text-white">
                          <button type="button" onClick={() => changeQuantity(item, -1)} className="flex h-12 w-12 items-center justify-center" aria-label={`Remove one ${item.name}`}>
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="text-sm font-bold">{quantity} in order</span>
                          <button type="button" onClick={() => changeQuantity(item, 1)} className="flex h-12 w-12 items-center justify-center" aria-label={`Add one ${item.name}`}>
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => changeQuantity(item, 1)} className="touch-button w-full bg-lake text-white" aria-label={`Add ${item.name}`}>
                          <Plus className="h-5 w-5" /> Add to order
                        </button>
                      )}
                    </div>
                  </div>
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
              <Field label="Your name" value={orderForm.customerName} onChange={(event) => setOrderForm({ ...orderForm, customerName: event.target.value })} placeholder="Guest name" required />
              <label className="block text-sm font-bold text-ink">
                Where are you seated?
                <select required value={orderForm.serviceArea} onChange={(event) => setOrderForm({ ...orderForm, serviceArea: event.target.value })} className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 font-normal outline-none focus:border-lake">
                  <option>Restaurant table</option>
                  <option>Outdoor seating</option>
                  <option>Garden seating</option>
                  <option>Conference room</option>
                </select>
              </label>
              <Field
                label="Table or seating number"
                value={orderForm.tableNumber}
                onChange={(event) => setOrderForm({ ...orderForm, tableNumber: event.target.value })}
                placeholder="Example: Table 4"
                required
              />
              <button
                type="button"
                onClick={() => setOrderForm({ ...orderForm, hasArrived: !orderForm.hasArrived })}
                className={`flex min-h-14 w-full items-center gap-3 rounded-2xl border p-3 text-left ${orderForm.hasArrived ? 'border-lake bg-lake/10' : 'border-slate-200 bg-white'}`}
                aria-pressed={orderForm.hasArrived}
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${orderForm.hasArrived ? 'bg-lake text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <BellRing className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-bold text-ink">I have arrived - alert a waiter</span>
                  <span className="mt-0.5 block text-xs text-slate-500">The waiter will know you are seated and ready for service.</span>
                </span>
              </button>
              <label className="block text-sm font-bold text-ink">
                Notes for the kitchen or waiter optional
                <textarea
                  value={orderForm.notes}
                  onChange={(event) => setOrderForm({ ...orderForm, notes: event.target.value })}
                  rows="3"
                  placeholder="Allergies, no chilli, birthday setup, bring cutlery..."
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal outline-none focus:border-lake"
                />
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
