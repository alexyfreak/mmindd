import { useEffect, useState, createContext, useContext, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { fetchAndParseTheme, applyTheme, resetTheme } from '../lib/themeParser'

interface ThemeContextValue {
  currentThemeUrl: string | null
  setThemeUrl: (url: string | null) => Promise<void>
  applying: boolean
  themeError: string | null
}

const ThemeContext = createContext<ThemeContextValue>({
  currentThemeUrl: null,
  setThemeUrl: async () => {},
  applying: false,
  themeError: null,
})

export const useTheme = () => useContext(ThemeContext)

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentThemeUrl, setCurrentThemeUrl] = useState<string | null>(null)
  const [applying, setApplying] = useState(false)
  const [themeError, setThemeError] = useState<string | null>(null)

  const loadAndApply = async (url: string) => {
    setApplying(true)
    setThemeError(null)
    try {
      const theme = await fetchAndParseTheme(url)
      applyTheme(theme)
      setCurrentThemeUrl(url)
      localStorage.setItem('theme_url', url)
    } catch (err) {
      setThemeError(err instanceof Error ? err.message : 'Failed to apply theme')
      resetTheme()
      setCurrentThemeUrl(null)
      localStorage.removeItem('theme_url')
    }
    setApplying(false)
  }

  const setThemeUrl = async (url: string | null) => {
    if (!url) {
      resetTheme()
      setCurrentThemeUrl(null)
      setThemeError(null)
      localStorage.removeItem('theme_url')
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.auth.updateUser({ data: { ...user.user_metadata, theme_url: null } })
      }
      return
    }

    await loadAndApply(url)

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.auth.updateUser({ data: { ...user.user_metadata, theme_url: url } })
    }
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      const savedUrl = user?.user_metadata?.theme_url || localStorage.getItem('theme_url')
      if (savedUrl) {
        loadAndApply(savedUrl)
      }
    })
  }, [])

  return (
    <ThemeContext.Provider value={{ currentThemeUrl, setThemeUrl, applying, themeError }}>
      {children}
    </ThemeContext.Provider>
  )
}
