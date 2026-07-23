interface VSCodeTheme {
  colors?: Record<string, string>
  tokenColors?: Array<{
    scope?: string | string[]
    settings?: { foreground?: string }
  }>
}

export interface ParsedTheme {
  '--color-background': string
  '--color-surface': string
  '--color-surface-hover': string
  '--color-border': string
  '--color-muted': string
  '--color-text': string
  '--color-text-dim': string
  '--color-accent': string
  '--color-accent-hover': string
}

const DEFAULTS: ParsedTheme = {
  '--color-background': '#0d0e14',
  '--color-surface': '#15161e',
  '--color-surface-hover': '#1c1d27',
  '--color-border': '#23242e',
  '--color-muted': '#6b6d7b',
  '--color-text': '#e4e4e7',
  '--color-text-dim': '#a1a3b0',
  '--color-accent': '#6c63ff',
  '--color-accent-hover': '#5a52e0',
}

function darken(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, (num >> 16) - amount)
  const g = Math.max(0, ((num >> 8) & 0xff) - amount)
  const b = Math.max(0, (num & 0xff) - amount)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

function lighten(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, (num >> 16) + amount)
  const g = Math.min(255, ((num >> 8) & 0xff) + amount)
  const b = Math.min(255, (num & 0xff) + amount)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

function parseColor(raw: string | undefined, fallback: string): string {
  if (!raw) return fallback
  const m = raw.match(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/)
  if (m) return raw.length === 4 ? `#${raw[1]}${raw[1]}${raw[2]}${raw[2]}${raw[3]}${raw[3]}` : raw
  return fallback
}

export async function fetchAndParseTheme(url: string): Promise<ParsedTheme> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`fetch failed: ${res.status}`)

  const json: VSCodeTheme = await res.json()
  if (!json || typeof json !== 'object') throw new Error('invalid theme JSON')

  const c = json.colors || {}

  const bg = parseColor(c['editor.background'] || c['sideBar.background'], DEFAULTS['--color-background'])
  const card = parseColor(c['activityBar.background'] || c['sideBar.background'], DEFAULTS['--color-surface'])
  const border = parseColor(c['sideBar.border'] || c['editorGroup.border'], DEFAULTS['--color-border'])
  const text = parseColor(c['editor.foreground'], DEFAULTS['--color-text'])
  const muted = parseColor(c['descriptionForeground'] || c['tab.inactiveForeground'], DEFAULTS['--color-muted'])
  const accent = parseColor(
    c['button.background'] || c['focusBorder'] || c['activityBarBadge.background'],
    DEFAULTS['--color-accent']
  )

  const cardColor = card || lighten(bg, 8)
  const borderColor = border || lighten(bg, 15)
  const mutedColor = muted || lighten(text, -40)

  return {
    '--color-background': bg,
    '--color-surface': cardColor,
    '--color-surface-hover': lighten(cardColor, 6),
    '--color-border': borderColor,
    '--color-text': text,
    '--color-text-dim': lighten(text, -20),
    '--color-muted': mutedColor,
    '--color-accent': accent,
    '--color-accent-hover': darken(accent, 15),
  }
}

export function applyTheme(theme: ParsedTheme): void {
  const root = document.documentElement
  for (const [key, value] of Object.entries(theme)) {
    root.style.setProperty(key, value)
  }
}

export function resetTheme(): void {
  const root = document.documentElement
  for (const key of Object.keys(DEFAULTS)) {
    root.style.removeProperty(key)
  }
}

export { DEFAULTS }
