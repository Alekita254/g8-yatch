import { BellRing, CalendarDays, CheckCircle2, Clock3, MapPin, Minus, Plus, ReceiptText, ShoppingBag, Star, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { getVisit, notifyWaiter, placeHospitalityOrder, requestVisitCheckout, startVisit, submitVisitFeedback } from '../api/hospitalityService'
import { submitProposal } from '../api/corporateService'
import SectionHeading from '../components/SectionHeading'
import { usePlan } from '../context/planContext'

const money = (value) => new Intl.NumberFormat('en-KE', {
  style: 'currency',
  currency: 'KES',
  maximumFractionDigits: 0,
}).format(value)

export default function PlanPage() {
  const {
    activities,
    changeFoodQuantity,
    clearActivities,
    clearFood,
    foodCount,
    foodItems,
    foodTotal,
    removeActivity,
    setVisit,
    visit,
  } = usePlan()
  const [guest, setGuest] = useState({
    name: '',
    phone: '',
    serviceArea: 'Restaurant table',
    tableNumber: '',
    notes: '',
  })
  const [activityDetails, setActivityDetails] = useState({ preferredDate: '', paxSize: '' })
  const [orderStatus, setOrderStatus] = useState('')
  const [activityStatus, setActivityStatus] = useState('')
  const [waiterStatus, setWaiterStatus] = useState('')
  const [visitStatus, setVisitStatus] = useState('')
  const [feedback, setFeedback] = useState({ rating: 5, comment: '' })
  const [feedbackStatus, setFeedbackStatus] = useState('')

  useEffect(() => {
    if (!visit?.token) return undefined
    const refresh = async () => {
      try {
        const current = await getVisit(visit.token)
        if (current) setVisit({ ...current, token: visit.token })
      } catch {
        // Preserve the last known journey when the network is temporarily unavailable.
      }
    }
    refresh()
    const interval = window.setInterval(refresh, 12000)
    return () => window.clearInterval(interval)
  }, [visit?.token, setVisit])

  const beginVisit = async (event) => {
    event.preventDefault()
    setVisitStatus('starting')
    try {
      const response = await startVisit({
        guestName: guest.name,
        phone: guest.phone,
        serviceArea: guest.serviceArea,
        tableNumber: guest.tableNumber,
      })
      setVisit(response)
      setVisitStatus('started')
    } catch {
      setVisitStatus('error')
    }
  }

  const placeOrder = async (event) => {
    event.preventDefault()
    setOrderStatus('sending')
    try {
      const response = await placeHospitalityOrder({
        visitToken: visit.token,
        items: foodItems,
        notes: guest.notes,
      })
      clearFood()
      setVisit({ ...response, token: visit.token })
      const newestOrder = response.orders?.at(-1)
      setOrderStatus(`Order ${newestOrder?.order_number || ''} received`)
    } catch {
      setOrderStatus('We could not send the order. Please try again.')
    }
  }

  const sendActivityPlan = async (event) => {
    event.preventDefault()
    setActivityStatus('sending')
    try {
      await submitProposal({
        name: guest.name,
        phone: guest.phone,
        event_type: activities.map((activity) => activity.enquiryType || activity.title).join(', '),
        preferred_date: activityDetails.preferredDate,
        pax_size: activityDetails.paxSize,
        notes: guest.notes,
        source: 'G8 visit planner',
      })
      clearActivities()
      setActivityStatus('success')
    } catch {
      setActivityStatus('error')
    }
  }

  const alertWaiter = async () => {
    setWaiterStatus('sending')
    try {
      const response = await notifyWaiter(visit.token)
      setVisit({ ...response, token: visit.token })
      setWaiterStatus('sent')
    } catch {
      setWaiterStatus('error')
    }
  }

  const checkoutVisit = async () => {
    setVisitStatus('checking-out')
    try {
      const response = await requestVisitCheckout(visit.token)
      setVisit({ ...response, token: visit.token })
      setVisitStatus('checkout-requested')
    } catch {
      setVisitStatus('error')
    }
  }

  const sendFeedback = async (event) => {
    event.preventDefault()
    setFeedbackStatus('sending')
    try {
      const response = await submitVisitFeedback(visit.token, feedback)
      setVisit({ ...response, token: visit.token })
      setFeedbackStatus('sent')
    } catch {
      setFeedbackStatus('error')
    }
  }

  const hasPlan = foodItems.length > 0 || activities.length > 0

  return (
    <main>
      <section className="relative min-h-[68svh] overflow-hidden bg-ink text-white lg:min-h-[calc(100svh-5rem)]">
        <img
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2000&q=90"
          alt="Restaurant service prepared for guests"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/10 lg:bg-gradient-to-r lg:from-ink/95 lg:via-ink/45 lg:to-transparent" />
        <div className="page-shell relative flex min-h-[68svh] items-end pb-12 pt-24 lg:min-h-[calc(100svh-5rem)] lg:items-center lg:pb-20">
          <div className="max-w-3xl">
            <p className="eyebrow text-sun">My G8 Plan</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-6xl lg:text-7xl">Everything for your visit, in one place.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">
              Manage food, activities and quick service requests without losing your place.
            </p>
          </div>
        </div>
      </section>

      <section className="page-shell py-14 sm:py-20">
        <SectionHeading
          eyebrow="Your visit"
          title={visit ? `Visit ${visit.visit_number}` : 'Start with where you are seated.'}
          text={visit ? 'Your arrival, orders, service, bill and feedback now stay together in one journey.' : 'A name and phone are optional. Your table and private visit code are enough to serve and track this visit.'}
        />

        {visit ? (
          <VisitJourney visit={visit} onCheckout={checkoutVisit} busy={visitStatus === 'checking-out'} />
        ) : (
          <form onSubmit={beginVisit} className="mt-8 rounded-[2rem] border border-lake/20 bg-lake/5 p-5 dark:bg-white/5 sm:p-7">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-lake text-white"><MapPin className="h-5 w-5" /></span>
              <div>
                <h2 className="text-2xl font-extrabold text-ink dark:text-white">I have arrived</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">Tell us where you are. Add your name or phone only when you want a more personal service or receipt follow-up.</p>
              </div>
            </div>
            <GuestFields guest={guest} setGuest={setGuest} arrival />
            {visitStatus === 'error' && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">We could not start your visit. Please try again.</p>}
            <button disabled={!guest.tableNumber || visitStatus === 'starting'} className="touch-button mt-5 w-full bg-lake text-white disabled:opacity-50">
              {visitStatus === 'starting' ? 'Starting your visit...' : 'Confirm arrival'}
            </button>
          </form>
        )}

        {orderStatus.startsWith('Order ') && (
          <p role="status" aria-live="polite" className="mt-8 flex items-center gap-3 rounded-2xl bg-lake/10 p-4 font-bold text-lake">
            <CheckCircle2 className="h-5 w-5 shrink-0" /> {orderStatus}
          </p>
        )}
        {activityStatus === 'success' && (
          <p role="status" aria-live="polite" className="mt-4 flex items-center gap-3 rounded-2xl bg-lake/10 p-4 font-bold text-lake">
            <CheckCircle2 className="h-5 w-5 shrink-0" /> Your activity request has been received.
          </p>
        )}

        {!hasPlan && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Link to="/menu" className="rounded-[1.75rem] bg-lake p-6 text-white">
              <ShoppingBag className="h-7 w-7 text-sun" />
              <h2 className="mt-5 text-2xl font-extrabold">Choose food</h2>
              <p className="mt-2 text-white/70">Browse the visual menu and build an order.</p>
            </Link>
            <Link to="/experiences" className="rounded-[1.75rem] bg-ink p-6 text-white">
              <CalendarDays className="h-7 w-7 text-sun" />
              <h2 className="mt-5 text-2xl font-extrabold">Plan activities</h2>
              <p className="mt-2 text-white/70">Add accommodation, events and family activities.</p>
            </Link>
          </div>
        )}

        <div className="mt-8 grid gap-7 lg:grid-cols-[1.2fr_.8fr] lg:items-start">
          <div className="space-y-7">
            {foodItems.length > 0 && (
              <form onSubmit={placeOrder} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#10252b] sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="eyebrow text-lake">Food order</p>
                    <h2 className="mt-2 text-2xl font-extrabold text-ink dark:text-white">{foodCount} item{foodCount === 1 ? '' : 's'}</h2>
                  </div>
                  <strong className="text-lg text-lake">{money(foodTotal)}</strong>
                </div>
                <div className="mt-5 space-y-3">
                  {foodItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-stone-50 p-3 dark:bg-white/5">
                      <img src={item.image} alt="" className="h-16 w-16 rounded-xl object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold text-ink dark:text-white">{item.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-300">{money(item.price * item.quantity)}</p>
                      </div>
                      <div className="flex items-center rounded-full border border-slate-200 bg-white dark:border-white/10 dark:bg-white/10">
                        <QuantityButton label={`Remove one ${item.name}`} onClick={() => changeFoodQuantity(item, -1)}><Minus className="h-4 w-4" /></QuantityButton>
                        <span className="min-w-6 text-center text-sm font-bold">{item.quantity}</span>
                        <QuantityButton label={`Add one ${item.name}`} onClick={() => changeFoodQuantity(item, 1)}><Plus className="h-4 w-4" /></QuantityButton>
                      </div>
                    </div>
                  ))}
                </div>
                <GuestFields guest={guest} setGuest={setGuest} />
                {orderStatus && orderStatus !== 'sending' && (
                  <p className={`mt-4 rounded-xl p-3 text-sm font-bold ${orderStatus.startsWith('Order ') ? 'bg-lake/10 text-lake' : 'bg-red-50 text-red-700'}`}>{orderStatus}</p>
                )}
                {!visit && <p className="mt-4 rounded-xl bg-sand p-3 text-sm font-bold text-ink">Confirm your arrival above before sending this order.</p>}
                <button disabled={!visit || orderStatus === 'sending'} className="touch-button mt-5 w-full bg-lake text-white disabled:opacity-60">
                  {orderStatus === 'sending' ? 'Sending order...' : `Send food order · ${money(foodTotal)}`}
                </button>
              </form>
            )}

            {activities.length > 0 && (
              <form onSubmit={sendActivityPlan} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#10252b] sm:p-7">
                <p className="eyebrow text-copper">Activities</p>
                <h2 className="mt-2 text-2xl font-extrabold text-ink dark:text-white">Shape your day at G8.</h2>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {activities.map((activity) => (
                    <div key={activity.id} className="relative overflow-hidden rounded-2xl bg-ink text-white">
                      <img src={activity.image} alt="" className="h-36 w-full object-cover opacity-65" />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink to-transparent" />
                      <p className="absolute inset-x-0 bottom-0 p-4 font-extrabold">{activity.title}</p>
                      <button type="button" onClick={() => removeActivity(activity.id)} className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink" aria-label={`Remove ${activity.title}`}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Field label="Preferred date" type="date" value={activityDetails.preferredDate} onChange={(event) => setActivityDetails({ ...activityDetails, preferredDate: event.target.value })} required />
                  <Field label="Number of people" type="number" min="1" value={activityDetails.paxSize} onChange={(event) => setActivityDetails({ ...activityDetails, paxSize: event.target.value })} required />
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Field label="Your name" value={guest.name} onChange={(event) => setGuest({ ...guest, name: event.target.value })} required />
                  <Field label="Phone number" type="tel" value={guest.phone} onChange={(event) => setGuest({ ...guest, phone: event.target.value })} required />
                </div>
                {activityStatus === 'error' && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">We could not send the request. Please try again.</p>}
                <button disabled={activityStatus === 'sending'} className="touch-button mt-5 w-full bg-ink text-white disabled:opacity-60">
                  {activityStatus === 'sending' ? 'Sending request...' : 'Send activity request'}
                </button>
              </form>
            )}
          </div>

          <aside className="rounded-[2rem] bg-sand p-5 dark:bg-[#10252b] dark:ring-1 dark:ring-white/10 lg:sticky lg:top-28 sm:p-7">
            <BellRing className="h-8 w-8 text-lake" />
            <h2 className="mt-5 text-2xl font-extrabold text-ink dark:text-white">Need a waiter?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Tell the team where you are seated and they will come to you.</p>
            {visit ? (
              <p className="mt-5 rounded-2xl bg-white/70 p-4 text-sm font-bold text-ink dark:bg-white/5 dark:text-white">
                {visit.service_area}, {visit.table_name}
              </p>
            ) : <GuestFields guest={guest} setGuest={setGuest} waiterOnly />}
            {waiterStatus === 'sent' && <p role="status" aria-live="polite" className="mt-4 flex items-center gap-2 text-sm font-bold text-lake"><CheckCircle2 className="h-5 w-5" /> Waiter notified.</p>}
            {waiterStatus === 'error' && <p role="alert" className="mt-4 text-sm font-bold text-red-700">The alert could not be sent. Please try again.</p>}
            <button
              type="button"
              disabled={!visit || waiterStatus === 'sending'}
              onClick={alertWaiter}
              className="touch-button mt-5 w-full bg-lake text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <BellRing className="h-4 w-4" /> {waiterStatus === 'sending' ? 'Notifying...' : 'Notify a waiter'}
            </button>

            {visit && (
              <form onSubmit={sendFeedback} className="mt-7 border-t border-ink/10 pt-7 dark:border-white/10">
                <Star className="h-7 w-7 text-copper" />
                <h2 className="mt-4 text-xl font-extrabold text-ink dark:text-white">How was your visit?</h2>
                <label className="mt-4 block text-sm font-bold text-ink dark:text-slate-100">
                  Rating
                  <select value={feedback.rating} onChange={(event) => setFeedback({ ...feedback, rating: Number(event.target.value) })} className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 px-3">
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Very good</option>
                    <option value="3">3 - Good</option>
                    <option value="2">2 - Could be better</option>
                    <option value="1">1 - Poor</option>
                  </select>
                </label>
                <label className="mt-4 block text-sm font-bold text-ink dark:text-slate-100">
                  Comment optional
                  <textarea value={feedback.comment} onChange={(event) => setFeedback({ ...feedback, comment: event.target.value })} rows="3" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3" />
                </label>
                {feedbackStatus === 'sent' && <p className="mt-3 text-sm font-bold text-lake">Thank you. Your feedback is saved with this visit.</p>}
                <button disabled={feedbackStatus === 'sending'} className="touch-button mt-4 w-full bg-ink text-white disabled:opacity-50">
                  {feedbackStatus === 'sending' ? 'Sending...' : 'Send feedback'}
                </button>
              </form>
            )}
          </aside>
        </div>
      </section>
    </main>
  )
}

function VisitJourney({ visit, onCheckout, busy }) {
  const statusLabels = {
    SENT: 'Received',
    PREPARING: 'Being prepared',
    READY: 'Ready',
    SERVED: 'Served',
    INVOICED: 'Added to bill',
    CANCELLED: 'Cancelled',
  }
  const due = Number(visit.total_due || 0)

  return (
    <section className="mt-8 rounded-[2rem] bg-ink p-5 text-white sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-sun">Live visit</p>
          <h2 className="mt-2 text-2xl font-extrabold">{visit.service_area}, {visit.table_name}</h2>
          <p className="mt-1 text-sm text-white/60">
            {visit.guest_name || 'Walk-in guest'} · arrived {visit.arrived_at
              ? new Date(visit.arrived_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'just now'}
          </p>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-2 text-xs font-bold uppercase tracking-wider">{visit.status.replaceAll('_', ' ')}</span>
      </div>

      <div className="mt-6 space-y-3">
        {visit.orders?.length ? visit.orders.map((order) => (
          <article key={order.id} className="rounded-2xl bg-white/8 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-extrabold">{order.order_number}</p>
                <p className="mt-1 flex items-center gap-2 text-sm text-white/65"><Clock3 className="h-4 w-4" /> {statusLabels[order.status] || order.status}</p>
              </div>
              <strong className="text-sun">{money(order.grand_total)}</strong>
            </div>
          </article>
        )) : (
          <p className="rounded-2xl bg-white/8 p-4 text-sm text-white/65">You are checked in. Choose from the menu or notify a waiter when ready.</p>
        )}
      </div>

      {visit.waiter_acknowledged_at && (
        <p className="mt-5 flex items-center gap-2 rounded-2xl bg-emerald-500/15 p-4 text-sm font-bold text-emerald-200">
          <CheckCircle2 className="h-5 w-5" /> A waiter has received your call and is on the way.
        </p>
      )}

      {visit.status === 'CLOSED' ? (
        <div className="mt-5 rounded-2xl bg-emerald-400 p-4 text-ink">
          <p className="flex items-center gap-2 font-extrabold"><CheckCircle2 className="h-5 w-5" /> Paid and complete</p>
          <p className="mt-1 text-sm">Thank you for visiting G8. Your invoice references are {visit.orders.map((order) => order.invoice?.invoice_number).filter(Boolean).join(', ')}.</p>
        </div>
      ) : visit.status === 'CHECKOUT_REQUESTED' ? (
        <div className="mt-5 rounded-2xl bg-sun p-4 text-ink">
          <p className="flex items-center gap-2 font-extrabold"><ReceiptText className="h-5 w-5" /> Checkout requested</p>
          <p className="mt-1 text-sm">Amount due: <strong>{money(due)}</strong>. A waiter or cashier will collect payment and provide your receipt.</p>
        </div>
      ) : visit.orders?.length ? (
        <button type="button" onClick={onCheckout} disabled={busy} className="touch-button mt-5 w-full bg-sun text-ink disabled:opacity-50">
          <ReceiptText className="h-4 w-4" /> {busy ? 'Preparing your bill...' : 'Request bill and checkout'}
        </button>
      ) : null}
    </section>
  )
}

function GuestFields({ guest, setGuest, waiterOnly = false, arrival = false }) {
  return (
    <div className="mt-5 space-y-4 border-t border-slate-100 pt-5 dark:border-white/10">
      {!waiterOnly && <Field label={`Your name${arrival ? ' optional' : ''}`} value={guest.name} onChange={(event) => setGuest({ ...guest, name: event.target.value })} required={!arrival} />}
      {arrival && <Field label="Phone number optional" type="tel" value={guest.phone} onChange={(event) => setGuest({ ...guest, phone: event.target.value })} />}
      <label className="block text-sm font-bold text-ink dark:text-slate-100">
        Where are you seated?
        <select value={guest.serviceArea} onChange={(event) => setGuest({ ...guest, serviceArea: event.target.value })} className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 font-normal outline-none focus:border-lake">
          <option>Restaurant table</option>
          <option>Outdoor seating</option>
          <option>Garden seating</option>
          <option>Conference room</option>
        </select>
      </label>
      <Field label="Table or seating number" value={guest.tableNumber} onChange={(event) => setGuest({ ...guest, tableNumber: event.target.value })} placeholder="Example: Table 4" required={!waiterOnly} />
      {!waiterOnly && (
        <label className="block text-sm font-bold text-ink dark:text-slate-100">
          Notes optional
          <textarea value={guest.notes} onChange={(event) => setGuest({ ...guest, notes: event.target.value })} rows="3" placeholder="Allergies, setup details or a note for the team..." className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal outline-none focus:border-lake" />
        </label>
      )}
    </div>
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

function QuantityButton({ children, label, onClick }) {
  return (
    <button type="button" onClick={onClick} className="flex h-11 w-10 items-center justify-center" aria-label={label}>
      {children}
    </button>
  )
}
