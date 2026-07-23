import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import LoginScreen from './components/LoginScreen'
import AppShell from './components/AppShell'
import Settings from './pages/Settings'
import ThemeProvider from './components/ThemeProvider'

function AuthenticatedApp() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<AppShell />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </ThemeProvider>
  )
}

export default function App() {
  const session = useAuthStore((s) => s.session)
  const loading = useAuthStore((s) => s.loading)
  const initialize = useAuthStore((s) => s.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <BrowserRouter>
      {session ? <AuthenticatedApp /> : <LoginScreen />}
    </BrowserRouter>
  )
}
