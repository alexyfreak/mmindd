import { create } from 'zustand'
import type { Note, NoteType, FilterType } from '../types'
import { supabase } from '../lib/supabase'

interface NotesState {
  notes: Note[]
  loading: boolean
  error: string | null
  searchQuery: string
  activeFilter: FilterType

  fetchNotes: () => Promise<void>
  addNote: (note: { type: NoteType; title?: string; content?: string; file_path?: string; cover_image?: string; domain?: string; source_url?: string; tags?: string[]; tldr?: string }) => Promise<Note | null>
  updateNote: (id: string, updates: Partial<Pick<Note, 'title' | 'content' | 'tags' | 'tldr' | 'domain' | 'source_url' | 'cover_image'>>) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  setSearchQuery: (query: string) => void
  setActiveFilter: (filter: FilterType) => void
  clearError: () => void
}

export const useNoteStore = create<NotesState>((set, get) => ({
  notes: [],
  loading: false,
  error: null,
  searchQuery: '',
  activeFilter: 'all',

  fetchNotes: async () => {
    set({ loading: true, error: null })
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      set({ loading: false, error: error.message })
      return
    }
    set({ notes: data ?? [], loading: false })
  },

  addNote: async (note) => {
    const { data, error } = await supabase
      .from('notes')
      .insert({ type: note.type, title: note.title, content: note.content, file_path: note.file_path, cover_image: note.cover_image, domain: note.domain, source_url: note.source_url, tags: note.tags, tldr: note.tldr })
      .select()
      .single()

    if (error) {
      set({ error: error.message })
      return null
    }

    set((s) => ({ notes: [data, ...s.notes] }))
    return data
  },

  updateNote: async (id, updates) => {
    const { error } = await supabase
      .from('notes')
      .update(updates)
      .eq('id', id)

    if (error) {
      set({ error: error.message })
      return
    }

    set((s) => ({
      notes: s.notes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    }))
  },

  deleteNote: async (id) => {
    const note = get().notes.find((n) => n.id === id)
    if (note?.file_path) {
      await supabase.storage.from('note-files').remove([note.file_path])
    }

    const { error } = await supabase.from('notes').delete().eq('id', id)
    if (error) {
      set({ error: error.message })
      return
    }
    set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }))
  },

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setActiveFilter: (activeFilter) => set({ activeFilter }),
  clearError: () => set({ error: null }),
}))
