import { Trash2, Globe } from 'lucide-react'
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

function ImageNoteCard({ note, onSelect }: { note: Note; onSelect?: () => void }) {
  const [url, setUrl] = useState<string | null>(null)
  const deleteNote = useNoteStore((s) => s.deleteNote)
  const [loadingUrl, setLoadingUrl] = useState(true)

  useEffect(() => {
    if (note.file_path) {
      supabase.storage
        .from('note-files')
        .createSignedUrl(note.file_path, 3600)
        .then(({ data }) => {
          if (data) setUrl(data.signedUrl)
          setLoadingUrl(false)
        })
    }
  }, [note.file_path])

  return (
    <CardWrapper>
      {note.title && <CardHeader title={note.title} />}
      {loadingUrl ? (
        <div className="w-full h-40 rounded-lg bg-surface animate-pulse cursor-pointer" onClick={onSelect} />
      ) : url ? (
        <img
          src={url}
          alt={note.title ?? 'Note image'}
          className="w-full rounded-lg object-cover max-h-96 cursor-pointer"
          onClick={onSelect}
        />
      ) : null}
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

function ArticleCard({ note, onSelect }: { note: Note; onSelect?: () => void }) {
  const deleteNote = useNoteStore((s) => s.deleteNote)
  const [imgError, setImgError] = useState(false)

  return (
    <CardWrapper>
      {note.cover_image && !imgError && (
        <img
          src={note.cover_image}
          alt=""
          onError={() => setImgError(true)}
          className="w-full h-36 object-cover rounded-lg mb-3 cursor-pointer"
          onClick={onSelect}
        />
      )}
      <div className="cursor-pointer" onClick={onSelect}>
        <div className="flex items-center gap-1.5 mb-1">
          <Globe size={11} className="text-muted" />
          <span className="text-[10px] text-muted truncate">{note.domain || 'web'}</span>
        </div>
        {note.title && <CardHeader title={note.title} />}
        {note.tldr && (
          <p className="text-xs text-text-dim leading-relaxed line-clamp-3">{note.tldr}</p>
        )}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {note.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[9px] text-muted bg-[#1a1a1e] px-1.5 py-0.5 rounded-md border border-[#2c2c34]">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
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

export { TextNoteCard, ImageNoteCard, MarkdownCard, ArticleCard, CardWrapper }
