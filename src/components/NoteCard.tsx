import { Trash2 } from 'lucide-react'
import type { Note } from '../types'
import { useNoteStore } from '../stores/noteStore'
import { supabase } from '../lib/supabase'
import { useEffect, useState } from 'react'
import MarkdownNoteCard from './MarkdownNoteCard'

function TextNoteCard({ note, onSelect }: { note: Note; onSelect?: () => void }) {
  const deleteNote = useNoteStore((s) => s.deleteNote)

  return (
    <CardWrapper>
      <CardHeader title={note.title} />
      {note.content && (
        <p
          className="text-sm text-text-dim leading-relaxed cursor-pointer"
          onClick={onSelect}
        >
          {note.content.length > 300
            ? note.content.slice(0, 300) + '…'
            : note.content}
        </p>
      )}
      <CardFooter createdAt={note.created_at} onDelete={() => deleteNote(note.id)} />
    </CardWrapper>
  )
}

function ImageNoteCard({ note }: { note: Note }) {
  const [url, setUrl] = useState<string | null>(null)
  const deleteNote = useNoteStore((s) => s.deleteNote)

  useEffect(() => {
    if (note.file_path) {
      supabase.storage
        .from('note-files')
        .createSignedUrl(note.file_path, 3600)
        .then(({ data }) => {
          if (data) setUrl(data.signedUrl)
        })
    }
  }, [note.file_path])

  return (
    <CardWrapper>
      {note.title && <CardHeader title={note.title} />}
      {url ? (
        <img
          src={url}
          alt={note.title ?? 'Note image'}
          className="w-full rounded-lg object-cover max-h-96"
        />
      ) : (
        <div className="w-full h-40 rounded-lg bg-surface animate-pulse" />
      )}
      <CardFooter createdAt={note.created_at} onDelete={() => deleteNote(note.id)} />
    </CardWrapper>
  )
}

function MarkdownCard({ note, onSelect }: { note: Note; onSelect?: () => void }) {
  const deleteNote = useNoteStore((s) => s.deleteNote)

  return (
    <CardWrapper>
      <CardHeader title={note.title} />
      {note.content && (
        <div className="cursor-pointer" onClick={onSelect}>
          <MarkdownNoteCard content={note.content} preview />
        </div>
      )}
      <CardFooter createdAt={note.created_at} onDelete={() => deleteNote(note.id)} />
    </CardWrapper>
  )
}

function CardWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="break-inside-avoid mb-4 rounded-2xl bg-surface border border-border p-5 hover:border-border/60 transition-all hover:-translate-y-0.5">
      {children}
    </div>
  )
}

function CardHeader({ title }: { title?: string | null }) {
  return title ? (
    <h3 className="text-sm font-semibold text-text mb-2">{title}</h3>
  ) : null
}

function CardFooter({
  createdAt,
  onDelete,
}: {
  createdAt: string
  onDelete?: () => void
}) {
  return (
    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
      <span className="text-xs text-muted">
        {new Date(createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })}
      </span>
      {onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="text-muted hover:text-red-400 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  )
}

export { TextNoteCard, ImageNoteCard, MarkdownCard, CardWrapper }
