import { X } from 'lucide-react'
import type { Note } from '../types'
import { supabase } from '../lib/supabase'
import { useEffect, useState } from 'react'
import MarkdownViewer from './MarkdownViewer'

interface Props {
  note: Note
  onClose: () => void
}

export default function NoteDetailModal({ note, onClose }: Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  useEffect(() => {
    if (note.type === 'image' && note.file_path) {
      supabase.storage
        .from('note-files')
        .createSignedUrl(note.file_path, 3600)
        .then(({ data }) => {
          if (data) setImageUrl(data.signedUrl)
        })
    }
  }, [note.type, note.file_path])

  if (note.type === 'markdown') {
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
            <div className="flex items-center gap-3 min-w-0">
              {note.title && (
                <h1 className="text-sm font-semibold text-text truncate">{note.title}</h1>
              )}
              <span className="text-xs text-muted shrink-0">
                {new Date(note.created_at).toLocaleString()}
              </span>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-text hover:bg-surface transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {note.content && <MarkdownViewer content={note.content} />}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-text transition-colors"
        >
          <X size={20} />
        </button>

        {note.title && (
          <h2 className="text-lg font-semibold text-text mb-4 pr-8">{note.title}</h2>
        )}

        {note.type === 'text' && (
          <p className="text-sm text-text-dim leading-relaxed whitespace-pre-wrap">{note.content}</p>
        )}

        {note.type === 'image' && imageUrl && (
          <img src={imageUrl} alt={note.title ?? ''} className="w-full rounded-xl" />
        )}

        <p className="text-xs text-muted mt-4 pt-4 border-t border-border">
          {new Date(note.created_at).toLocaleString()}
        </p>
      </div>
    </div>
  )
}
