import { BrowserRouter, Route, Routes } from 'react-router-dom'

import SiteHeader from './components/SiteHeader'
import CabroBlocksPage from './pages/CabroBlocksPage'
import CorporatePage from './pages/CorporatePage'
import HomePage from './pages/HomePage'
import HospitalityPage from './pages/HospitalityPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-stone-50 text-slate-950">
        <SiteHeader />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/hospitality" element={<HospitalityPage />} />
          <Route path="/corporate" element={<CorporatePage />} />
          <Route path="/cabro-blocks" element={<CabroBlocksPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
