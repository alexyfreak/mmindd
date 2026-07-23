import { useEffect } from 'react'
import { useAuthStore } from './stores/authStore'
import LoginScreen from './components/LoginScreen'
import AppShell from './components/AppShell'

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

  return session ? <AppShell /> : <LoginScreen />
}
