import { useState, useRef, type ChangeEvent, useCallback } from 'react'
import { FileText, Image, FileCode, Loader2, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useNoteStore } from '../stores/noteStore'
import { useAuthStore } from '../stores/authStore'
import MarkdownEditorModal from './MarkdownEditorModal'

export default function ComposeCard() {
  const addNote = useNoteStore((s) => s.addNote)
  const user = useAuthStore((s) => s.session?.user)
  const [mode, setMode] = useState<'closed' | 'select' | 'text' | 'image' | 'markdown'>('closed')
  const [textContent, setTextContent] = useState('')
  const [mdContent, setMdContent] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const mdFileRef = useRef<HTMLInputElement>(null)

  const reset = useCallback(() => {
    setMode('closed')
    setTextContent('')
    setMdContent('')
    setError('')
    setBusy(false)
  }, [])

  const submitText = async () => {
    if (!textContent.trim()) return
    setBusy(true)
    setError('')
    const title = textContent.split('\n')[0].slice(0, 80) || undefined
    const content = textContent.trim()
    const result = await addNote({ type: 'text', title, content })
    if (result) reset()
    else setError('Failed to save note')
    setBusy(false)
  }

  const submitMarkdown = async () => {
    if (!mdContent.trim()) return
    setBusy(true)
    setError('')
    const title = mdContent.split('\n')[0].replace(/^#+ /, '').slice(0, 80) || undefined
    const result = await addNote({ type: 'markdown', title, content: mdContent })
    if (result) reset()
    else setError('Failed to save note')
    setBusy(false)
  }

  const uploadFile = async (file: File, type: 'image' | 'markdown') => {
    if (!user) return
    setBusy(true)
    setError('')

    const filePath = `${user.id}/${Date.now()}-${file.name}`

    const { error: uploadError } = await supabase.storage
      .from('note-files')
      .upload(filePath, file)

    if (uploadError) {
      setError(uploadError.message)
      setBusy(false)
      return
    }

    let content: string | undefined
    let title: string | null | undefined

    if (type === 'markdown') {
      try {
        content = await file.text()
        title = file.name.replace(/\.md$/i, '') || undefined
      } catch {
        setError('Failed to read markdown file')
        setBusy(false)
        return
      }
    } else {
      title = file.name || undefined
    }

    const result = await addNote({ type, title, content, file_path: filePath })
    if (result) reset()
    else setError('Failed to save note')
    setBusy(false)
  }

  const handleImagePick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadFile(file, 'image')
  }

  const handleMarkdownPick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        const text = reader.result as string
        setMdContent(text)
        setMode('markdown')
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="break-inside-avoid mb-4 rounded-2xl bg-surface border border-border p-5">
      {mode === 'closed' && (
        <button
          onClick={() => setMode('select')}
          className="w-full text-left"
        >
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">
            New quick note
          </p>
          <p className="text-sm text-muted">Start typing here…</p>
        </button>
      )}

      {mode === 'select' && (
        <div className="flex gap-3" role="group" aria-label="Note type">
          <button
            onClick={() => setMode('text')}
            className="flex flex-col items-center gap-1.5 p-4 rounded-xl bg-surface-hover hover:bg-border transition-colors flex-1"
          >
            <FileText size={22} className="text-accent" />
            <span className="text-xs text-text-dim">Text</span>
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center gap-1.5 p-4 rounded-xl bg-surface-hover hover:bg-border transition-colors flex-1"
          >
            <Image size={22} className="text-accent" />
            <span className="text-xs text-text-dim">Image</span>
          </button>
          <button
            onClick={() => {
              setMdContent('')
              setMode('markdown')
            }}
            className="flex flex-col items-center gap-1.5 p-4 rounded-xl bg-surface-hover hover:bg-border transition-colors flex-1"
          >
            <FileCode size={22} className="text-accent" />
            <span className="text-xs text-text-dim">Markdown</span>
          </button>
          <button
            onClick={reset}
            className="flex flex-col items-center gap-1.5 p-4 rounded-xl hover:bg-surface-hover transition-colors"
          >
            <X size={22} className="text-muted" />
            <span className="text-xs text-text-dim">Cancel</span>
          </button>
        </div>
      )}

      {mode === 'text' && (
        <div>
          <textarea
            autoFocus
            placeholder="Write something…"
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            className="w-full bg-transparent text-sm text-text placeholder:text-muted resize-none outline-none min-h-[100px]"
          />
          <div className="flex items-center justify-between mt-2 pt-3 border-t border-border">
            <button onClick={reset} className="text-xs text-muted hover:text-text transition-colors">
              Cancel
            </button>
            <button
              onClick={submitText}
              disabled={busy || !textContent.trim()}
              className="px-4 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-medium transition-colors disabled:opacity-50"
            >
              {busy ? <Loader2 size={14} className="animate-spin" /> : 'Save'}
            </button>
          </div>
        </div>
      )}

      {mode === 'markdown' && (
        <MarkdownEditorModal
          initialContent={mdContent}
          onSave={submitMarkdown}
          onClose={reset}
        />
      )}

      {busy && (
        <div className="flex items-center gap-2 text-xs text-muted mt-2">
          <Loader2 size={14} className="animate-spin" />
          Uploading…
        </div>
      )}

      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImagePick}
      />
      <input
        ref={mdFileRef}
        type="file"
        accept=".md,text/markdown"
        className="hidden"
        onChange={handleMarkdownPick}
      />
    </div>
  )
}
