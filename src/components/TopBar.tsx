import { Search } from 'lucide-react'

interface Props {
  value: string
  onChange: (v: string) => void
}

export default function TopBar({ value, onChange }: Props) {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-2">
      <div className="relative max-w-3xl">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Search my mind…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-11 pr-20 py-3 rounded-2xl bg-surface/60 backdrop-blur-sm border border-border text-text placeholder:text-muted outline-none focus:border-accent/50 transition-colors"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-md bg-border text-muted text-xs font-mono">
          {isMac ? '⌘K' : 'CTRL+K'}
        </kbd>
      </div>
    </div>
  )
}
