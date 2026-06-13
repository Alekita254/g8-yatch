import { ArrowRight, BedDouble, Blocks, BriefcaseBusiness, Check, PartyPopper, Utensils } from 'lucide-react'
import { Link } from 'react-router-dom'

const pillars = [
  {
    path: '/menu',
    icon: Utensils,
    label: 'Eat & Enjoy',
    title: 'Food Menu',
    text: 'Explore our food first, build your order and choose where it should be served.',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=85',
  },
  {
    path: '/hotel',
    icon: BedDouble,
    label: 'Stay & Rest',
    title: 'Hotel',
    text: 'Comfortable rooms and a simple availability request without menu distractions.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=85',
  },
  {
    path: '/experiences',
    icon: PartyPopper,
    label: 'Play & Celebrate',
    title: 'Experiences',
    text: 'Garden events, team building and a playground for younger guests.',
    image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1400&q=85',
  },
  {
    path: '/corporate',
    icon: BriefcaseBusiness,
    label: 'Meet & Grow',
    title: 'Corporate',
    text: 'Conferences, meetings, trainings and team experiences.',
    image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1400&q=85',
  },
  {
    path: '/cabro-blocks',
    icon: Blocks,
    label: 'Build Better',
    title: 'Cabro Blocks',
    text: 'Durable paving blocks for homes, commercial yards and roads.',
    image: '/images/cabro-standard-60mm.png',
  },
]

export default function HomePage() {
  return (
    <main>
      <section className="relative min-h-[calc(100svh-4rem)] overflow-hidden bg-ink text-white">
        <img
          src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=2000&q=90"
          alt="G8 Yatch hospitality property in Embu"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,37,43,.25),rgba(16,37,43,.94))] md:bg-[linear-gradient(90deg,rgba(16,37,43,.94),rgba(16,37,43,.25))]" />
        <div className="page-shell relative flex min-h-[calc(100svh-4rem)] items-end pb-10 pt-24 md:items-center md:pb-20 lg:min-h-[760px]">
          <div className="max-w-3xl">
            <p className="eyebrow text-sun">One destination. Many reasons to visit.</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.02] sm:text-6xl lg:text-7xl">
              Come to stay, gather, or build something lasting.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/70 sm:text-lg">
              G8 Yatch brings food, accommodation, conferences, garden events, team building, family activities and dependable construction materials under one trusted name.
            </p>
            <div className="mt-7 flex flex-wrap gap-3 text-xs font-bold text-white/75">
              {['Embu, Kenya', 'Open every day', 'Local delivery'].map((item) => (
                <span key={item} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 backdrop-blur">
                  <Check className="h-3.5 w-3.5 text-sun" /> {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell py-14 sm:py-20">
        <div className="max-w-2xl">
          <p className="eyebrow text-lake">Choose your journey</p>
          <h2 className="mt-3 text-3xl font-extrabold text-ink sm:text-5xl">What brings you to G8 today?</h2>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          {pillars.map((pillar) => (
            <Link key={pillar.path} to={pillar.path} className="group relative min-h-[390px] overflow-hidden rounded-[1.75rem] text-white">
              <img src={pillar.image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <pillar.icon className="h-7 w-7 text-sun" />
                <p className="eyebrow mt-5 text-white/55">{pillar.label}</p>
                <h3 className="mt-2 text-3xl font-extrabold">{pillar.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/65">{pillar.text}</p>
                <span className="mt-5 inline-flex min-h-11 items-center gap-2 font-bold text-sun">
                  Explore <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-sand py-14 sm:py-20">
        <div className="page-shell grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <p className="eyebrow text-copper">Built around people</p>
            <h2 className="mt-3 text-3xl font-extrabold text-ink sm:text-5xl">Practical service, warmly delivered.</h2>
          </div>
          <p className="text-base leading-8 text-slate-600">
            Whether you are checking in for a quiet weekend, planning a company retreat, or paving a new project, our team keeps the process clear, responsive and grounded in local expertise.
          </p>
        </div>
      </section>
    </main>
  )
}
