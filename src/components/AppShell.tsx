import { useEffect, useState } from 'react'
import type { Note } from '../types'
import { useNoteStore } from '../stores/noteStore'
import TopBar from './TopBar'
import FilterTabs from './FilterTabs'
import IconRail from './IconRail'
import ComposeCard from './ComposeCard'
import { TextNoteCard, ImageNoteCard, MarkdownCard } from './NoteCard'
import InspectorModal from './InspectorModal'
import EmptyState from './EmptyState'
import LoadingSkeleton from './LoadingSkeleton'

export default function AppShell() {
  const {
    notes, loading, searchQuery, activeFilter,
    fetchNotes, setSearchQuery, setActiveFilter, error, clearError,
  } = useNoteStore()
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  const filtered = notes.filter((n) => {
    if (activeFilter !== 'all' && n.type !== activeFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const matchesTitle = n.title?.toLowerCase().includes(q)
      const matchesContent = n.content?.toLowerCase().includes(q)
      if (!matchesTitle && !matchesContent) return false
    }
    return true
  })

  const renderCard = (note: Note) => {
    switch (note.type) {
      case 'text':
        return <TextNoteCard key={note.id} note={note} onSelect={() => setSelectedNote(note)} />
      case 'image':
        return <ImageNoteCard key={note.id} note={note} />
      case 'markdown':
        return <MarkdownCard key={note.id} note={note} onSelect={() => setSelectedNote(note)} />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <IconRail />

      <div className="pl-14">
        <TopBar value={searchQuery} onChange={setSearchQuery} />
        <FilterTabs active={activeFilter} onChange={setActiveFilter} />

        {error && (
          <div className="px-4 sm:px-6 lg:px-8 pb-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center justify-between">
              <p className="text-sm text-red-400">{error}</p>
              <button onClick={clearError} className="text-red-400 hover:text-red-300 ml-2">
                ✕
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <LoadingSkeleton />
        ) : filtered.length === 0 && searchQuery === '' && activeFilter === 'all' && notes.length === 0 ? (
          <div className="columns-1 sm:columns-2 md:columns-3 xl:columns-4 gap-4 px-4 sm:px-6 lg:px-8">
            <ComposeCard />
            <EmptyState />
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 md:columns-3 xl:columns-4 gap-4 px-4 sm:px-6 lg:px-8">
            <ComposeCard />
            {filtered.map(renderCard)}
          </div>
        )}
      </div>

      {selectedNote && (
        <InspectorModal
          note={selectedNote}
          onClose={() => setSelectedNote(null)}
          onTagClick={(tag) => setSearchQuery(tag)}
        />
      )}
    </div>
  )
}
