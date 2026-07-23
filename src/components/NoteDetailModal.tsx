import { X } from 'lucide-react'
import type { Note } from '../types'
import { supabase } from '../lib/supabase'
import { useEffect, useState } from 'react'
import MarkdownNoteCard from './MarkdownNoteCard'

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

        {note.type === 'markdown' && note.content && (
          <MarkdownNoteCard content={note.content} />
        )}

        <p className="text-xs text-muted mt-4 pt-4 border-t border-border">
          {new Date(note.created_at).toLocaleString()}
        </p>
      </div>
    </div>
  )
}
