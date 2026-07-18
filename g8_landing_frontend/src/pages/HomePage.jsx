import { ArrowDown, BedDouble, Tent, Users, Utensils } from 'lucide-react'
import { Link } from 'react-router-dom'
import { siteImages } from '../data/siteImages'

const sections = [
  {
    id: 'hotel',
    title: 'The Hotel',
    eyebrow: 'Strategic Tables & Sitting Areas',
    desc: 'Perfectly spaced private areas to unwind in peace. Engineered for deep rest and creative conversations.',
    images: [
      '/photos/hotel_01.png',
      '/photos/hotel_02.png',
      '/photos/hotel_03.png',
      '/photos/hotel_04.png'
    ]
  },
  {
    id: 'hall',
    title: 'Multi Purpose Hall',
    eyebrow: 'Conferences & Events',
    desc: 'For grand events and structured meetings. A sophisticated setting for your most important gatherings.',
    images: [
      '/photos/hall_01.jpg',
      '/photos/hall_02.jpg',
      '/photos/hall_03.jpg',
      '/photos/hall_04.jpg'
    ]
  },
  {
    id: 'gardens',
    title: 'The Gardens',
    eyebrow: 'Outdoor Spaces & Fun Area',
    desc: 'Lush green spaces for outdoor events, relaxation, and children’s activities.',
    images: [
      '/photos/garden_01.jpg',
      '/photos/garden_02.jpg',
      '/photos/garden_03.jpg',
      '/photos/garden_04.jpg',
      '/photos/garden_05.jpg',
      '/photos/garden_06.jpg',
      '/photos/garden_07.jpg',
      '/photos/kids_play_01.jpg',
      '/photos/kids_play_02.jpg',
      '/photos/kids_play_03.jpg'
    ]
  },
  {
    id: 'rooms',
    title: 'The Rooms',
    eyebrow: 'Suites & Comfort',
    desc: 'Luxurious comfort engineered for deep rest. A sanctuary within G8.',
    images: [
      '/photos/room_01.jpg',
      '/photos/room_02.jpg',
      '/photos/room_03.jpg',
      '/photos/room_04.jpg',
      '/photos/room_05.jpg'

    ]
  },
  // {
  //   id: 'staff',
  //   title: 'Our Staff',
  //   eyebrow: 'The Heart of G8',
  //   desc: 'A dedicated team working seamlessly together to serve you with excellence.',
  //   images: [
  //     '/photos/20260711_182335.jpg',
  //     '/photos/20260711_182337.jpg',
  //     '/photos/20260711_182341.jpg',
  //     '/photos/20260711_182442.jpg'
  //   ]
  // }
]

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-[#fafafa] text-[#10252b] selection:bg-[#e3bd6f] selection:text-white">

      {/* Background Ambience - Clean, no borders, soft floaters */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 h-32 w-32 rounded-full bg-[#e3bd6f] opacity-[0.03] blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-[#c58452] opacity-[0.03] blur-3xl animate-float-delayed"></div>
      </div>

      {/* Floating Header Nav (Optional for quick links, borderless) */}
      <nav className="fixed top-16 lg:top-20 z-50 w-full mix-blend-difference pointer-events-none">
        <div className="mx-auto flex max-w-7xl justify-end px-4 sm:px-6 lg:px-8">
          <ul className="hidden md:flex flex-col items-end gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#e3bd6f] pointer-events-auto">
            {sections.map(sec => (
              <li key={sec.id}>
                <a href={`#${sec.id}`} className="hover:text-white transition-colors">{sec.title}</a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Hero Section: Honeycomb Map */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center pt-20 pb-32 px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16 max-w-3xl">
          <h1 className="text-5xl font-black uppercase tracking-tighter text-[#10252b] sm:text-7xl lg:text-[7rem] leading-none mb-6">
            G8 Yatch < br />Villa
          </h1>
          <p className="mx-auto max-w-lg text-lg font-medium text-[#10252b]/60 tracking-wide uppercase">
            Engineered Presence. A pure work of art.
          </p>
        </div>

        {/* Dynamic Honeycomb Cluster Map */}
        <div className="honeycomb w-full max-w-5xl mx-auto flex flex-wrap justify-center items-center scale-90 sm:scale-100">

          <a href="#rooms" className="honeycomb-cell cell-md group bg-white shadow-xl hover:bg-white hover:z-20">
            <BedDouble className="mb-2 h-8 w-8 text-[#c58452] transition-transform duration-500 group-hover:scale-110" />
            <h2 className="cell-title !text-lg !text-[#10252b]">Rooms</h2>
          </a>

          <a href="#gardens" className="honeycomb-cell cell-md group bg-white shadow-xl hover:bg-white hover:z-20">
            <Tent className="mb-2 h-8 w-8 text-[#c58452] transition-transform duration-500 group-hover:scale-110" />
            <h2 className="cell-title !text-lg !text-[#10252b]">Gardens</h2>
          </a>

          <a href="#hotel" className="honeycomb-cell cell-lg group bg-white shadow-2xl hover:bg-white hover:z-30 relative z-10">
            <Utensils className="mb-4 h-12 w-12 text-[#c58452] transition-transform duration-500 group-hover:scale-110" />
            <h2 className="cell-title !text-3xl !text-[#10252b]">Hotel</h2>
          </a>

          <a href="#hall" className="honeycomb-cell cell-md group bg-white shadow-xl hover:bg-white hover:z-20">
            <Users className="mb-2 h-8 w-8 text-[#c58452] transition-transform duration-500 group-hover:scale-110" />
            <h2 className="cell-title !text-lg !text-[#10252b]">Hall</h2>
          </a>

          {/* <a href="#staff" className="honeycomb-cell cell-sm group bg-white shadow-lg hover:bg-white hover:z-20">
            <h2 className="cell-title !text-sm !text-[#10252b]">Staff</h2>
          </a> */}

          <a href="#gardens" className="honeycomb-cell cell-sm group bg-white shadow-lg hover:bg-white hover:z-20">
            <h2 className="cell-title !text-sm !text-[#10252b]">Fun Area</h2>
          </a>

          <a href="#hall" className="honeycomb-cell cell-sm group bg-white shadow-lg hover:bg-white hover:z-20">
            <h2 className="cell-title !text-sm !text-[#10252b]">Trainings</h2>
          </a>

        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[#c58452] opacity-50 flex flex-col items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest">Scroll to explore</span>
          <ArrowDown className="h-5 w-5 animate-bounce" />
        </div>
      </section>

      {/* Welcome Parallax Section */}
      <section className="relative z-10 min-h-[150vh] w-full">
        <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
          <img
            src="/photos/g8_entrance_inspo.png"
            alt="Welcome to G8 Yatch Hotel Embu"
            className="absolute inset-0 h-full w-full object-cover filter brightness-[0.85]"
          />
          <div className="absolute inset-0 bg-[#fafafa]/20" />
          <h2 className="relative z-10 text-6xl md:text-8xl lg:text-[10rem] font-black uppercase tracking-tighter text-white mix-blend-overlay text-center leading-none">
            Welcome<br />To G8
          </h2>
        </div>
      </section>

      {/* Awwwards Style Flowing Sections (Sticky Stacking Cards) */}
      <div className="relative z-20 bg-[#fafafa]">
        {sections.map((sec, index) => (
          <section key={sec.id} id={sec.id} className="relative w-full">
            <div className={`mx-auto flex max-w-7xl flex-col lg:flex-row ${index % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>

              {/* Left Side: Sticky Text */}
              <div className="w-full lg:w-5/12 relative">
                <div className="sticky top-0 h-screen flex flex-col justify-center px-6 lg:px-16 z-20 pointer-events-none">
                  <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#c58452]">
                    {sec.eyebrow}
                  </p>
                  <h3 className="mb-6 text-5xl lg:text-7xl font-black uppercase tracking-tighter text-[#10252b] leading-[0.9]">
                    {sec.title}
                  </h3>
                  <p className="max-w-md text-lg text-[#10252b]/60 font-medium">
                    {sec.desc}
                  </p>
                </div>
              </div>

              {/* Right Side: Stacking Sticky Images */}
              <div className="w-full lg:w-7/12 relative">
                {sec.images.map((img, i) => (
                  <div
                    key={img + i}
                    className="sticky top-0 h-screen w-full flex items-center justify-center p-4 lg:p-12"
                    style={{ paddingTop: `calc(3rem + ${i * 40}px)` }} // Slight offset so they stack visibly like cards
                  >
                    <div className="relative w-full h-[70vh] lg:h-[85vh] rounded-[2rem] overflow-hidden shadow-2xl origin-bottom transition-transform duration-700 ease-out hover:scale-[1.02]">
                      <img
                        src={img}
                        alt={`${sec.title} ${i + 1}`}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/10" />
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </section>
        ))}
      </div>

      {/* Contact Section */}
      <section id="contact" className="relative z-30 w-full bg-[#10252b] text-white py-32 lg:py-48">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl lg:text-[6rem] font-black uppercase tracking-tighter leading-none mb-8">
            Experience G8
          </h2>
          <p className="mb-16 text-xl text-white/60 font-medium max-w-2xl mx-auto">
            Ready to visit? Our team is waiting to provide an unforgettable stay.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a href="tel:+254700000000" className="inline-flex min-h-16 items-center justify-center rounded-full bg-[#e3bd6f] text-[#10252b] px-10 text-sm font-bold uppercase tracking-widest hover:bg-white transition-colors">
              Call Reception
            </a>
            <a href="mailto:info@g8.com" className="inline-flex min-h-16 items-center justify-center rounded-full bg-transparent border border-white/20 text-white px-10 text-sm font-bold uppercase tracking-widest hover:bg-white/10 transition-colors">
              Email Us
            </a>
          </div>
        </div>
      </section>

    </main>
  )
}
