import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import SiteFooter from './components/SiteFooter'
import SiteHeader from './components/SiteHeader'
import CabroBlocksPage from './pages/CabroBlocksPage'
import CorporatePage from './pages/CorporatePage'
import ExperiencesPage from './pages/ExperiencesPage'
import HomePage from './pages/HomePage'
import HotelPage from './pages/HotelPage'
import MenuPage from './pages/MenuPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#fafafa] text-[#10252b] selection:bg-[#e3bd6f] selection:text-white">
        <SiteHeader />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/hospitality" element={<Navigate to="/menu" replace />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/hotel" element={<HotelPage />} />
          <Route path="/experiences" element={<ExperiencesPage />} />
          <Route path="/corporate" element={<CorporatePage />} />
          <Route path="/cabro-blocks" element={<CabroBlocksPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <SiteFooter />
      </div>
    </BrowserRouter>
  )
}
