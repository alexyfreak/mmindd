export type NoteType = 'text' | 'image' | 'markdown'

export interface Note {
  id: string
  user_id: string
  type: NoteType
  title?: string | null
  content?: string | null
  file_path?: string | null
  created_at: string
  tags?: string[]
  tldr?: string | null
  domain?: string | null
  source_url?: string | null
}

export type FilterType = NoteType | 'all'
