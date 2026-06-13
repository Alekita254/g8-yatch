import { Calculator, CheckCircle2, Minus, Plus, ShieldCheck, Truck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { getCabroProducts, submitCabroOrder } from '../api/cabroService'
import BottomSheet from '../components/BottomSheet'
import SectionHeading from '../components/SectionHeading'

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
        table_name: customer.delivery_location,
        subtotal: calculation.total,
        tax_total: 0,
        discount_total: 0,
        grand_total: calculation.total,
        notes: `Cabro enquiry: ${calculation.requiredArea.toFixed(1)} sqm, ${calculation.packs} packs. Phone: ${customer.phone}`,
        items: [{ product: selected.id, quantity: calculation.packs, unit_price: selected.pricePerSqm, tax_total: 0, discount_total: 0, line_total: calculation.total }],
      }
      await submitCabroOrder(payload)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <main>
      <section className="relative min-h-[560px] overflow-hidden bg-[#242b2c] text-white lg:min-h-[700px]">
        <img src="/images/cabro-standard-60mm.png" alt="Common Kenyan interlocking cabro pavement blocks" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#242b2c] via-[#242b2c]/70 to-[#242b2c]/15 lg:bg-gradient-to-r lg:from-[#242b2c] lg:via-[#242b2c]/65 lg:to-transparent" />
        <div className="page-shell relative flex min-h-[560px] items-end pb-12 pt-24 lg:min-h-[700px] lg:items-center lg:pb-20">
          <div className="max-w-2xl">
            <p className="eyebrow text-copper">Construction Materials</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-6xl">Strong ground starts with the right block.</h1>
            <p className="mt-5 max-w-xl leading-7 text-white/70">The familiar Kenyan interlocking pavement blocks for walkways, compounds, parking spaces and commercial yards.</p>
            <a href="#calculator" className="touch-button mt-7 bg-copper text-white"><Calculator className="h-4 w-4" /> Calculate your project</a>
          </div>
        </div>
      </section>

      <section className="page-shell py-14 sm:py-20">
        <SectionHeading eyebrow="The range" title="Choose for your traffic and finish." text="Swipe to compare. Prices shown are guide prices per square metre before delivery." />
        <div className="-mx-4 mt-8 flex snap-x gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-3 lg:px-0 hide-scrollbar">
          {products.map((product) => (
            <article key={product.id} className={`min-w-[82vw] snap-center overflow-hidden rounded-[1.75rem] border-2 bg-white sm:min-w-[48vw] lg:min-w-0 ${selected?.id === product.id ? 'border-copper' : 'border-transparent'}`}>
              <img src={product.image} alt={product.name} className="h-48 w-full object-cover" />
              <div className="p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-copper">{product.finish}</p>
                <h3 className="mt-2 text-xl font-extrabold text-ink">{product.name}</h3>
                <p className="mt-3 font-bold text-lake">{money(product.pricePerSqm)} / m²</p>
                <p className="mt-2 text-sm text-slate-500">{product.colors.join(' · ')}</p>
                <button type="button" onClick={() => setSelected(product)} className={`touch-button mt-5 w-full ${selected?.id === product.id ? 'bg-copper text-white' : 'bg-slate-100 text-ink'}`}>{selected?.id === product.id ? 'Selected' : 'Use in calculator'}</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="calculator" className="bg-sand py-14 sm:py-20">
        <div className="page-shell grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-start">
          <SectionHeading eyebrow="Square-metre calculator" title="Estimate what your space needs." text="Measure the longest length and width of the area. We include a small wastage allowance for cuts and edges." />
          <div className="rounded-[2rem] bg-white p-5 shadow-xl shadow-ink/5 sm:p-7">
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="Length metres" value={length} onChange={(event) => setLength(event.target.value)} />
              <NumberField label="Width metres" value={width} onChange={(event) => setWidth(event.target.value)} />
            </div>
            <div className="mt-5 flex items-center justify-between rounded-2xl bg-slate-100 p-3">
              <div><p className="text-sm font-bold text-ink">Wastage allowance</p><p className="text-xs text-slate-500">Recommended: 5%</p></div>
              <div className="flex items-center rounded-full bg-white">
                <button type="button" onClick={() => setWastage(Math.max(0, wastage - 1))} className="flex h-11 w-11 items-center justify-center"><Minus className="h-4 w-4" /></button>
                <span className="w-10 text-center font-bold">{wastage}%</span>
                <button type="button" onClick={() => setWastage(Math.min(15, wastage + 1))} className="flex h-11 w-11 items-center justify-center"><Plus className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="mt-5 rounded-2xl bg-ink p-5 text-white">
              <p className="text-sm text-white/55">{selected?.name || 'Select a product'}</p>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div><p className="text-2xl font-extrabold">{calculation.requiredArea.toFixed(1)} m²</p><p className="text-xs text-white/50">Including wastage</p></div>
                <div><p className="text-2xl font-extrabold">{calculation.packs}</p><p className="text-xs text-white/50">Estimated packs</p></div>
              </div>
              <div className="mt-5 border-t border-white/10 pt-4"><p className="text-xs uppercase tracking-wider text-white/50">Material estimate</p><p className="mt-1 text-2xl font-extrabold text-sun">{money(calculation.total)}</p></div>
            </div>
            <button type="button" disabled={!calculation.area} onClick={() => setOrderOpen(true)} className="touch-button mt-5 w-full bg-copper text-white disabled:cursor-not-allowed disabled:opacity-40">Order now</button>
          </div>
        </div>
      </section>

      <section className="page-shell grid gap-4 py-14 sm:grid-cols-3 sm:py-20">
        {[['Manufactured for strength', ShieldCheck], ['Delivery planning', Truck], ['Measured before dispatch', Calculator]].map(([label, Icon]) => (
          <div key={label} className="flex items-center gap-4 rounded-2xl border border-slate-200 p-5"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-sand text-copper"><Icon className="h-5 w-5" /></span><p className="font-bold text-ink">{label}</p></div>
        ))}
      </section>

      <BottomSheet open={orderOpen} onClose={() => { setOrderOpen(false); setStatus('') }} title="Order cabro blocks">
        {status === 'success' ? (
          <div className="py-8 text-center"><CheckCircle2 className="mx-auto h-12 w-12 text-lake" /><h3 className="mt-4 text-xl font-extrabold text-ink">Order request received</h3><p className="mt-2 text-slate-600">Our sales team will confirm stock, delivery and final pricing.</p></div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="rounded-2xl bg-sand p-4"><p className="font-bold text-ink">{selected?.name}</p><p className="mt-1 text-sm text-slate-600">{calculation.requiredArea.toFixed(1)} m² · {calculation.packs} packs · {money(calculation.total)}</p></div>
            <Field label="Your name" value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} required />
            <Field label="Phone number" type="tel" value={customer.phone} onChange={(event) => setCustomer({ ...customer, phone: event.target.value })} required />
            <Field label="Delivery location" value={customer.delivery_location} onChange={(event) => setCustomer({ ...customer, delivery_location: event.target.value })} placeholder="Town, estate or site name" required />
            {status === 'error' && <p className="text-sm font-bold text-red-600">Could not send the order. Please try again.</p>}
            <button disabled={status === 'sending'} className="touch-button w-full bg-copper text-white disabled:opacity-60">{status === 'sending' ? 'Sending...' : 'Submit order request'}</button>
          </form>
        )}
      </BottomSheet>
    </main>
  )
}

function NumberField({ label, ...props }) {
  return <label className="block text-sm font-bold text-ink">{label}<input {...props} type="number" min="0" step="0.1" inputMode="decimal" className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 px-3 text-lg font-bold outline-none focus:border-copper" /></label>
}

function Field({ label, ...props }) {
  return <label className="block text-sm font-bold text-ink">{label}<input {...props} className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 px-3 font-normal outline-none focus:border-copper" /></label>
}
