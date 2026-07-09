import {
  ArrowRight,
  BedDouble,
  Blocks,
  BriefcaseBusiness,
  CalendarCheck,
  Check,
  ChevronRight,
  Clock3,
  Coffee,
  MapPin,
  PartyPopper,
  Phone,
  ShieldCheck,
  Sparkles,
  Utensils,
  Wifi,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { siteImages } from '../data/siteImages'

const heroImage = siteImages.homeHero.src

const pillars = [
  {
    path: '/menu',
    icon: Utensils,
    label: 'Restaurant',
    title: 'Food & Drinks',
    text: 'Fresh meals, drinks, table service and local delivery around Embu.',
    tone: 'bg-[#102f2b]',
  },
  {
    path: '/hotel',
    icon: BedDouble,
    label: 'Hotel',
    title: 'Rooms',
    text: 'Comfortable accommodation for travellers, couples, families and work visits.',
    tone: 'bg-[#26391f]',
  },
  {
    path: '/experiences',
    icon: PartyPopper,
    label: 'Family & Events',
    title: 'Gatherings',
    text: 'Birthdays, garden events, family outings, team building and children-friendly visits.',
    tone: 'bg-[#5b3a27]',
  },
  {
    path: '/corporate',
    icon: BriefcaseBusiness,
    label: 'Corporate',
    title: 'Meetings',
    text: 'Conferences, trainings, workshops, retreats and simple group coordination.',
    tone: 'bg-[#172f3a]',
  },
  {
    path: '/cabro-blocks',
    icon: Blocks,
    label: 'Cabro Yard',
    title: 'Cabro Blocks',
    text: 'Strong paving blocks for homes, compounds, parking areas and commercial projects.',
    image: siteImages.cabroHero.src,
    tone: 'bg-[#3f4038]',
  },
]

const quickAnswers = [
  [MapPin, 'Location', 'G8 Yatch Villa Hotel is in Embu, Kenya, with exact Google Maps directions in the footer.'],
  [Clock3, 'Open Daily', 'The hotel and restaurant serve guests daily. Send your dates to confirm room availability.'],
  [Utensils, 'Restaurant', 'Browse the menu, plan a table order, call a waiter or request local delivery where available.'],
  [BedDouble, 'Rooms', 'Request accommodation for business travel, family visits, short stays and group trips.'],
]

const diningHighlights = [
  'Freshly prepared meals from the G8 kitchen',
  'Breakfast, mains, drinks and waiter service',
  'Good for walk-ins, hotel guests, meetings and family tables',
]

const faqs = [
  {
    question: 'Is G8 Yatch Villa Hotel in Embu?',
    answer: 'Yes. G8 Yatch Villa Hotel is located in Embu, Kenya. Use the map and directions button in the footer for the exact Google Maps place.',
  },
  {
    question: 'Does G8 have rooms for overnight stays?',
    answer: 'Yes. Guests can request room availability for business travel, family visits, short stays and group accommodation from the hotel page.',
  },
  {
    question: 'Does the restaurant serve food and drinks?',
    answer: 'Yes. The G8 restaurant serves meals and drinks, with an online menu that lets guests browse items and plan an order before or during a visit.',
  },
  {
    question: 'Can I host a meeting, birthday or family event at G8?',
    answer: 'Yes. G8 supports meetings, trainings, birthdays, family outings, garden events and team building. The experiences and corporate pages collect the details needed for a proposal.',
  },
  {
    question: 'Does G8 sell cabro blocks?',
    answer: 'Yes. G8 also handles cabro block enquiries for paving compounds, parking areas, homes and commercial projects around Embu.',
  },
  {
    question: 'How do I contact G8 directly?',
    answer: 'Use the visit planner, room availability form, enquiry forms or the contact details in the footer. The team can confirm rooms, food orders, events and cabro enquiries.',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Hotel',
  name: 'G8 Yatch Villa Hotel',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Embu',
    addressCountry: 'KE',
  },
  containsPlace: {
    '@type': 'Restaurant',
    name: 'G8 Yatch Villa Hotel Restaurant',
  },
  amenityFeature: [
    { '@type': 'LocationFeatureSpecification', name: 'Restaurant', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Rooms', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Meetings and events', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Cabro block enquiries', value: true },
  ],
}

export default function HomePage() {
  return (
    <main className="bg-[#f7f1e6] pb-20 text-ink dark:bg-[#07171b] lg:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="relative min-h-[92svh] overflow-hidden bg-[#081216] text-white">
        <img src={heroImage} alt="Warm hotel terrace dining atmosphere inspired by G8 Yatch Villa Hotel in Embu" className="absolute inset-0 h-full w-full object-cover object-[62%_50%]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,18,22,.2)_0%,rgba(8,18,22,.7)_48%,rgba(8,18,22,.97)_100%)] sm:bg-[linear-gradient(90deg,rgba(8,18,22,.94)_0%,rgba(8,18,22,.72)_42%,rgba(8,18,22,.2)_100%)]" />
        <div className="page-shell relative flex min-h-[92svh] flex-col justify-end pb-6 pt-20 sm:pb-10 lg:justify-center">
          <div className="max-w-3xl">
            <div className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 text-xs font-extrabold uppercase tracking-[0.18em] text-sun backdrop-blur">
              <Sparkles className="h-4 w-4" /> G8 Yatch Villa Hotel · Embu
            </div>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.02] sm:text-6xl lg:text-7xl">
              A richer way to eat, stay and gather in Embu.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/78 sm:text-xl sm:leading-8">
              Hotel rooms, restaurant service, meetings, family events and cabro block enquiries, brought together with warm local hospitality.
            </p>
            <div className="mt-8 grid gap-3 sm:flex">
              <Link to="/hotel" className="touch-button bg-sun text-ink shadow-xl shadow-black/25">
                <CalendarCheck className="h-5 w-5" /> Check availability
              </Link>
              <Link to="/menu" className="touch-button border border-white/30 bg-white/10 text-white backdrop-blur">
                <Utensils className="h-5 w-5" /> View menu
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-3 rounded-lg border border-white/15 bg-[#0b1b20]/80 p-3 shadow-2xl shadow-black/35 backdrop-blur sm:max-w-4xl sm:grid-cols-3">
            {[
              [MapPin, 'Embu, Kenya', 'Exact map below'],
              [BedDouble, 'Rooms', 'Request availability'],
              [PartyPopper, 'Events', 'Plan a gathering'],
            ].map(([Icon, title, text]) => (
              <Link key={title} to={title === 'Rooms' ? '/hotel' : title === 'Events' ? '/experiences' : '/plan'} className="flex min-h-16 items-center gap-3 rounded-md border border-white/10 bg-white/8 px-3 py-3 transition hover:bg-white/14">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-sun text-ink">
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <strong className="block text-sm font-extrabold">{title}</strong>
                  <span className="text-xs text-white/60">{text}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#d9c087]/40 bg-[#0b1b20] text-white">
        <div className="page-shell flex snap-x gap-3 overflow-x-auto py-4 sm:grid sm:grid-cols-4 sm:overflow-visible">
          {quickAnswers.map(([Icon, question, answer]) => (
            <article key={question} className="min-w-[78vw] snap-center rounded-lg border border-white/10 bg-white/[0.06] p-4 sm:min-w-0">
              <Icon className="h-5 w-5 text-sun" />
              <h2 className="mt-3 text-base font-extrabold">{question}</h2>
              <p className="mt-2 text-sm leading-6 text-white/62">{answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-shell py-14 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p className="eyebrow text-copper">Choose your experience</p>
            <h2 className="mt-3 text-4xl font-extrabold leading-tight text-ink dark:text-white sm:text-6xl">
              One Embu address, many reasons to arrive.
            </h2>
          </div>
          <p className="text-base leading-8 text-slate-600 dark:text-slate-300">
            The site now separates each visitor need clearly, so a hotel guest, lunch guest, event planner, company team or cabro customer can move quickly.
          </p>
        </div>
        <div className="mt-9 flex snap-x gap-4 overflow-x-auto pb-3 lg:grid lg:grid-cols-5 lg:overflow-visible">
          {pillars.map((pillar) => (
            <Link key={pillar.path} to={pillar.path} className={`group relative flex min-h-[360px] min-w-[78vw] snap-center flex-col justify-between overflow-hidden rounded-lg ${pillar.tone} p-5 text-white shadow-xl shadow-black/10 sm:min-w-[44vw] lg:min-w-0`}>
              {pillar.image && <img src={pillar.image} alt="" className="absolute -right-16 -top-8 h-44 w-44 rotate-6 object-contain opacity-45 transition duration-700 group-hover:scale-105" />}
              <div className="relative flex h-12 w-12 items-center justify-center rounded-md bg-sun text-ink">
                <pillar.icon className="h-6 w-6" />
              </div>
              <div className="relative">
                <p className="eyebrow text-white/50">{pillar.label}</p>
                <h3 className="mt-2 text-3xl font-extrabold">{pillar.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/70">{pillar.text}</p>
                <span className="mt-6 inline-flex min-h-11 items-center gap-2 font-bold text-sun">
                  Explore <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-[#10251f] py-14 text-white sm:py-20">
        <div className="page-shell grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="eyebrow text-sun">Restaurant experience</p>
            <h2 className="mt-3 text-4xl font-extrabold leading-tight sm:text-6xl">Food that makes the visit feel settled.</h2>
            <p className="mt-5 leading-8 text-white/68">
              Come in for breakfast, sit down for a full meal, order drinks with friends, or arrange food for a meeting or family gathering. The G8 restaurant is built around the simple pleasure of being served well in Embu.
            </p>
            <Link to="/menu" className="touch-button mt-7 bg-sun text-ink">
              Browse the menu <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {diningHighlights.map((item) => (
              <div key={item} className="rounded-lg border border-white/10 bg-white/[0.06] p-5">
                <Check className="h-5 w-5 text-sun" />
                <p className="mt-4 text-sm font-bold leading-6 text-white/82">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell py-14 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="eyebrow text-lake">Why book direct</p>
            <h2 className="mt-3 text-4xl font-extrabold leading-tight text-ink dark:text-white sm:text-6xl">A smoother way to plan your G8 visit.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              [Phone, 'Direct confirmation', 'Send your dates or event details straight to the G8 team.'],
              [Coffee, 'Food connected to your stay', 'Plan meals, drinks and waiter service from the same website.'],
              [Wifi, 'Useful for work trips', 'Rooms, meetings and restaurant service sit together for business visitors.'],
              [ShieldCheck, 'No confusing middle step', 'The request goes to G8, not a generic travel listing.'],
            ].map(([Icon, title, text]) => (
              <article key={title} className="rounded-lg border border-[#d8c79d] bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#10252b]">
                <Icon className="h-6 w-6 text-lake dark:text-sun" />
                <h3 className="mt-4 text-lg font-extrabold text-ink dark:text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#081216] py-16 text-white sm:py-24">
        <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover object-[58%_70%] opacity-25" />
        <div className="absolute inset-0 bg-[#081216]/75" />
        <div className="page-shell relative grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="eyebrow text-sun">Local charm</p>
            <h2 className="mt-3 text-4xl font-extrabold leading-tight sm:text-6xl">Made for real visits in Embu.</h2>
          </div>
          <p className="text-base leading-8 text-white/72">
            A traveller can request a room, a family can plan lunch, a company can ask about a meeting, and a builder can enquire about cabro blocks without guessing where to start.
          </p>
        </div>
      </section>

      <section className="page-shell py-14 sm:py-20">
        <div className="max-w-2xl">
          <p className="eyebrow text-lake">Guest questions</p>
          <h2 className="mt-3 text-4xl font-extrabold leading-tight text-ink dark:text-white sm:text-6xl">Quick answers before you visit.</h2>
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {faqs.map((faq) => (
            <article key={faq.question} className="rounded-lg border border-[#d8c79d] bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#10252b]">
              <h3 className="text-lg font-extrabold text-ink dark:text-white">{faq.question}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#10251f] py-14 text-white sm:py-20">
        <div className="page-shell">
          <div className="rounded-lg border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/20 sm:p-8 lg:flex lg:items-center lg:justify-between lg:gap-10">
            <div>
              <p className="eyebrow text-sun">Ready to plan?</p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-5xl">Tell G8 what you need today.</h2>
              <p className="mt-3 max-w-2xl leading-7 text-white/68">
                Rooms, meals, meetings, events and cabro enquiries all start with a clear request.
              </p>
            </div>
            <Link to="/plan" className="touch-button mt-6 bg-sun text-ink lg:mt-0">
              Build my visit <Sparkles className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#081216]/92 p-3 backdrop-blur lg:hidden">
        <div className="grid grid-cols-2 gap-2">
          <Link to="/hotel" className="touch-button min-h-11 bg-sun px-3 text-xs text-ink">
            <CalendarCheck className="h-4 w-4" /> Rooms
          </Link>
          <Link to="/menu" className="touch-button min-h-11 border border-white/20 bg-white/10 px-3 text-xs text-white">
            <Utensils className="h-4 w-4" /> Menu
          </Link>
        </div>
      </div>
    </main>
  )
}
