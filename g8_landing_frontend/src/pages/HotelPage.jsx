import { Hexagon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { siteImages } from '../data/siteImages'

const gallery = [
  {
    title: 'Multi Purpose Hall',
    desc: 'For grand events and structured meetings.',
    images: [
      '/photos/20260711_181503.jpg',
      '/photos/20260711_181506.jpg',
      '/photos/20260711_181521.jpg'
    ],
  },
  {
    title: 'The Grounds',
    desc: 'Lush green spaces for outdoor events and relaxation.',
    images: [
      '/photos/20260711_181652.jpg',
      '/photos/20260711_181700.jpg',
      '/photos/20260711_181729.jpg'
    ],
  },
  {
    title: 'Hidden Tables',
    desc: 'Perfectly spaced private areas to unwind in peace.',
    images: [
      '/photos/20260711_181316.jpg',
      '/photos/20260711_181331.jpg',
      '/photos/20260711_181344.jpg'
    ],
  },
  {
    title: 'The Bar',
    desc: 'Expertly curated drinks in a sophisticated setting.',
    images: [
      '/photos/20260711_181451.jpg',
      '/photos/20260711_181551.jpg',
      '/photos/20260711_181607.jpg'
    ],
  },
  {
    title: 'The Suites',
    desc: 'Luxurious comfort engineered for deep rest.',
    images: [
      '/photos/20260711_182023.jpg',
      '/photos/20260711_182153.jpg',
      '/photos/20260711_182202.jpg'
    ],
  },
  {
    title: 'Our Staff',
    desc: 'A dedicated team working like a hive to serve you.',
    images: [
      '/photos/20260711_182335.jpg',
      '/photos/20260711_182337.jpg',
      '/photos/20260711_182341.jpg'
    ],
  },
]

function HoneycombSlideshow({ images, altPrefix }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    // Awwwards style slow fade - cycle every 5 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [images.length])

  return (
    <>
      {images.map((img, idx) => (
        <img
          key={img}
          src={img}
          alt={`${altPrefix} view ${idx + 1}`}
          className={`absolute inset-0 h-full w-full object-cover transition-all duration-[2500ms] ease-in-out transform group-hover:scale-110 ${
            idx === currentIndex ? 'opacity-90 group-hover:opacity-100 z-0' : 'opacity-0 scale-105 z-[-1]'
          }`}
        />
      ))}
    </>
  )
}

export default function HotelPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fafafa] text-[#10252b] selection:bg-[#e3bd6f] selection:text-white">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 h-2 w-2 rounded-full bg-[#e3bd6f] blur-[1px] animate-float"></div>
        <div className="absolute top-1/3 right-1/4 h-3 w-3 rounded-full bg-[#c58452] blur-[2px] animate-float-delayed"></div>
        <div className="absolute bottom-1/4 left-1/3 h-1.5 w-1.5 rounded-full bg-[#fcebb6] blur-[1px] animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/3 right-1/3 h-2 w-2 rounded-full bg-[#e3bd6f] blur-[1px] animate-float-delayed" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-24 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e3bd6f]/50 bg-white px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#c58452] shadow-sm mb-8">
            <Hexagon className="h-4 w-4" />
            The Inner Hive
            <Hexagon className="h-4 w-4" />
          </div>
          <h1 className="text-5xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#c58452] via-[#d4a947] to-[#e3bd6f] sm:text-6xl lg:text-7xl mb-6 drop-shadow-sm">
            Explore the Hotel
          </h1>
          <p className="mx-auto max-w-2xl text-lg font-medium text-[#10252b]/70 tracking-wide">
            A seamless, supernatural flow mapping every corner of the G8 Hotel experience. 
            From expansive event grounds to our dedicated staff.
          </p>
        </div>

        {/* Honeycomb Gallery Flow */}
        <div className="honeycomb pb-32">
          {gallery.map((item, index) => (
            <div key={item.title} className="honeycomb-cell group !p-0 border border-[#e3bd6f]/30 bg-white shadow-xl hover:shadow-[#e3bd6f]/20 cursor-default">
              
              <HoneycombSlideshow images={item.images} altPrefix={item.title} />
              
              {/* Light Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent opacity-95 group-hover:opacity-85 transition-opacity duration-500 z-10 pointer-events-none" />
              
              {/* Hover Golden Glow */}
              <div className="absolute inset-0 bg-[#fcebb6]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 mix-blend-overlay pointer-events-none" />
              
              {/* Content */}
              <div className="relative z-20 flex h-full w-full flex-col justify-end p-6 pb-12 text-center transform group-hover:-translate-y-2 transition-transform duration-500 pointer-events-none">
                <h2 className="text-[#c58452] font-extrabold text-lg uppercase tracking-[0.15em] mb-2 drop-shadow-sm group-hover:text-[#d4a947]">
                  {item.title}
                </h2>
                <p className="text-[#10252b]/80 font-medium text-xs leading-relaxed max-w-[80%] mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                  {item.desc}
                </p>
              </div>

              {/* Decorative Hexagon */}
              <Hexagon className="absolute top-6 right-6 h-6 w-6 text-[#e3bd6f] opacity-0 group-hover:opacity-60 transition-opacity duration-500 z-20" />
            </div>
          ))}
          
          {/* A few decorative structural cells to complete the flow */}
          <div className="honeycomb-cell hidden sm:flex opacity-30 pointer-events-none !bg-white border border-[#e3bd6f]/20 shadow-sm">
            <Hexagon className="h-16 w-16 text-[#e3bd6f]" />
          </div>
          <div className="honeycomb-cell hidden lg:flex opacity-20 pointer-events-none !bg-white border border-[#e3bd6f]/20 shadow-sm">
            <Hexagon className="h-24 w-24 text-[#e3bd6f]" />
          </div>
        </div>

      </div>
    </main>
  )
}
