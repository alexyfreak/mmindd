import { useState, useRef, type ChangeEvent, useCallback } from 'react'
import { FileText, Image, FileCode, Link2, Loader2, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useNoteStore } from '../stores/noteStore'
import { useAuthStore } from '../stores/authStore'
import MarkdownEditorModal from './MarkdownEditorModal'

interface ExtractedData {
  title: string
  cover_image: string
  content: string
  text_content: string
  excerpt: string
  domain: string
  site_name: string
  tldr: string
  tags: string[]
}

const SUPABASE_EDGE_FUNCTION_URL = 'https://biyzfegpwepvzvwynhdj.supabase.co/functions/v1/extract-link'

export default function ComposeCard() {
  const addNote = useNoteStore((s) => s.addNote)
  const user = useAuthStore((s) => s.session?.user)
  const [mode, setMode] = useState<'closed' | 'select' | 'text' | 'image' | 'markdown' | 'link'>('closed')
  const [textContent, setTextContent] = useState('')
  const [mdContent, setMdContent] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const mdFileRef = useRef<HTMLInputElement>(null)

  const reset = useCallback(() => {
    setMode('closed')
    setTextContent('')
    setMdContent('')
    setLinkUrl('')
    setError('')
    setBusy(false)
  }, [])

  const submitText = async () => {
    if (!textContent.trim()) return
    setBusy(true)
    setError('')
    const title = textContent.split('\n')[0].slice(0, 80) || undefined
    const result = await addNote({ type: 'text', title, content: textContent.trim() })
    if (result) reset()
    else setError('Failed to save note')
    setBusy(false)
  }

  const submitMarkdown = async (markdown: string) => {
    if (!markdown.trim()) return
    setBusy(true)
    setError('')
    const title = markdown.split('\n')[0].replace(/^#+ /, '').slice(0, 80) || undefined
    const result = await addNote({ type: 'markdown', title, content: markdown })
    if (result) reset()
    else setError('Failed to save note')
    setBusy(false)
  }

  const extractLink = async () => {
    if (!linkUrl.trim()) return
    setBusy(true)
    setError('')

    try {
      const res = await fetch(SUPABASE_EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: linkUrl.trim() }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as { error?: string }).error || `Extraction failed (${res.status})`)
      }

      const data: ExtractedData = await res.json()

      const result = await addNote({
        type: 'article',
        title: data.title || undefined,
        content: data.text_content || data.excerpt || '',
        domain: data.domain,
        source_url: linkUrl.trim(),
        tags: data.tags,
        tldr: data.tldr,
        cover_image: data.cover_image,
      })

      if (result) reset()
      else setError('Failed to save note')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Extraction failed')
    }
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

  const handleLinkKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && linkUrl.trim()) {
      e.preventDefault()
      extractLink()
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
        <div className="flex gap-2" role="group" aria-label="Note type">
          <button
            onClick={() => setMode('text')}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-surface-hover hover:bg-border transition-colors flex-1"
          >
            <FileText size={20} className="text-accent" />
            <span className="text-[10px] text-text-dim">Text</span>
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-surface-hover hover:bg-border transition-colors flex-1"
          >
            <Image size={20} className="text-accent" />
            <span className="text-[10px] text-text-dim">Image</span>
          </button>
          <button
            onClick={() => {
              setMdContent('')
              setMode('markdown')
            }}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-surface-hover hover:bg-border transition-colors flex-1"
          >
            <FileCode size={20} className="text-accent" />
            <span className="text-[10px] text-text-dim">Markdown</span>
          </button>
          <button
            onClick={() => { setLinkUrl(''); setMode('link') }}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-surface-hover hover:bg-border transition-colors flex-1"
          >
            <Link2 size={20} className="text-accent" />
            <span className="text-[10px] text-text-dim">Link</span>
          </button>
          <button
            onClick={reset}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-surface-hover transition-colors"
          >
            <X size={20} className="text-muted" />
            <span className="text-[10px] text-text-dim">Cancel</span>
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

      {mode === 'link' && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Link2 size={16} className="text-accent shrink-0" />
            <span className="text-xs font-medium text-text-dim">Extract Article</span>
          </div>
          <div className="flex items-center gap-2 bg-[#0d0e14] border border-border rounded-xl px-3 py-2">
            <input
              autoFocus
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={handleLinkKeyDown}
              placeholder="Paste a URL and press Enter…"
              className="flex-1 bg-transparent text-sm text-text placeholder:text-muted outline-none"
            />
            {linkUrl.trim() && (
              <button
                onClick={() => setLinkUrl('')}
                className="text-muted hover:text-text shrink-0"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <button onClick={reset} className="text-xs text-muted hover:text-text transition-colors">
              Cancel
            </button>
            <button
              onClick={extractLink}
              disabled={busy || !linkUrl.trim()}
              className="px-4 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {busy ? (
                <><Loader2 size={14} className="animate-spin" /> Extracting…</>
              ) : (
                <><Link2 size={14} /> Extract</>
              )}
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

      {busy && mode !== 'link' && (
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
