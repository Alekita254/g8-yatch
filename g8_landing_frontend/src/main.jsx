import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'
import { PlanProvider } from './context/PlanContext'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PlanProvider>
      <App />
    </PlanProvider>
  </StrictMode>,
)
