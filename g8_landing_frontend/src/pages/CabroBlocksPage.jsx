import { Calculator, CheckCircle2, Hexagon, Minus, Plus, ShieldCheck, Truck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { getCabroProducts, submitCabroOrder } from '../api/cabroService'
import BottomSheet from '../components/BottomSheet'
import { siteImages } from '../data/siteImages'

const money = (value) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(value)

export default function CabroBlocksPage() {
  const [products, setProducts] = useState([])
  const [selected, setSelected] = useState(null)
  const [length, setLength] = useState('')
  const [width, setWidth] = useState('')
  const [wastage, setWastage] = useState(5)
  const [orderOpen, setOrderOpen] = useState(false)
  const [status, setStatus] = useState('')
  const [customer, setCustomer] = useState({ name: '', phone: '', delivery_location: '' })

  useEffect(() => {
    getCabroProducts().then((items) => {
      setProducts(items)
      setSelected(items[0])
    })
  }, [])

  const calculation = useMemo(() => {
    const area = Number(length || 0) * Number(width || 0)
    const requiredArea = area * (1 + wastage / 100)
    return {
      area,
      requiredArea,
      packs: selected ? Math.ceil(requiredArea / selected.coveragePerPack) : 0,
      total: selected ? requiredArea * selected.pricePerSqm : 0,
    }
  }, [length, width, wastage, selected])

  const submit = async (event) => {
    event.preventDefault()
    setStatus('sending')
    try {
      const payload = {
        customer_name: customer.name,
        phone: customer.phone,
        delivery_location: customer.delivery_location,
        product_id: selected.id,
        required_area_sqm: Number(calculation.requiredArea.toFixed(1)),
        estimated_packs: calculation.packs,
        coverage_per_pack_sqm: selected.coveragePerPack,
        source: 'G8 landing page',
      }
      await submitCabroOrder(payload)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <main className="relative min-h-screen bg-[#fafafa] text-[#10252b] selection:bg-[#e3bd6f] selection:text-white">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 h-2 w-2 rounded-full bg-[#e3bd6f] blur-[1px] animate-float"></div>
        <div className="absolute top-1/3 right-1/4 h-3 w-3 rounded-full bg-[#c58452] blur-[2px] animate-float-delayed"></div>
      </div>

      <section className="relative min-h-[50svh] overflow-hidden lg:min-h-[58svh]">
        <img src={siteImages.cabroHero.src} alt="Interlocking cabro pavement blocks" className="absolute inset-0 h-full w-full object-cover filter grayscale opacity-20 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-[#fafafa]/50 lg:bg-gradient-to-r lg:from-white/95 lg:via-[#fafafa]/70 lg:to-transparent" />
        
        <div className="mx-auto max-w-7xl relative flex min-h-[50svh] items-end px-4 pb-12 pt-20 sm:px-6 lg:min-h-[58svh] lg:items-center lg:px-8">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#e3bd6f]/50 bg-white px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#c58452] shadow-sm mb-6">
              <Hexagon className="h-4 w-4" /> Works &amp; Cabro
            </p>
            <h1 className="text-4xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#c58452] via-[#d4a947] to-[#e3bd6f] sm:text-5xl lg:text-6xl drop-shadow-sm">
              Engineered Ground.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[#10252b]/70 font-medium">
              Interlocking pavement blocks built with the structural integrity of a hive. Strong foundations for compounds and commercial yards.
            </p>
            <a href="#calculator" className="touch-button mt-8 inline-flex bg-[#e3bd6f] text-white hover:bg-[#c58452] px-6 py-3 rounded-full font-bold transition-all"><Calculator className="mr-2 h-4 w-4" /> Calculate your project</a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c58452] mb-2">The Range</p>
          <h2 className="text-3xl font-extrabold text-[#10252b]">Choose your finish.</h2>
        </div>
        
        <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-8 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-3 lg:px-0 hide-scrollbar">
          {products.map((product) => (
            <article key={product.id} className={`min-w-[82vw] snap-center overflow-hidden rounded-2xl border transition-all duration-300 sm:min-w-[48vw] lg:min-w-0 ${selected?.id === product.id ? 'border-[#e3bd6f] bg-white scale-[1.02] shadow-xl' : 'border-[#e3bd6f]/20 bg-white shadow-sm hover:border-[#e3bd6f]/50'}`}>
              <div className="relative h-48 w-full">
                <img src={product.image} alt={product.name} className="absolute inset-0 h-full w-full object-cover filter grayscale contrast-125 opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent" />
              </div>
              <div className="p-6">
                <p className="text-xs font-bold uppercase tracking-wider text-[#c58452]">{product.finish}</p>
                <h3 className="mt-2 text-2xl font-extrabold text-[#10252b]">{product.name}</h3>
                <p className="mt-2 font-bold text-[#d4a947]">{money(product.pricePerSqm)} / m²</p>
                <p className="mt-1 text-sm text-[#10252b]/60">{product.colors.join(' · ')}</p>
                <button type="button" onClick={() => setSelected(product)} className={`mt-6 w-full rounded-full py-3 text-sm font-bold transition-all ${selected?.id === product.id ? 'bg-[#e3bd6f] text-white' : 'bg-slate-100 text-[#10252b] hover:bg-slate-200'}`}>
                  {selected?.id === product.id ? 'Selected for Calculator' : 'Use in calculator'}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="calculator" className="border-t border-[#e3bd6f]/30 bg-white py-16 sm:py-24 relative">
        <div className="absolute top-0 right-0 h-64 w-64 opacity-10 bg-[radial-gradient(circle_at_top_right,_#e3bd6f,_transparent)] pointer-events-none" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start relative z-10">
          <div>
             <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c58452] mb-2">Estimate</p>
             <h2 className="text-3xl font-extrabold text-[#10252b]">Calculate your space.</h2>
             <p className="mt-4 text-[#10252b]/70 leading-relaxed max-w-md">Measure the longest length and width of the area. We include a customizable wastage allowance to ensure every cut and edge is covered, building a perfect hive pattern.</p>
          </div>
          <div className="rounded-2xl border border-[#e3bd6f]/30 bg-[#fafafa] p-6 shadow-xl sm:p-8">
            <div className="grid grid-cols-2 gap-4">
              <NumberField label="Length (metres)" value={length} onChange={(event) => setLength(event.target.value)} />
              <NumberField label="Width (metres)" value={width} onChange={(event) => setWidth(event.target.value)} />
            </div>
            <div className="mt-6 flex items-center justify-between rounded-xl bg-white p-4 border border-[#e3bd6f]/20 shadow-sm">
              <div><p className="text-sm font-bold text-[#10252b]">Wastage allowance</p><p className="text-xs text-[#c58452]">Recommended: 5%</p></div>
              <div className="flex items-center rounded-full bg-slate-50 border border-[#e3bd6f]/20">
                <button type="button" onClick={() => setWastage(Math.max(0, wastage - 1))} className="flex h-11 w-11 items-center justify-center text-[#10252b]/70 hover:text-[#c58452]"><Minus className="h-4 w-4" /></button>
                <span className="w-12 text-center font-bold text-[#c58452]">{wastage}%</span>
                <button type="button" onClick={() => setWastage(Math.min(15, wastage + 1))} className="flex h-11 w-11 items-center justify-center text-[#10252b]/70 hover:text-[#c58452]"><Plus className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="mt-6 rounded-xl bg-white p-6 border border-[#e3bd6f]/30 shadow-md relative overflow-hidden">
              <Hexagon className="absolute -right-4 -top-4 h-24 w-24 text-[#e3bd6f]/10" />
              <p className="text-sm text-[#c58452] font-bold uppercase tracking-wider">{selected?.name || 'Select a product'}</p>
              <div className="mt-4 grid grid-cols-2 gap-6 relative z-10">
                <div><p className="text-3xl font-extrabold text-[#10252b]">{calculation.requiredArea.toFixed(1)} <span className="text-lg text-[#10252b]/50">m²</span></p><p className="text-xs text-[#10252b]/50 mt-1 uppercase tracking-wider">Incl. wastage</p></div>
                <div><p className="text-3xl font-extrabold text-[#10252b]">{calculation.packs}</p><p className="text-xs text-[#10252b]/50 mt-1 uppercase tracking-wider">Packs</p></div>
              </div>
              <div className="mt-6 border-t border-[#e3bd6f]/20 pt-5 relative z-10">
                <p className="text-xs uppercase tracking-[0.15em] text-[#c58452]">Estimated Material Cost</p>
                <p className="mt-2 text-4xl font-black text-[#d4a947]">{money(calculation.total)}</p>
              </div>
            </div>
            <button type="button" disabled={!calculation.area} onClick={() => setOrderOpen(true)} className="mt-6 w-full rounded-full bg-gradient-to-r from-[#e3bd6f] to-[#c58452] py-4 text-sm font-black text-white uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:scale-[1.01]">Order now</button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 border-t border-[#e3bd6f]/20">
        <div className="grid gap-6 sm:grid-cols-3">
          {[['Engineered Strength', ShieldCheck], ['Strategic Delivery', Truck], ['Precision Measurement', Calculator]].map(([label, Icon]) => (
            <div key={label} className="flex flex-col items-center gap-4 text-center p-6 rounded-2xl border border-[#e3bd6f]/20 bg-white shadow-sm hover:shadow-md transition-all">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e3bd6f]/10 text-[#c58452]">
                <Icon className="h-8 w-8" />
              </span>
              <p className="font-bold text-[#10252b] uppercase tracking-wider text-sm">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <BottomSheet open={orderOpen} onClose={() => { setOrderOpen(false); setStatus('') }} title="Order Cabro Blocks">
        {status === 'success' ? (
          <div className="py-12 text-center">
            <CheckCircle2 className="mx-auto h-16 w-16 text-[#c58452]" />
            <h3 className="mt-6 text-2xl font-extrabold text-[#10252b]">Order Received</h3>
            <p className="mt-2 text-[#10252b]/70">Our team will confirm stock, delivery, and pricing.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <div className="rounded-xl border border-[#e3bd6f]/30 bg-white p-5 shadow-sm">
              <p className="font-bold text-[#c58452] uppercase tracking-wider text-sm">{selected?.name}</p>
              <p className="mt-2 text-sm text-[#10252b]/80 font-medium">{calculation.requiredArea.toFixed(1)} m² · {calculation.packs} packs · {money(calculation.total)}</p>
            </div>
            <Field label="Your name" value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} required />
            <Field label="Phone number" type="tel" value={customer.phone} onChange={(event) => setCustomer({ ...customer, phone: event.target.value })} required />
            <Field label="Delivery location" value={customer.delivery_location} onChange={(event) => setCustomer({ ...customer, delivery_location: event.target.value })} placeholder="Town, estate or site name" required />
            {status === 'error' && <p className="text-sm font-bold text-red-600">Could not send the order. Please try again.</p>}
            <button disabled={status === 'sending'} className="mt-4 w-full rounded-full bg-[#e3bd6f] py-4 text-sm font-black text-white uppercase tracking-wider transition-all shadow-md disabled:opacity-50">{status === 'sending' ? 'Sending...' : 'Submit Order'}</button>
          </form>
        )}
      </BottomSheet>
    </main>
  )
}

function NumberField({ label, ...props }) {
  return (
    <label className="block text-sm font-bold text-[#10252b]/80 uppercase tracking-wider">
      {label}
      <input {...props} type="number" min="0" step="0.1" inputMode="decimal" className="mt-2 min-h-12 w-full rounded-xl border border-[#e3bd6f]/50 bg-white px-4 text-lg font-bold text-[#10252b] outline-none focus:border-[#c58452] focus:ring-1 focus:ring-[#c58452] transition-colors" />
    </label>
  )
}

function Field({ label, ...props }) {
  return (
    <label className="block text-sm font-bold text-[#10252b]/80 uppercase tracking-wider">
      {label}
      <input {...props} className="mt-2 min-h-12 w-full rounded-xl border border-[#e3bd6f]/50 bg-white px-4 font-normal text-[#10252b] outline-none focus:border-[#c58452] focus:ring-1 focus:ring-[#c58452] transition-colors placeholder:text-[#10252b]/30" />
    </label>
  )
}
