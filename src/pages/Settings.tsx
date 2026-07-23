import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, Loader2, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useTheme } from '../components/ThemeProvider'
import { fetchAndParseTheme, applyTheme, resetTheme } from '../lib/themeParser'

const PRESETS = [
  { name: 'Tokyo Night', url: 'https://raw.githubusercontent.com/enkia/tokyo-night-vscode-theme/master/themes/tokyo-night-color-theme.json' },
  { name: 'Dracula', url: 'https://raw.githubusercontent.com/dracula/visual-studio-code/master/src/dracula.theme.json' },
  { name: 'Catppuccin Mocha', url: 'https://raw.githubusercontent.com/catppuccin/vscode/main/themes/mocha.json' },
  { name: 'One Dark Pro', url: 'https://raw.githubusercontent.com/zhuangtongfa/OneDark-Pro/master/themes/OneDark-Pro.json' },
]

export default function Settings() {
  const navigate = useNavigate()
  const { currentThemeUrl, setThemeUrl, applying, themeError } = useTheme()

  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [themeInput, setThemeInput] = useState('')
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [savingEmail, setSavingEmail] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [applyingCustom, setApplyingCustom] = useState(false)
  const [customError, setCustomError] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setEmail(user.email)
    })
  }, [])

  const updateEmail = async () => {
    setSavingEmail(true)
    setFeedback(null)
    const { error } = await supabase.auth.updateUser({ email })
    if (error) {
      setFeedback({ type: 'error', message: error.message })
    } else {
      setFeedback({ type: 'success', message: 'Confirmation email sent. Check your inbox.' })
    }
    setSavingEmail(false)
  }

  const updatePassword = async () => {
    if (newPassword.length < 6) {
      setFeedback({ type: 'error', message: 'Password must be at least 6 characters.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', message: 'Passwords do not match.' })
      return
    }
    setSavingPassword(true)
    setFeedback(null)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setFeedback({ type: 'error', message: error.message })
    } else {
      setFeedback({ type: 'success', message: 'Password updated successfully.' })
      setNewPassword('')
      setConfirmPassword('')
    }
    setSavingPassword(false)
  }

  const applyCustomUrl = async () => {
    if (!themeInput.trim()) return
    setApplyingCustom(true)
    setCustomError(null)
    try {
      const theme = await fetchAndParseTheme(themeInput.trim())
      applyTheme(theme)
      await setThemeUrl(themeInput.trim())
    } catch (err) {
      setCustomError(err instanceof Error ? err.message : 'Failed to apply theme')
      resetTheme()
      await setThemeUrl(null)
    }
    setApplyingCustom(false)
  }

  const applyPreset = async (url: string) => {
    setCustomError(null)
    try {
      const theme = await fetchAndParseTheme(url)
      applyTheme(theme)
      await setThemeUrl(url)
    } catch {
      setCustomError('Failed to apply preset theme')
      resetTheme()
      await setThemeUrl(null)
    }
  }

  const resetToDefault = async () => {
    resetTheme()
    setThemeInput('')
    setCustomError(null)
    await setThemeUrl(null)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-app)' }}>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 mb-8"
          style={{ color: 'var(--text-muted)' }}
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back to notes</span>
        </button>

        <h1 className="text-2xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>Settings</h1>

        {feedback && (
          <div
            className={`mb-6 px-4 py-3 rounded-xl flex items-center gap-2 text-sm ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}
          >
            {feedback.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
            {feedback.message}
          </div>
        )}

        <section className="mb-10 rounded-xl p-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-main)' }}>
          <h2 className="text-lg font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>Account & Security</h2>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Email</label>
              <div className="flex gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg text-sm outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-app)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-main)',
                  }}
                />
                <button
                  onClick={updateEmail}
                  disabled={savingEmail}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: 'var(--accent-color)', color: '#fff' }}
                >
                  {savingEmail ? <Loader2 size={16} className="animate-spin" /> : 'Update Email'}
                </button>
              </div>
            </div>

            <div className="border-t" style={{ borderColor: 'var(--border-main)' }} />

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--bg-app)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-main)',
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--bg-app)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-main)',
                }}
              />
            </div>
            <button
              onClick={updatePassword}
              disabled={savingPassword}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50"
              style={{ backgroundColor: 'var(--accent-color)', color: '#fff' }}
            >
              {savingPassword ? <Loader2 size={16} className="animate-spin" /> : 'Update Password'}
            </button>
          </div>
        </section>

        <section className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-main)' }}>
          <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Theme & Visual Customization</h2>
          <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
            Apply any VS Code theme JSON from a URL to customize the look and feel.
          </p>

          {(themeError || customError) && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-sm text-red-400">
              <AlertCircle size={16} />
              {themeError || customError}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
              Theme URL
            </label>
            <div className="flex gap-3">
              <input
                type="url"
                value={themeInput}
                onChange={(e) => setThemeInput(e.target.value)}
                placeholder="Enter raw VS Code Theme JSON URL..."
                className="flex-1 px-3 py-2 rounded-lg text-sm outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--bg-app)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-main)',
                }}
              />
              <button
                onClick={applyCustomUrl}
                disabled={applyingCustom || !themeInput.trim()}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50"
                style={{ backgroundColor: 'var(--accent-color)', color: '#fff' }}
              >
                {applyingCustom ? <Loader2 size={16} className="animate-spin" /> : 'Apply Theme'}
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-muted)' }}>
              Quick Presets
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset.url)}
                  disabled={applying}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                  style={{
                    backgroundColor: currentThemeUrl === preset.url ? 'var(--accent-color)' : 'var(--bg-app)',
                    color: currentThemeUrl === preset.url ? '#fff' : 'var(--text-primary)',
                    border: '1px solid var(--border-main)',
                  }}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={resetToDefault}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-main)',
            }}
          >
            Reset to Default
          </button>
        </section>
      </div>
    </div>
  )
}
