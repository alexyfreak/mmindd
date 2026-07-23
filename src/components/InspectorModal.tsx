import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Star, Share2, Trash2, Plus, Hash } from 'lucide-react'
import type { Note } from '../types'
import { useNoteStore } from '../stores/noteStore'
import { supabase } from '../lib/supabase'
import MarkdownViewer from './MarkdownViewer'

interface Props {
  note: Note
  onClose: () => void
  onTagClick?: (tag: string) => void
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  return `${days} days ago`
}

function domainFromUrl(url?: string | null): string | null {
  if (!url) return null
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return null
  }
}

export default function InspectorModal({ note, onClose, onTagClick }: Props) {
  const { deleteNote, updateNote } = useNoteStore()
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [tags, setTags] = useState<string[]>(note.tags ?? [])
  const [tagInput, setTagInput] = useState('')
  const [showTagInput, setShowTagInput] = useState(false)
  const [tldr] = useState(note.tldr ?? null)
  const [mindNote, setMindNote] = useState('')
  const tagInputRef = useRef<HTMLInputElement>(null)
  const domain = note.domain ?? domainFromUrl(note.source_url)

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

  useEffect(() => {
    if (showTagInput) tagInputRef.current?.focus()
  }, [showTagInput])

  const addTag = useCallback(async (label: string) => {
    const trimmed = label.trim()
    if (!trimmed || tags.includes(trimmed)) return
    const next = [...tags, trimmed]
    setTags(next)
    await updateNote(note.id, { tags: next })
  }, [tags, note.id, updateNote])

  const removeTag = useCallback(async (label: string) => {
    const next = tags.filter((t) => t !== label)
    setTags(next)
    await updateNote(note.id, { tags: next })
  }, [tags, note.id, updateNote])

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(tagInput)
      setTagInput('')
    }
    if (e.key === 'Escape') {
      setShowTagInput(false)
      setTagInput('')
    }
  }

  const handleDelete = async () => {
    await deleteNote(note.id)
    onClose()
  }

  const handleTagPillClick = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation()
    onTagClick?.(tag)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex-1 flex flex-col min-w-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 border-b border-[#26262b] bg-[#0f0f11]/90 backdrop-blur-sm">
          <div className="flex items-center gap-3 min-w-0">
            {note.title && (
              <h1 className="text-sm font-semibold text-[#e4e4e7] truncate">{note.title}</h1>
            )}
            {domain && (
              <span className="text-[10px] text-[#6b6d7b] bg-[#1a1a1e] px-2 py-0.5 rounded-md border border-[#2d2d35] shrink-0">
                {domain}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-[#6b6d7b] hover:text-[#e4e4e7] hover:bg-[#1a1a1e] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-[#0f0f11]">
          {note.type === 'image' && imageUrl && (
            <div className="flex items-center justify-center p-6">
              <img
                src={imageUrl}
                alt={note.title ?? ''}
                className="max-w-full max-h-[80vh] rounded-xl object-contain"
              />
            </div>
          )}
          {note.type === 'text' && (
            <div className="p-6">
              <p className="text-sm text-[#a1a3b0] leading-relaxed whitespace-pre-wrap">{note.content}</p>
            </div>
          )}
          {note.type === 'markdown' && note.content && (
            <div className="p-6 max-w-4xl">
              <MarkdownViewer content={note.content} />
            </div>
          )}
        </div>
      </div>

      <div className="w-80 md:w-96 bg-[#141417] border-l border-[#26262b] flex flex-col overflow-y-auto shrink-0" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 space-y-5">
          <div>
            <p className="text-xs text-[#6b6d7b] mb-1">{relativeTime(note.created_at)}</p>
            {note.title && (
              <h2 className="text-sm font-semibold text-[#e4e4e7]">{note.title}</h2>
            )}
            {domain && (
              <span className="inline-block mt-2 text-[10px] text-[#6b6d7b] bg-[#1a1a1e] px-2 py-0.5 rounded-md border border-[#2d2d35]">
                {domain}
              </span>
            )}
          </div>

          {(tldr || note.content) && (
            <div className="bg-[#1a1a1e] p-3 rounded-lg border border-[#2d2d35]">
              <p className="text-[10px] font-semibold text-[#6b6d7b] uppercase tracking-wider mb-1.5">TLDR</p>
              <p className="text-xs text-[#a1a3b0] leading-relaxed">
                {tldr ?? note.content?.slice(0, 300) + (note.content && note.content.length > 300 ? '…' : '')}
              </p>
            </div>
          )}

          <div>
            <p className="text-[10px] font-semibold text-[#6b6d7b] uppercase tracking-wider mb-2">Mind Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  onClick={(e) => handleTagPillClick(e, tag)}
                  className="group cursor-pointer inline-flex items-center gap-1 bg-[#222227] text-xs px-2.5 py-1 rounded-md border border-[#2c2c34] text-[#a0a0ab] hover:border-accent/40 hover:text-[#e4e4e7] transition-colors"
                >
                  <Hash size={10} />
                  {tag}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeTag(tag) }}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity ml-0.5"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
            {showTagInput ? (
              <div className="mt-2 flex items-center gap-1.5 bg-[#222227] rounded-md border border-[#2c2c34] px-2.5 py-1.5">
                <Hash size={12} className="text-[#6b6d7b]" />
                <input
                  ref={tagInputRef}
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Type tag, Enter to add"
                  className="flex-1 bg-transparent text-xs text-[#e4e4e7] placeholder:text-[#6b6d7b] outline-none"
                />
                <button
                  onClick={() => { setShowTagInput(false); setTagInput('') }}
                  className="text-[#6b6d7b] hover:text-[#e4e4e7]"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowTagInput(true)}
                className="mt-2 flex items-center gap-1 text-xs text-[#6b6d7b] hover:text-[#e4e4e7] transition-colors"
              >
                <Plus size={12} />
                Add tag
              </button>
            )}
          </div>

          <div>
            <p className="text-[10px] font-semibold text-[#6b6d7b] uppercase tracking-wider mb-2">Mind Notes</p>
            <textarea
              value={mindNote}
              onChange={(e) => setMindNote(e.target.value)}
              placeholder="Type here to add a note…"
              rows={3}
              className="w-full bg-[#1a1a1e] text-xs text-[#a1a3b0] placeholder:text-[#6b6d7b] rounded-lg border border-[#2d2d35] p-2.5 resize-none outline-none focus:border-accent/40 transition-colors"
            />
          </div>
        </div>

        <div className="mt-auto p-5 border-t border-[#26262b]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="text-[#6b6d7b] hover:text-yellow-400 transition-colors" title="Favorite">
                <Star size={16} />
              </button>
              <button className="text-[#6b6d7b] hover:text-[#e4e4e7] transition-colors" title="Share">
                <Share2 size={16} />
              </button>
            </div>
            <button
              onClick={handleDelete}
              className="text-[#6b6d7b] hover:text-red-400 transition-colors"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
