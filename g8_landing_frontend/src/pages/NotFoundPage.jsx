import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <main className="page-shell flex min-h-[70vh] flex-col items-center justify-center text-center">
      <p className="eyebrow text-lake">404</p>
      <h1 className="mt-3 text-4xl font-extrabold text-ink dark:text-white">This path does not lead anywhere yet.</h1>
      <Link to="/" className="touch-button mt-7 bg-ink text-white"><ArrowLeft className="h-4 w-4" /> Back home</Link>
    </main>
  )
}
