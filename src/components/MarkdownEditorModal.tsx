import { useState, useCallback, useRef, type ChangeEvent } from 'react'
import { X, FileCode, Loader2, Save } from 'lucide-react'
import SlashEditor from './SlashEditor'

interface Props {
  initialContent?: string
  onSave: (markdown: string) => Promise<void>
  onClose: () => void
}

export default function MarkdownEditorModal({ initialContent = '', onSave, onClose }: Props) {
  const [content, setContent] = useState(initialContent)
  const [busy, setBusy] = useState(false)
  const mdFileRef = useRef<HTMLInputElement>(null)

  const handleSave = useCallback(async () => {
    if (!content.trim()) return
    setBusy(true)
    await onSave(content)
    setBusy(false)
  }, [content, onSave])

  const handleImport = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setContent(reader.result as string)
    reader.readAsText(file)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex bg-background/95 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex-1 flex flex-col min-w-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 border-b border-border bg-background/90 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <FileCode size={18} className="text-accent shrink-0" />
            <span className="text-sm font-medium text-text">Markdown</span>
            <span className="text-[10px] text-muted hidden sm:inline">
              Use <kbd className="px-1 py-0.5 rounded bg-border text-muted font-mono text-[10px]">/</kbd> for commands
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => mdFileRef.current?.click()}
              className="text-xs text-muted hover:text-text transition-colors flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-surface"
            >
              <FileCode size={14} />
              Import .md
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-text hover:bg-surface transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <SlashEditor
            initialContent={content}
            onChange={setContent}
            placeholder="Type '/' for commands…"
            minHeight="calc(100vh - 160px)"
          />
        </div>

        <div className="sticky bottom-0 flex items-center justify-between px-6 py-3 border-t border-border bg-background/90 backdrop-blur-sm">
          <span className="text-[10px] text-muted">
            {content.length > 0 ? `${content.length} chars` : ''}
          </span>
          <button
            onClick={handleSave}
            disabled={busy || !content.trim()}
            className="px-5 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save
          </button>
        </div>
      </div>

      <input
        ref={mdFileRef}
        type="file"
        accept=".md,text/markdown"
        className="hidden"
        onChange={handleImport}
      />
    </div>
  )
}
