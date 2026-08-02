import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthProvider.jsx'
import { DarkModeProvider } from './context/DarkModeProvider.jsx'
import './index.css'
import App from './App.jsx'
import Maintenance from './pages/Maintenance.jsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const isMaintenance =
  import.meta.env.VITE_MAINTENANCE_MODE === "true";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <DarkModeProvider>
        <AuthProvider>
          {isMaintenance ? <Maintenance /> : <App />}
        </AuthProvider>
      </DarkModeProvider>
    </QueryClientProvider>
  </StrictMode>,
)