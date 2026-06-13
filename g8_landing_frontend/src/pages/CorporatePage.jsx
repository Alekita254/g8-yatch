import { ArrowRight, CalendarDays, CheckCircle2, Presentation, UsersRound } from 'lucide-react'
import { useState } from 'react'

import { submitProposal } from '../api/corporateService'
import BottomSheet from '../components/BottomSheet'
import SectionHeading from '../components/SectionHeading'
import { corporateExperiences } from '../data/mockData'

export default function CorporatePage() {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState('')
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', start_date: '', end_date: '', pax_size: '', event_type: 'Conference Hall' })

  const submit = async (event) => {
    event.preventDefault()
    setStatus('sending')
    try {
      await submitProposal({ ...form, source: 'G8 landing page' })
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <main>
      <section className="relative min-h-[72svh] overflow-hidden bg-ink text-white lg:min-h-[calc(100svh-5rem)]">
        <img src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=2000&q=90" alt="Corporate team event" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/10 lg:bg-gradient-to-r lg:from-ink/95 lg:via-ink/45 lg:to-transparent" />
        <div className="page-shell relative flex min-h-[72svh] items-end pb-12 pt-24 lg:min-h-[calc(100svh-5rem)] lg:items-center lg:pb-20">
          <div className="max-w-2xl">
            <p className="eyebrow text-sun">Conferences & Events</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-6xl lg:text-7xl">Give your team room to think differently.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">Purpose-built gatherings in Embu, with thoughtful service and everything coordinated through one team.</p>
            <button type="button" onClick={() => setOpen(true)} className="touch-button mt-7 bg-sun text-ink">Request a proposal <ArrowRight className="h-4 w-4" /></button>
            <div className="mt-7 max-w-md rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <p className="font-extrabold">Day and residential packages</p>
              <p className="mt-1 text-sm text-white/65">Venue, meals, equipment and accommodation in one proposal.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell py-14 sm:py-20">
        <SectionHeading eyebrow="Made for momentum" title="From focused meetings to full company retreats." />
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {corporateExperiences.map((item, index) => (
            <article key={item.title} className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sand text-lake">
                {index % 2 ? <UsersRound className="h-5 w-5" /> : <Presentation className="h-5 w-5" />}
              </span>
              <h3 className="mt-5 text-xl font-extrabold text-ink">{item.title}</h3>
              <p className="mt-2 leading-6 text-slate-600">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-sand py-14 sm:py-20">
        <div className="page-shell grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading eyebrow="Everything in one plan" title="Less coordination. More connection." />
            <div className="mt-7 space-y-4">
              {['Flexible indoor and outdoor venues', 'Projectors, sound and reliable Wi-Fi', 'Custom menus and dietary planning', 'Accommodation and team activities'].map((item) => (
                <p key={item} className="flex items-center gap-3 font-semibold text-ink"><CheckCircle2 className="h-5 w-5 text-lake" /> {item}</p>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] bg-lake p-6 text-white sm:p-8">
            <CalendarDays className="h-8 w-8 text-sun" />
            <h3 className="mt-5 text-2xl font-extrabold">Planning something soon?</h3>
            <p className="mt-3 leading-7 text-white/65">Tell us your dates and group size. Our events team will prepare a practical proposal around your goals.</p>
            <button type="button" onClick={() => setOpen(true)} className="touch-button mt-6 w-full bg-white text-ink">Start your request</button>
          </div>
        </div>
      </section>

      <BottomSheet open={open} onClose={() => { setOpen(false); setStatus('') }} title="Request a proposal">
        {status === 'success' ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-lake" />
            <h3 className="mt-4 text-xl font-extrabold text-ink">Request received</h3>
            <p className="mt-2 text-slate-600">Our events team will contact you with the next steps.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <Field label="Your name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            <Field label="Company" value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} required />
            <div className="grid grid-cols-2 gap-3"><Field label="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /><Field label="Phone" type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required /></div>
            <label className="block text-sm font-bold text-ink">Event type<select value={form.event_type} onChange={(event) => setForm({ ...form, event_type: event.target.value })} className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 font-normal"><option>Conference Hall</option><option>Team Building</option><option>Garden Event</option><option>Meeting</option><option>Training</option><option>Kids Party / Family Day</option></select></label>
            <div className="grid grid-cols-2 gap-3"><Field label="Start date" type="date" value={form.start_date} onChange={(event) => setForm({ ...form, start_date: event.target.value })} required /><Field label="End date" type="date" value={form.end_date} onChange={(event) => setForm({ ...form, end_date: event.target.value })} required /></div>
            <Field label="Number of people" type="number" min="1" value={form.pax_size} onChange={(event) => setForm({ ...form, pax_size: event.target.value })} required />
            {status === 'error' && <p className="text-sm font-bold text-red-600">Could not send the request. Please try again.</p>}
            <button disabled={status === 'sending'} className="touch-button w-full bg-lake text-white disabled:opacity-60">{status === 'sending' ? 'Sending...' : 'Send proposal request'}</button>
          </form>
        )}
      </BottomSheet>
    </main>
  )
}

function Field({ label, ...props }) {
  return <label className="block text-sm font-bold text-ink">{label}<input {...props} className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 px-3 font-normal outline-none focus:border-lake" /></label>
}
