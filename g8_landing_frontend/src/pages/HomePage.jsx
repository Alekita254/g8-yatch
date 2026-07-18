import { ArrowDown, BedDouble, ChevronLeft, ChevronRight, ExternalLink, Hexagon, Maximize2, MapPin, Phone, Tent, Users, Utensils, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

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
  }
]

export default function HomePage() {
  const [activeLightbox, setActiveLightbox] = useState(null)

  const openLightbox = (sectionTitle, images, initialIndex) => {
    setActiveLightbox({ title: sectionTitle, images, currentIndex: initialIndex })
  }

  const closeLightbox = () => setActiveLightbox(null)

  const prevImage = () => {
    if (!activeLightbox) return
    setActiveLightbox(prev => ({
      ...prev,
      currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length
    }))
  }

  const nextImage = () => {
    if (!activeLightbox) return
    setActiveLightbox(prev => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % prev.images.length
    }))
  }

  return (
    <main className="relative min-h-screen bg-[#fafafa] text-[#10252b] selection:bg-[#e3bd6f] selection:text-white pb-20 lg:pb-0">

      {/* Background Ambience - Soft floaters */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 h-32 w-32 rounded-full bg-[#e3bd6f] opacity-[0.04] blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-[#c58452] opacity-[0.04] blur-3xl animate-float-delayed"></div>
      </div>

      {/* Desktop Floating Header Nav */}
      <nav className="fixed top-20 z-50 w-full mix-blend-difference pointer-events-none hidden lg:block">
        <div className="mx-auto flex max-w-7xl justify-end px-8">
          <ul className="flex flex-col items-end gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#e3bd6f] pointer-events-auto">
            {sections.map(sec => (
              <li key={sec.id}>
                <a href={`#${sec.id}`} className="hover:text-white transition-colors">{sec.title}</a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Hero Section: Honeycomb Map */}
      <section className="relative z-10 min-h-[90vh] lg:min-h-screen flex flex-col items-center justify-center pt-12 lg:pt-20 pb-20 px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-10 lg:mb-16 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e3bd6f]/40 bg-white/80 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#c58452] shadow-sm mb-6">
            <Hexagon className="h-3.5 w-3.5 fill-current text-[#e3bd6f]" />
            G8 Yacht Villa &amp; Hotel • Embu
          </div>
          <h1 className="text-4xl xs:text-5xl sm:text-7xl lg:text-[7rem] font-black uppercase tracking-tighter text-[#10252b] leading-[0.95] mb-4 lg:mb-6">
            G8 Yatch <br className="hidden sm:block" />Villa
          </h1>
          <p className="mx-auto max-w-lg text-sm sm:text-lg font-bold text-[#10252b]/60 tracking-wider uppercase px-2">
            Engineered Presence. A pure work of art.
          </p>
        </div>

        {/* Honeycomb Cluster Map (Desktop & Engineered Mobile Grid) */}
        <div className="honeycomb w-full max-w-5xl mx-auto flex flex-wrap justify-center items-center">

          <a href="#rooms" className="honeycomb-cell cell-md group bg-white shadow-xl hover:bg-white hover:z-20 active:scale-95 transition-transform">
            <BedDouble className="mb-2 h-7 sm:h-8 w-7 sm:w-8 text-[#c58452] transition-transform duration-500 group-hover:scale-110" />
            <h2 className="cell-title !text-base sm:!text-lg !text-[#10252b]">Rooms</h2>
          </a>

          <a href="#gardens" className="honeycomb-cell cell-md group bg-white shadow-xl hover:bg-white hover:z-20 active:scale-95 transition-transform">
            <Tent className="mb-2 h-7 sm:h-8 w-7 sm:w-8 text-[#c58452] transition-transform duration-500 group-hover:scale-110" />
            <h2 className="cell-title !text-base sm:!text-lg !text-[#10252b]">Gardens</h2>
          </a>

          <a href="#hotel" className="honeycomb-cell cell-lg group bg-white shadow-2xl hover:bg-white hover:z-30 relative z-10 active:scale-95 transition-transform">
            <Utensils className="mb-3 sm:mb-4 h-9 sm:h-12 w-9 sm:w-12 text-[#c58452] transition-transform duration-500 group-hover:scale-110" />
            <h2 className="cell-title !text-xl sm:!text-3xl !text-[#10252b]">Hotel</h2>
          </a>

          <a href="#hall" className="honeycomb-cell cell-md group bg-white shadow-xl hover:bg-white hover:z-20 active:scale-95 transition-transform">
            <Users className="mb-2 h-7 sm:h-8 w-7 sm:w-8 text-[#c58452] transition-transform duration-500 group-hover:scale-110" />
            <h2 className="cell-title !text-base sm:!text-lg !text-[#10252b]">Hall</h2>
          </a>

          <a href="#gardens" className="honeycomb-cell cell-sm group bg-white shadow-lg hover:bg-white hover:z-20 active:scale-95 transition-transform">
            <h2 className="cell-title !text-xs sm:!text-sm !text-[#10252b]">Fun Area</h2>
          </a>

          <a href="#hall" className="honeycomb-cell cell-sm group bg-white shadow-lg hover:bg-white hover:z-20 active:scale-95 transition-transform">
            <h2 className="cell-title !text-xs sm:!text-sm !text-[#10252b]">Trainings</h2>
          </a>

        </div>

        <div className="mt-12 lg:absolute lg:bottom-10 lg:left-1/2 lg:-translate-x-1/2 text-[#c58452] opacity-70 flex flex-col items-center gap-2">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">Scroll to explore</span>
          <ArrowDown className="h-4 w-4 sm:h-5 sm:w-5 animate-bounce" />
        </div>
      </section>

      {/* Welcome Parallax Section */}
      <section className="relative z-10 min-h-[80dvh] lg:min-h-[150vh] w-full">
        <div className="sticky top-0 h-[80dvh] lg:h-screen w-full flex items-center justify-center overflow-hidden">
          <img
            src="/photos/g8_entrance_inspo.png"
            alt="Welcome to G8 Yatch Hotel Embu"
            className="absolute inset-0 h-full w-full object-cover filter brightness-[0.82]"
          />
          <div className="absolute inset-0 bg-[#fafafa]/20" />
          <h2 className="relative z-10 text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] font-black uppercase tracking-tighter text-white mix-blend-overlay text-center leading-none px-4">
            Welcome<br />To G8
          </h2>
        </div>
      </section>

      {/* Flowing Sections */}
      <div className="relative z-20 bg-[#fafafa]">
        {sections.map((sec, index) => (
          <section key={sec.id} id={sec.id} className="relative w-full py-8 lg:py-0 border-b border-gray-100 lg:border-none">
            
            {/* DESKTOP VIEW: Awwwards Sticky Side-by-Side Stacking */}
            <div className={`hidden lg:flex mx-auto max-w-7xl flex-row ${index % 2 !== 0 ? 'flex-row-reverse' : ''}`}>
              {/* Left Side: Sticky Text */}
              <div className="w-5/12 relative">
                <div className="sticky top-0 h-screen flex flex-col justify-center px-16 z-20 pointer-events-none">
                  <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#c58452]">
                    {sec.eyebrow}
                  </p>
                  <h3 className="mb-6 text-7xl font-black uppercase tracking-tighter text-[#10252b] leading-[0.9]">
                    {sec.title}
                  </h3>
                  <p className="max-w-md text-lg text-[#10252b]/60 font-medium leading-relaxed">
                    {sec.desc}
                  </p>
                </div>
              </div>

              {/* Right Side: Stacking Sticky Images */}
              <div className="w-7/12 relative">
                {sec.images.map((img, i) => (
                  <div
                    key={img + i}
                    className="sticky top-0 h-screen w-full flex items-center justify-center p-12"
                    style={{ paddingTop: `calc(3rem + ${i * 40}px)` }}
                  >
                    <div
                      onClick={() => openLightbox(sec.title, sec.images, i)}
                      className="relative w-full h-[85vh] rounded-[2rem] overflow-hidden shadow-2xl origin-bottom transition-transform duration-500 ease-out hover:scale-[1.02] cursor-pointer group"
                    >
                      <img
                        src={img}
                        alt={`${sec.title} ${i + 1}`}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                      <div className="absolute bottom-6 right-6 bg-black/60 backdrop-blur-md text-white rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Maximize2 className="h-3.5 w-3.5" /> Enlarge
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* MOBILE ENGINEEERED VIEW: Clean Sticky Header + Touch Carousel */}
            <div className="block lg:hidden w-full">
              {/* Mobile Sticky Section Header */}
              <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-xl border-y border-[#e3bd6f]/25 px-5 py-3 shadow-sm flex items-center justify-between">
                <div>
                  <span className="block text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#c58452]">
                    0{index + 1} / 0{sections.length} • {sec.eyebrow}
                  </span>
                  <h3 className="text-xl font-black uppercase tracking-tight text-[#10252b]">
                    {sec.title}
                  </h3>
                </div>
                <span className="rounded-full bg-[#e3bd6f]/15 px-2.5 py-1 text-[10px] font-bold text-[#c58452]">
                  {sec.images.length} Photos
                </span>
              </div>

              {/* Mobile Description */}
              <div className="px-5 pt-4 pb-2">
                <p className="text-xs font-medium leading-relaxed text-[#10252b]/70">
                  {sec.desc}
                </p>
              </div>

              {/* Mobile Touch Horizontal Gallery */}
              <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory hide-scrollbar px-5 py-4">
                {sec.images.map((img, i) => (
                  <div
                    key={img + i}
                    onClick={() => openLightbox(sec.title, sec.images, i)}
                    className="w-[82vw] max-w-[320px] shrink-0 h-[52vh] min-h-[340px] rounded-[1.75rem] snap-center relative shadow-xl overflow-hidden bg-gray-100 active:scale-[0.98] transition-transform"
                  >
                    <img
                      src={img}
                      alt={`${sec.title} ${i + 1}`}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                    
                    {/* Top counter tag */}
                    <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      Photo {i + 1} of {sec.images.length}
                    </div>

                    {/* Bottom CTA */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                      <span className="text-xs font-bold uppercase tracking-wider">{sec.title}</span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                        <Maximize2 className="h-3 w-3" /> View
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Touch Swipe Hint */}
              <div className="px-5 pb-6 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#c58452]/70">
                  Swipe horizontally to view all {sec.images.length} photos →
                </p>
              </div>
            </div>

          </section>
        ))}
      </div>

      {/* Lightbox Modal */}
      {activeLightbox && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200">
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white z-10">
            <div>
              <h4 className="font-extrabold text-sm uppercase tracking-wider">{activeLightbox.title}</h4>
              <p className="text-xs text-white/60">
                Image {activeLightbox.currentIndex + 1} of {activeLightbox.images.length}
              </p>
            </div>
            <button
              onClick={closeLightbox}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Main Image View */}
          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
            <img
              src={activeLightbox.images[activeLightbox.currentIndex]}
              alt={activeLightbox.title}
              className="max-h-full max-w-full object-contain rounded-xl shadow-2xl"
            />

            {/* Prev / Next controls */}
            {activeLightbox.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 sm:left-4 flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 sm:right-4 flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-white/20 transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Indicators */}
          <div className="flex justify-center gap-1.5 py-2">
            {activeLightbox.images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveLightbox(prev => ({ ...prev, currentIndex: idx }))}
                className={`h-2 rounded-full transition-all ${idx === activeLightbox.currentIndex ? 'w-8 bg-[#e3bd6f]' : 'w-2 bg-white/30'}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Contact Section */}
      <section id="contact" className="relative z-30 w-full bg-[#10252b] text-white py-20 sm:py-32 lg:py-48">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-6xl lg:text-[6rem] font-black uppercase tracking-tighter leading-none mb-6 sm:mb-8">
            Experience G8
          </h2>
          <p className="mb-10 sm:mb-16 text-base sm:text-xl text-white/60 font-medium max-w-2xl mx-auto leading-relaxed">
            Ready to visit? Our team is waiting to provide an unforgettable stay in Embu.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <a href="tel:+254700000000" className="w-full sm:w-auto inline-flex min-h-14 sm:min-h-16 items-center justify-center rounded-full bg-[#e3bd6f] text-[#10252b] px-8 sm:px-10 text-xs sm:text-sm font-extrabold uppercase tracking-widest hover:bg-white transition-colors shadow-lg active:scale-95">
              Call Reception
            </a>
            <Link to="/cabro-blocks" className="w-full sm:w-auto inline-flex min-h-14 sm:min-h-16 items-center justify-center rounded-full bg-transparent border border-white/30 text-white px-8 sm:px-10 text-xs sm:text-sm font-bold uppercase tracking-widest hover:bg-white/10 transition-colors active:scale-95">
              Metal Works &amp; Cabro
            </Link>
          </div>
        </div>
      </section>

      {/* Floating Mobile Dock */}
      <div className="fixed bottom-4 left-4 right-4 z-40 lg:hidden flex items-center justify-around bg-[#10252b]/95 text-white backdrop-blur-xl border border-[#e3bd6f]/30 py-2.5 px-3 rounded-full shadow-2xl">
        <a href="tel:+254700000000" className="flex flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#e3bd6f] active:scale-95">
          <Phone className="h-4 w-4" />
          <span>Call</span>
        </a>
        <Link to="/cabro-blocks" className="flex flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white hover:text-[#e3bd6f] active:scale-95">
          <Hexagon className="h-4 w-4" />
          <span>Cabro Works</span>
        </Link>
        <a href="https://www.google.com/maps/search/?api=1&query=G8+YATCH+VILLA+HOTEL" target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white hover:text-[#e3bd6f] active:scale-95">
          <MapPin className="h-4 w-4 text-[#c58452]" />
          <span>Directions</span>
        </a>
      </div>

    </main>
  )
}
