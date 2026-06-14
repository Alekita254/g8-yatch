import { Component } from 'react'

export default class AppErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('G8 landing page error', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-50 px-5 text-ink dark:bg-[#07171b] dark:text-white">
        <section className="w-full max-w-lg rounded-[2rem] border border-slate-200 bg-white p-7 text-center shadow-xl dark:border-white/10 dark:bg-[#10252b]">
          <p className="eyebrow text-lake">Something went wrong</p>
          <h1 className="mt-3 text-3xl font-extrabold">Your visit is still saved.</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Reload the page to continue from the latest saved visit and order.
          </p>
          <button type="button" onClick={() => window.location.reload()} className="touch-button mt-6 w-full bg-lake text-white">
            Reload my visit
          </button>
        </section>
      </main>
    )
  }
}
