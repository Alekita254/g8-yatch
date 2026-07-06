import { ArrowRight, BedDouble, Blocks, BriefcaseBusiness, Check, MapPin, PartyPopper, Utensils } from 'lucide-react'
import { Link } from 'react-router-dom'

const pillars = [
  {
    path: '/menu',
    icon: Utensils,
    label: 'Restaurant',
    title: 'Food & Drinks',
    text: 'Order meals and drinks from the G8 kitchen for dine-in service or local delivery around Embu.',
    tone: 'from-[#0d6663] via-[#184f49] to-[#10252b]',
  },
  {
    path: '/hotel',
    icon: BedDouble,
    label: 'Rooms',
    title: 'Stay Over',
    text: 'Ask for room availability when you need a practical place to rest in Embu.',
    tone: 'from-[#415a3f] via-[#274c43] to-[#10252b]',
  },
  {
    path: '/experiences',
    icon: PartyPopper,
    label: 'Family & Events',
    title: 'Gather at G8',
    text: 'Plan birthdays, family outings, garden events, team building and children-friendly visits.',
    tone: 'from-[#c58452] via-[#8f5b3d] to-[#10252b]',
  },
  {
    path: '/corporate',
    icon: BriefcaseBusiness,
    label: 'Work',
    title: 'Meetings',
    text: 'Book space and support for conferences, trainings, meetings and company retreats.',
    tone: 'from-[#314f6f] via-[#234458] to-[#10252b]',
  },
  {
    path: '/cabro-blocks',
    icon: Blocks,
    label: 'Cabro Yard',
    title: 'Cabro Blocks',
    text: 'Buy strong paving blocks for homes, compounds, parking areas and commercial projects.',
    image: '/images/cabro-standard-60mm.png',
    tone: 'from-[#4f5758] via-[#374446] to-[#10252b]',
  },
]

export default function HomePage() {
  return (
    <main>
      <section className="relative overflow-hidden bg-[#123239] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_16%,rgba(227,189,111,.22),transparent_30%),linear-gradient(135deg,#10252b_0%,#0d6663_52%,#415a3f_100%)]" />
        <div className="page-shell relative grid min-h-[72svh] gap-10 pb-10 pt-20 md:grid-cols-[1fr_0.9fr] md:items-center lg:min-h-[76svh]">
          <div className="max-w-3xl">
            <p className="eyebrow text-sun">G8 in Embu</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.02] sm:text-5xl lg:text-6xl">
              Food, rooms, events and cabro blocks from one local team.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/78 sm:text-lg">
              Visit G8 for meals, accommodation, meetings, family events and construction materials right here in Embu.
            </p>
            <div className="mt-7 grid gap-3 text-sm font-bold text-white/80 sm:grid-cols-3">
              {[
                ['Embu, Kenya', MapPin],
                ['Open daily', Check],
                ['Local delivery', Check],
              ].map(([item, Icon]) => (
                <span key={item} className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-2 backdrop-blur">
                  <Icon className="h-4 w-4 shrink-0 text-sun" /> {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative min-h-[360px] overflow-hidden rounded-lg border border-white/15 bg-white/10 p-4 shadow-2xl shadow-black/20 backdrop-blur">
            <div className="grid h-full grid-cols-2 gap-3">
              <div className="flex flex-col justify-between rounded-lg bg-white p-4 text-ink">
                <Utensils className="h-8 w-8 text-lake" />
                <div>
                  <p className="eyebrow text-copper">Restaurant</p>
                  <p className="mt-2 text-2xl font-extrabold">Meals & drinks</p>
                </div>
              </div>
              <div className="overflow-hidden rounded-lg bg-[#d9d0c1]">
                <img src="/images/cabro-standard-60mm.png" alt="G8 cabro paving blocks" className="h-full w-full object-cover" />
              </div>
              <div className="rounded-lg bg-[#e3bd6f] p-4 text-ink">
                <BriefcaseBusiness className="h-8 w-8" />
                <p className="mt-16 text-xl font-extrabold">Meetings & trainings</p>
              </div>
              <div className="rounded-lg bg-[#10252b] p-4 text-white">
                <BedDouble className="h-8 w-8 text-sun" />
                <p className="mt-16 text-xl font-extrabold">Rooms in Embu</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell py-14 sm:py-20">
        <div className="max-w-2xl">
          <p className="eyebrow text-lake">Choose your journey</p>
          <h2 className="mt-3 text-3xl font-extrabold text-ink dark:text-white sm:text-5xl">What brings you to G8 today?</h2>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          {pillars.map((pillar) => (
            <Link key={pillar.path} to={pillar.path} className={`group relative min-h-[330px] overflow-hidden rounded-lg bg-gradient-to-br ${pillar.tone} p-6 text-white shadow-sm`}>
              {pillar.image && <img src={pillar.image} alt="" className="absolute -right-14 -top-10 h-48 w-48 rotate-6 object-contain opacity-55 transition duration-700 group-hover:scale-105" />}
              <div className="relative flex h-full flex-col justify-end">
                <pillar.icon className="h-8 w-8 text-sun" />
                <p className="eyebrow mt-8 text-white/55">{pillar.label}</p>
                <h3 className="mt-2 text-3xl font-extrabold">{pillar.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/72">{pillar.text}</p>
                <span className="mt-6 inline-flex min-h-11 items-center gap-2 font-bold text-sun">
                  Explore <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-sand py-14 dark:bg-[#10252b] sm:py-20">
        <div className="page-shell grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <p className="eyebrow text-copper">Built around people</p>
          <h2 className="mt-3 text-3xl font-extrabold text-ink dark:text-white sm:text-5xl">Practical service, warmly delivered.</h2>
          </div>
          <p className="text-base leading-8 text-slate-600 dark:text-slate-300">
            Whether you are checking in, ordering food, planning a company retreat, hosting family or paving a project, the G8 team keeps the process clear, responsive and grounded in Embu.
          </p>
        </div>
      </section>
    </main>
  )
}
