import { FileText, Image, FileCode, Layers, Globe } from 'lucide-react'
import type { FilterType } from '../types'

const tabs: { id: FilterType; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'All', icon: <Layers size={14} /> },
  { id: 'text', label: 'Text', icon: <FileText size={14} /> },
  { id: 'image', label: 'Images', icon: <Image size={14} /> },
  { id: 'markdown', label: 'Markdown', icon: <FileCode size={14} /> },
  { id: 'articles', label: 'Articles', icon: <Globe size={14} /> },
]

interface Props {
  active: FilterType
  onChange: (f: FilterType) => void
}

export default function FilterTabs({ active, onChange }: Props) {
  return (
    <div className="flex gap-2 px-4 sm:px-6 lg:px-8 pb-4">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            active === t.id
              ? 'bg-accent text-white'
              : 'bg-surface text-text-dim hover:text-text hover:bg-surface-hover'
          }`}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  )
}
