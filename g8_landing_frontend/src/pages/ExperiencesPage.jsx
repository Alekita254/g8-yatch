import { ArrowRight, CheckCircle2, PartyPopper, Trees, UsersRound } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { submitProposal } from '../api/corporateService'
import BottomSheet from '../components/BottomSheet'
import SectionHeading from '../components/SectionHeading'
import { activities } from '../data/mockData'

export default function ExperiencesPage() {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState('')
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    event_type: 'Garden Event',
    preferred_date: '',
    pax_size: '',
    notes: '',
  })

  const openEnquiry = (eventType) => {
    setStatus('')
    setForm((current) => ({ ...current, event_type: eventType }))
    setOpen(true)
  }

  const submit = async (event) => {
    event.preventDefault()
    setStatus('sending')
    try {
      await submitProposal({ ...form, source: 'G8 experiences page' })
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <main>
      <section className="relative min-h-[560px] overflow-hidden bg-ink text-white">
        <img
          src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1800&q=90"
          alt="Friends and families enjoying activities together"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/15" />
        <div className="page-shell relative flex min-h-[560px] items-end pb-12">
          <div className="max-w-3xl">
            <p className="eyebrow text-sun">Activities in Embu</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-6xl">More than a place to visit. A place to spend the day well.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
              Stay overnight, host a gathering, bring the team together or enjoy a relaxed family day with space for children to play.
            </p>
          </div>
        </div>
      </section>

      <section className="page-shell py-14 sm:py-20">
        <SectionHeading
          eyebrow="Something for every group"
          title="Stay, meet, celebrate and play."
          text="Each experience can stand alone or be combined with food, accommodation and event support from the G8 team."
        />
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {activities.map((activity) => (
            <article key={activity.id} className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
              <img src={activity.image} alt="" className="h-52 w-full object-cover" />
              <div className="p-5">
                <p className="eyebrow text-lake">{activity.eyebrow}</p>
                <h2 className="mt-2 text-2xl font-extrabold text-ink">{activity.title}</h2>
                <p className="mt-3 min-h-18 text-sm leading-6 text-slate-600">{activity.text}</p>
                {activity.path ? (
                  <Link to={activity.path} className="touch-button mt-5 w-full bg-ink text-white">
                    {activity.action} <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <button type="button" onClick={() => openEnquiry(activity.enquiryType)} className="touch-button mt-5 w-full bg-lake text-white">
                    {activity.action} <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-sand py-14 sm:py-20">
        <div className="page-shell grid gap-4 md:grid-cols-3">
          {[
            [Trees, 'Garden space', 'Flexible outdoor space for events, activities and relaxed family time.'],
            [UsersRound, 'Group friendly', 'Packages can include meals, facilitation, venues and accommodation.'],
            [PartyPopper, 'Family occasions', 'Birthdays, celebrations and a dedicated playground for children.'],
          ].map(([Icon, title, text]) => (
            <article key={title} className="rounded-2xl bg-white p-5">
              <Icon className="h-6 w-6 text-lake" />
              <h2 className="mt-4 text-lg font-extrabold text-ink">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Plan your G8 experience">
        {status === 'success' ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-lake" />
            <h2 className="mt-4 text-xl font-extrabold text-ink">Enquiry received</h2>
            <p className="mt-2 text-slate-600">Our team will contact you to shape the right experience.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <Field label="Your name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone" type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required />
              <Field label="Email optional" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            </div>
            <label className="block text-sm font-bold text-ink">
              Activity
              <select value={form.event_type} onChange={(event) => setForm({ ...form, event_type: event.target.value })} className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 font-normal">
                <option>Conference Hall</option>
                <option>Garden Event</option>
                <option>Team Building</option>
                <option>Kids Playground / Family Visit</option>
                <option>Birthday or Celebration</option>
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Preferred date" type="date" value={form.preferred_date} onChange={(event) => setForm({ ...form, preferred_date: event.target.value })} required />
              <Field label="People" type="number" min="1" value={form.pax_size} onChange={(event) => setForm({ ...form, pax_size: event.target.value })} required />
            </div>
            <label className="block text-sm font-bold text-ink">
              Tell us more optional
              <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} rows="3" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal outline-none focus:border-lake" />
            </label>
            {status === 'error' && <p className="text-sm font-bold text-red-600">Could not send the enquiry. Please try again.</p>}
            <button disabled={status === 'sending'} className="touch-button w-full bg-lake text-white disabled:opacity-60">
              {status === 'sending' ? 'Sending...' : 'Send enquiry'}
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
