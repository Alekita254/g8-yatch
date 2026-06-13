import { ArrowRight, Minus, Plus, ShoppingBag } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { getMenu } from '../api/hospitalityService'
import SectionHeading from '../components/SectionHeading'
import { usePlan } from '../context/planContext'

const categories = ['Starters', 'Mains', 'Drinks']
const money = (value) => new Intl.NumberFormat('en-KE', {
  style: 'currency',
  currency: 'KES',
  maximumFractionDigits: 0,
}).format(value)

export default function MenuPage() {
  const [menu, setMenu] = useState([])
  const [category, setCategory] = useState('Starters')
  const [loadError, setLoadError] = useState('')
  const { changeFoodQuantity, foodCount, foodItems, foodTotal } = usePlan()

  useEffect(() => {
    getMenu().then(setMenu).catch(() => setLoadError('The menu could not be loaded. Please refresh and try again.'))
  }, [])

  const visibleMenu = menu.filter((item) => item.category === category)

  return (
    <main>
      <section className="relative min-h-[72svh] overflow-hidden bg-ink text-white lg:min-h-[calc(100svh-5rem)]">
        <img
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=2200&q=90"
          alt="Fresh food served at G8 Yatch"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/10 lg:bg-gradient-to-r lg:from-ink/95 lg:via-ink/45 lg:to-transparent" />
        <div className="page-shell relative flex min-h-[72svh] items-end pb-12 pt-24 lg:min-h-[calc(100svh-5rem)] lg:items-center lg:pb-20">
          <div className="max-w-3xl">
            <p className="eyebrow text-sun">Food Menu</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-6xl lg:text-7xl">Start with something delicious.</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/75 sm:text-lg">
              Browse the G8 kitchen menu, add your favourites and review everything in your visit plan.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-sand/65 py-12 sm:py-16">
        <div className="page-shell">
          <SectionHeading
            eyebrow="Order from your table"
            title="Fresh food, a few taps away."
            text="Choose a category and build your order. Seating details and waiter alerts are handled in My G8 Plan."
          />
          <div className="sticky top-16 z-20 -mx-4 mt-8 border-y border-stone-200 bg-stone-50/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 md:top-20 lg:mx-0 lg:rounded-full lg:border">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`min-h-11 shrink-0 rounded-full px-5 text-sm font-bold ${category === item ? 'bg-lake text-white' : 'bg-white text-slate-600'}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-7 lg:grid-cols-[1fr_320px] lg:items-start">
            <div className="grid gap-5 md:grid-cols-2">
              {visibleMenu.map((item) => {
                const quantity = foodItems.find((entry) => entry.id === item.id)?.quantity || 0
                return (
                  <article key={item.id} className="overflow-hidden rounded-[1.5rem] bg-white shadow-sm">
                    <div className="relative">
                      <img src={item.image} alt={item.name} className="h-52 w-full object-cover" loading="lazy" />
                      <p className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1.5 text-sm font-extrabold text-lake shadow-sm">{money(item.price)}</p>
                    </div>
                    <div className="flex min-h-44 flex-col p-4">
                      <h2 className="font-extrabold text-ink">{item.name}</h2>
                      <p className="mt-1 text-sm leading-5 text-slate-500">{item.description}</p>
                      <div className="mt-auto pt-4">
                        {quantity ? (
                          <div className="flex items-center justify-between rounded-full bg-ink text-white">
                            <button type="button" onClick={() => changeFoodQuantity(item, -1)} className="flex h-12 w-12 items-center justify-center" aria-label={`Remove one ${item.name}`}>
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="text-sm font-bold">{quantity} in order</span>
                            <button type="button" onClick={() => changeFoodQuantity(item, 1)} className="flex h-12 w-12 items-center justify-center" aria-label={`Add one ${item.name}`}>
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => changeFoodQuantity(item, 1)} className="touch-button w-full bg-lake text-white" aria-label={`Add ${item.name}`}>
                            <Plus className="h-5 w-5" /> Add to order
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>

            <OrderSummary
              foodCount={foodCount}
              foodItems={foodItems}
              foodTotal={foodTotal}
              changeFoodQuantity={changeFoodQuantity}
            />
          </div>
          {loadError && <p className="mt-6 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{loadError}</p>}
        </div>
      </section>
    </main>
  )
}

function OrderSummary({ foodCount, foodItems, foodTotal, changeFoodQuantity }) {
  return (
    <aside className="order-last rounded-[1.75rem] bg-ink p-5 text-white lg:sticky lg:top-28">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="eyebrow text-sun">Your order</p>
          <h2 className="mt-2 text-2xl font-extrabold">{foodCount || 'No'} item{foodCount === 1 ? '' : 's'}</h2>
        </div>
        <ShoppingBag className="h-7 w-7 text-sun" />
      </div>
      {foodItems.length ? (
        <>
          <div className="mt-5 space-y-3">
            {foodItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 border-b border-white/10 pb-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{item.name}</p>
                  <p className="mt-1 text-xs text-white/55">{item.quantity} × {money(item.price)}</p>
                </div>
                <button type="button" onClick={() => changeFoodQuantity(item, -1)} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10" aria-label={`Remove one ${item.name}`}>
                  <Minus className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between">
            <span className="text-sm text-white/60">Order total</span>
            <strong className="text-xl text-sun">{money(foodTotal)}</strong>
          </div>
          <Link to="/plan" className="touch-button mt-5 w-full bg-sun text-ink">
            Review your order <ArrowRight className="h-4 w-4" />
          </Link>
        </>
      ) : (
        <p className="mt-5 text-sm leading-6 text-white/60">Items you choose will appear here. This summary stays visible without covering the menu.</p>
      )}
    </aside>
  )
}
