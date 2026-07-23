# Architecture Overview

## System Design

```
Browser (Vite SPA)
    │
    ├── Supabase Auth ────── Email/password login, session management
    ├── Supabase Postgres ── Notes table (RLS-protected)
    └── Supabase Storage ─── Private file bucket (signed URLs)
```

No custom backend. The browser talks directly to Supabase under Row Level Security. The single user's identity is the `auth.uid()` that gates all queries.

## Data Flow

### Authentication
```
LoginScreen
  → authStore.signIn(email, password)
    → supabase.auth.signInWithPassword()
      → session stored in Supabase session cookie
  → onAuthStateChange listener updates Zustand store
    → App re-renders: LoginScreen → AppShell
```

### Note CRUD
```
ComposeCard / AppShell
  → noteStore.fetchNotes() / addNote() / deleteNote()
    → supabase.from('notes').select/insert/delete()
      → Zustand store updated optimistically
        → Grid re-renders
```

### File Upload
```
ComposeCard (Image/Markdown)
  → supabase.storage.from('note-files').upload(path, file)
    → noteStore.addNote({ type, title, content, file_path })
      → Grid shows new card
```

### Signed URL Generation
```
ImageNoteCard / NoteDetailModal
  → supabase.storage.from('note-files').createSignedUrl(file_path, 3600)
    → img src set to signed URL
```

### Markdown Viewer
```
NoteDetailModal (type === 'markdown')
  → MarkdownViewer(content)
    → react-markdown with rehype/slug/autolink/highlight
      → Rendered in flex layout
        → TocSidebar: headings extracted via regex, IntersectionObserver tracks active heading
```

## Component Tree

```
App
├── LoginScreen (when no session)
└── AppShell (when authenticated)
    ├── IconRail (fixed left)
    ├── TopBar (search input)
    ├── FilterTabs
    ├── Grid area
    │   ├── ComposeCard (always first)
    │   ├── TextNoteCard / ImageNoteCard / MarkdownCard
    │   ├── EmptyState (when no notes)
    │   └── LoadingSkeleton (while fetching)
    └── NoteDetailModal (overlay on card click)
        ├── Text note: plain text view
        ├── Image note: full image view
        └── Markdown note: MarkdownViewer
            ├── Main reader area (centered, max-w-3xl)
            └── TocSidebar (fixed right, collapsible)
```

## State Management (Zustand)

### authStore
```typescript
interface AuthState {
  session: Session | null
  loading: boolean
  initialize: () => void          // getSession + onAuthStateChange
  signIn: (email, password) => Promise<void>
  signOut: () => Promise<void>
}
```

### noteStore
```typescript
interface NotesState {
  notes: Note[]
  loading: boolean
  error: string | null
  searchQuery: string
  activeFilter: FilterType
  fetchNotes: () => Promise<void>
  addNote: (note) => Promise<Note | null>
  deleteNote: (id) => Promise<void>
  setSearchQuery: (query) => void
  setActiveFilter: (filter) => void
  clearError: () => void
}
```

## Styling

- **Tailwind CSS v4** with `@tailwindcss/typography` plugin
- Custom theme colors defined in `@theme` block in `index.css`
- Dark theme: `#0d0e14` background, `#15161e` surface, `#23242e` borders
- Accent: `#6c63ff` (purple-blue)
- Masonry grid: CSS `columns` property, no JavaScript library
- Markdown prose: custom dark overrides for headings, code blocks, blockquotes, tables
