import { ArrowRight, BellRing, CheckCircle2, Minus, Plus, ShoppingBag, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { getMenu, notifyWaiter, startVisit } from '../api/hospitalityService'
import SectionHeading from '../components/SectionHeading'
import { usePlan } from '../context/planContext'

const categories = ['Starters', 'Mains', 'Drinks']
const money = (value) => new Intl.NumberFormat('en-KE', {
  style: 'currency',
  currency: 'KES',
  maximumFractionDigits: 0,
}).format(value)

export default function MenuPage() {
  const [menu, setMenu] = useState([])
  const [category, setCategory] = useState('Starters')
  const [loadError, setLoadError] = useState('')
  const { changeFoodQuantity, foodCount, foodItems, foodTotal, setVisit, visit } = usePlan()
  const [waiterOpen, setWaiterOpen] = useState(false)
  const [waiterStatus, setWaiterStatus] = useState('')
  const [seat, setSeat] = useState({ guestName: '', serviceArea: 'Restaurant table', tableNumber: '' })

  useEffect(() => {
    getMenu().then(setMenu).catch(() => setLoadError('The menu could not be loaded. Please refresh and try again.'))
  }, [])

  const visibleMenu = menu.filter((item) => item.category === category)
  const activeVisit = visit?.status === 'ACTIVE' ? visit : null
  const nextOrderNumber = (activeVisit?.orders?.length || 0) + 1

  const callWaiter = async (event) => {
    event?.preventDefault()
    setWaiterStatus('sending')
    try {
      let currentVisit = visit
      if (!currentVisit || currentVisit.status !== 'ACTIVE') {
        currentVisit = await startVisit({
          guestName: currentVisit?.guest_name || seat.guestName,
          phone: currentVisit?.phone || '',
          serviceArea: currentVisit?.service_area || seat.serviceArea,
          tableNumber: currentVisit?.table_name || seat.tableNumber,
        })
      }
      let response
      try {
        response = await notifyWaiter(currentVisit.token)
      } catch (error) {
        if ([404, 409].includes(error.response?.status)) {
          currentVisit = await startVisit({
            guestName: visit?.guest_name || seat.guestName,
            phone: visit?.phone || '',
            serviceArea: visit?.service_area || seat.serviceArea,
            tableNumber: visit?.table_name || seat.tableNumber,
          })
          response = await notifyWaiter(currentVisit.token)
        } else {
          throw error
        }
      }
      setVisit({ ...response, token: currentVisit.token })
      setWaiterStatus('sent')
      window.setTimeout(() => setWaiterOpen(false), 1400)
    } catch {
      setWaiterStatus('error')
    }
  }

  return (
    <main>
      <section className="relative min-h-[50svh] overflow-hidden bg-ink text-white lg:min-h-[58svh]">
        <img
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=2200&q=90"
          alt="Fresh food served at G8 Yatch"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/10 lg:bg-gradient-to-r lg:from-ink/95 lg:via-ink/45 lg:to-transparent" />
        <div className="page-shell relative flex min-h-[50svh] items-end pb-9 pt-20 lg:min-h-[58svh] lg:items-center lg:pb-12">
          <div className="max-w-3xl">
            <p className="eyebrow text-sun">Food Menu</p>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">Start with something delicious.</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/75 sm:text-lg">
              Browse the G8 kitchen menu, add your favourites and review everything in your visit plan.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-sand/65 py-12 pb-28 dark:bg-[#0a1d22] sm:py-16 sm:pb-28 lg:pb-16">
        <div className="page-shell">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="Step 2 · Choose your food"
              title={activeVisit?.orders?.length ? `Build order ${nextOrderNumber}.` : visit ? 'Start a fresh service order.' : 'Fresh food, a few taps away.'}
              text={activeVisit ? `Everything selected here will be added to visit ${activeVisit.visit_number} at ${activeVisit.table_name}. You can return and order again throughout the same visit.` : visit ? `Your earlier bill is complete. Ordering now will automatically start a new service round for ${visit.guest_name || 'you'} at ${visit.table_name}.` : 'Choose your food now. You will confirm your table before Step 3 sends the order.'}
            />
            <button
              type="button"
              onClick={() => {
                setWaiterStatus('')
                setWaiterOpen(true)
              }}
              className="touch-button shrink-0 border border-lake/25 bg-white text-lake shadow-sm dark:border-white/15 dark:bg-white/10 dark:text-white"
            >
              <BellRing className="h-5 w-5" /> Call a waiter
              <span className="text-xs font-normal opacity-65">Optional</span>
            </button>
          </div>
          {visit?.waiter_requested_at && !visit.waiter_acknowledged_at && (
            <p className="mt-5 flex items-center gap-2 rounded-2xl bg-sun/20 p-4 text-sm font-bold text-ink dark:text-sun">
              <BellRing className="h-5 w-5" /> Your waiter call has been sent for {visit.service_area}, {visit.table_name}.
            </p>
          )}
          {visit?.waiter_acknowledged_at && (
            <p className="mt-5 flex items-center gap-2 rounded-2xl bg-lake/10 p-4 text-sm font-bold text-lake dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5" /> A waiter has received your call and is on the way.
            </p>
          )}
          <div className="sticky top-16 z-20 -mx-4 mt-8 border-y border-stone-200 bg-stone-50/95 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-[#07171b]/95 sm:-mx-6 sm:px-6 md:top-20 lg:mx-0 lg:rounded-full lg:border">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`min-h-11 shrink-0 rounded-full px-5 text-sm font-bold ${category === item ? 'bg-lake text-white' : 'bg-white text-slate-600 dark:bg-white/10 dark:text-slate-200'}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-7 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
            <div>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-bold text-slate-500 dark:text-slate-300">{visibleMenu.length} {category.toLowerCase()}</p>
                {foodCount > 0 && <p className="text-sm font-extrabold text-lake">{foodCount} item{foodCount === 1 ? '' : 's'} selected</p>}
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {visibleMenu.map((item) => {
                  const quantity = foodItems.find((entry) => entry.id === item.id)?.quantity || 0
                  return (
                    <FoodCard
                      key={item.id}
                      item={item}
                      quantity={quantity}
                      changeFoodQuantity={changeFoodQuantity}
                    />
                  )
                })}
              </div>
              {visibleMenu.length === 0 && !loadError && (
                <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white/60 p-10 text-center text-sm font-bold text-slate-500 dark:border-white/15 dark:bg-white/5 dark:text-slate-300">
                  No items are available in this category right now.
                </div>
              )}
            </div>

            <OrderSummary
              foodCount={foodCount}
              foodItems={foodItems}
              foodTotal={foodTotal}
              changeFoodQuantity={changeFoodQuantity}
              visit={activeVisit}
            />
          </div>
          {loadError && <p className="mt-6 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{loadError}</p>}
        </div>
      </section>
      {waiterOpen && (
        <WaiterDialog
          visit={visit}
          seat={seat}
          setSeat={setSeat}
          status={waiterStatus}
          onClose={() => setWaiterOpen(false)}
          onSubmit={callWaiter}
        />
      )}
      {foodItems.length > 0 && (
        <MobileOrderBar foodCount={foodCount} foodTotal={foodTotal} visit={activeVisit} />
      )}
    </main>
  )
}

function FoodCard({ item, quantity, changeFoodQuantity }) {
  return (
    <article className={`overflow-hidden rounded-[1.4rem] border bg-white shadow-sm transition dark:bg-[#10252b] ${quantity ? 'border-lake ring-2 ring-lake/10' : 'border-slate-200 dark:border-white/10'}`}>
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img src={item.image} alt={item.name} className="h-full w-full object-cover transition duration-300 hover:scale-[1.03]" loading="lazy" />
        {quantity > 0 && (
          <span className="absolute right-3 top-3 flex h-8 min-w-8 items-center justify-center rounded-full bg-lake px-2 text-xs font-extrabold text-white shadow-lg">
            {quantity}
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-extrabold leading-6 text-ink dark:text-white">{item.name}</h2>
          <strong className="shrink-0 text-sm text-lake dark:text-sun">{money(item.price)}</strong>
        </div>
        <p className="mt-2 min-h-10 text-sm leading-5 text-slate-500 dark:text-slate-300">
          {item.description || 'Freshly prepared by the G8 kitchen.'}
        </p>
        <div className="mt-4">
          {quantity ? (
            <div className="flex min-h-14 items-center justify-between rounded-full border border-slate-200 bg-slate-100 p-1.5 text-ink dark:border-white/15 dark:bg-white/10 dark:text-white">
              <button type="button" onClick={() => changeFoodQuantity(item, -1)} className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 dark:bg-white dark:text-ink dark:ring-white" aria-label={`Remove one ${item.name}`}>
                <Minus className="h-5 w-5 stroke-[2.5]" />
              </button>
              <span className="px-2 text-center text-sm font-extrabold">{quantity} selected</span>
              <button type="button" onClick={() => changeFoodQuantity(item, 1)} className="flex h-11 w-11 items-center justify-center rounded-full bg-lake text-white shadow-sm transition hover:bg-lake-dark dark:bg-sun dark:text-ink" aria-label={`Add one ${item.name}`}>
                <Plus className="h-5 w-5 stroke-[2.5]" />
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => changeFoodQuantity(item, 1)} className="touch-button w-full bg-lake text-white" aria-label={`Add ${item.name}`}>
              <Plus className="h-5 w-5" /> Add
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

function WaiterDialog({ visit, seat, setSeat, status, onClose, onSubmit }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-ink/70 p-0 backdrop-blur-sm sm:items-center sm:justify-center sm:p-5" role="dialog" aria-modal="true" aria-labelledby="waiter-dialog-title">
      <button type="button" className="absolute inset-0" onClick={onClose} aria-label="Close waiter request" />
      <form onSubmit={onSubmit} className="relative w-full rounded-t-[2rem] bg-white p-5 shadow-2xl dark:bg-[#10252b] sm:max-w-md sm:rounded-[2rem] sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sun text-ink"><BellRing className="h-5 w-5" /></span>
          <button type="button" onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-ink dark:bg-white/10 dark:text-white" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="eyebrow mt-5 text-lake">Optional service</p>
        <h2 id="waiter-dialog-title" className="mt-2 text-2xl font-extrabold text-ink dark:text-white">Call a waiter to your table</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {visit ? `We will notify the team for ${visit.guest_name || 'the guest'} at ${visit.service_area}, ${visit.table_name}.` : 'Tell us your name and where you are seated. This also starts your private visit so your waiter call and later orders remain together.'}
        </p>

        {!visit && (
          <div className="mt-5 space-y-4">
            <label className="block text-sm font-bold text-ink dark:text-slate-100">
              Your name
              <input required value={seat.guestName} onChange={(event) => setSeat({ ...seat, guestName: event.target.value })} placeholder="Example: Alex" autoComplete="name" className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 px-3 font-normal outline-none focus:border-lake" />
            </label>
            <label className="block text-sm font-bold text-ink dark:text-slate-100">
              Seating area
              <select value={seat.serviceArea} onChange={(event) => setSeat({ ...seat, serviceArea: event.target.value })} className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 font-normal outline-none focus:border-lake">
                <option>Restaurant table</option>
                <option>Outdoor seating</option>
                <option>Garden seating</option>
                <option>Bar</option>
              </select>
            </label>
            <label className="block text-sm font-bold text-ink dark:text-slate-100">
              Table or seating number
              <input required value={seat.tableNumber} onChange={(event) => setSeat({ ...seat, tableNumber: event.target.value })} placeholder="Example: Table 4" className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 px-3 font-normal outline-none focus:border-lake" />
            </label>
          </div>
        )}

        {status === 'sent' && <p className="mt-5 flex items-center gap-2 rounded-xl bg-lake/10 p-3 text-sm font-bold text-lake"><CheckCircle2 className="h-5 w-5" /> Waiter notified.</p>}
        {status === 'error' && <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">We could not send the waiter call. Please try again.</p>}
        <button disabled={status === 'sending' || status === 'sent' || (!visit && (!seat.guestName.trim() || !seat.tableNumber.trim()))} className="touch-button mt-5 w-full bg-lake text-white disabled:opacity-50">
          <BellRing className="h-4 w-4" /> {status === 'sending' ? 'Calling waiter...' : status === 'sent' ? 'Waiter notified' : 'Notify a waiter'}
        </button>
      </form>
    </div>
  )
}

function OrderSummary({ foodCount, foodItems, foodTotal, changeFoodQuantity, visit }) {
  return (
    <aside className="hidden rounded-[1.75rem] bg-ink p-5 text-white lg:sticky lg:top-28 lg:block">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="eyebrow text-sun">Step 3 · Your order</p>
          <h2 className="mt-2 text-2xl font-extrabold">Order {(visit?.orders?.length || 0) + 1}</h2>
          <p className="mt-1 text-sm text-white/55">{foodCount || 'No'} item{foodCount === 1 ? '' : 's'} selected</p>
        </div>
        <ShoppingBag className="h-7 w-7 text-sun" />
      </div>
      {foodItems.length ? (
        <>
          <div className="mt-5 max-h-[42vh] space-y-2 overflow-y-auto pr-1">
            {foodItems.map((item) => (
              <div key={item.id} className="rounded-2xl bg-white/7 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{item.name}</p>
                    <p className="mt-1 text-xs text-white/55">{money(item.price)} each</p>
                  </div>
                  <strong className="shrink-0 text-sm text-sun">{money(item.quantity * item.price)}</strong>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs font-bold text-white/55">Quantity</span>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => changeFoodQuantity(item, -1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink shadow-sm transition hover:bg-slate-100" aria-label={`Remove one ${item.name}`}>
                      <Minus className="h-5 w-5 stroke-[2.5]" />
                    </button>
                    <span className="min-w-5 text-center text-sm font-extrabold">{item.quantity}</span>
                    <button type="button" onClick={() => changeFoodQuantity(item, 1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-sun text-ink shadow-sm" aria-label={`Add one ${item.name}`}>
                      <Plus className="h-5 w-5 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-end justify-between border-t border-white/10 pt-4">
            <div>
              <span className="text-sm text-white/60">Order total</span>
              <p className="mt-1 text-xs text-white/40">Taxes included where applicable</p>
            </div>
            <strong className="text-2xl text-sun">{money(foodTotal)}</strong>
          </div>
          <Link to="/plan" className="touch-button mt-5 w-full bg-sun text-ink">
            Continue to place order <ArrowRight className="h-4 w-4" />
          </Link>
        </>
      ) : (
        <p className="mt-5 text-sm leading-6 text-white/60">Items you choose will appear here. This summary stays visible without covering the menu.</p>
      )}
    </aside>
  )
}

function MobileOrderBar({ foodCount, foodTotal, visit }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-ink/95 p-3 text-white shadow-[0_-12px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-lg items-center gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3 px-1">
          <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10">
            <ShoppingBag className="h-5 w-5 text-sun" />
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-sun px-1 text-[10px] font-extrabold text-ink">{foodCount}</span>
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs text-white/55">Order {(visit?.orders?.length || 0) + 1} total</p>
            <p className="font-extrabold text-sun">{money(foodTotal)}</p>
          </div>
        </div>
        <Link to="/plan" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-sun px-5 text-sm font-extrabold text-ink">
          Review order <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
