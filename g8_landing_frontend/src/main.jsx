import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'
import AppErrorBoundary from './components/AppErrorBoundary'
import { PlanProvider } from './context/PlanContext'
import { ThemeProvider } from './context/ThemeProvider'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppErrorBoundary>
      <ThemeProvider>
        <PlanProvider>
          <App />
        </PlanProvider>
      </ThemeProvider>
    </AppErrorBoundary>
  </StrictMode>,
)
