# Product Requirements Document: Vault

## 1. Overview

A private, single-user "second brain" personal notes app. Replaces Telegram Saved Messages. The user adds notes (plain text, images, `.md` files) and they appear as cards in a dark-themed masonry grid. Everything is stored in Supabase behind RLS. Deployed as a static Vite build on Vercel.

## 2. User Persona

- **Single user** (no multi-user, no public sign-up)
- Owns exactly one login account
- Wants a fast, private place to dump thoughts, images, and markdown documents

## 3. Functional Requirements

### 3.1 Authentication
- Email + password login only
- No sign-up flow in the app
- Session persisted across page refreshes
- Logout from settings menu

### 3.2 Note Management
- Three note types: `text`, `image`, `markdown`
- Create text notes via an inline compose card
- Upload images and `.md` files via file picker
- Optimistic insert into UI, confirmed against server response
- Delete notes with confirmation
- Notes ordered by `created_at desc` (newest first)

### 3.3 Viewing
- Masonry grid layout (CSS columns, no library)
- Text notes: truncated preview in grid, full view in modal
- Image notes: rendered via signed Supabase URL, click to expand
- Markdown notes: syntax-highlighted preview in grid, full-featured viewer in overlay
- Markdown viewer with: syntax highlighting (highlight.js), collapsible table of contents sidebar, heading tracking via IntersectionObserver, smooth-scroll navigation, floating copy-code button

### 3.4 Search & Filter
- Client-side search over note title and content
- Filter tabs: All, Text, Images, Markdown
- Combined search + filter support

### 3.5 UI/UX
- Dark theme: near-black navy background (`#0d0e14`)
- Translucent search bar with ⌘K hint
- Pill-shaped filter tabs with icons
- Fixed left icon rail (settings → logout, sparkles decorative)
- Rounded-2xl cards with subtle hover lift
- Empty state for new vault
- Loading skeletons while notes fetch
- Inline error messages on failures

## 4. Data Model

### 4.1 `notes` Table (Postgres)

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, default `gen_random_uuid()` |
| user_id | uuid | FK to `auth.users`, default `auth.uid()` |
| type | text | Enum: 'text', 'image', 'markdown' |
| title | text | Optional, nullable |
| content | text | Raw text for text/markdown notes |
| file_path | text | Storage path for image/markdown files |
| created_at | timestamptz | Default `now()` |

### 4.2 Storage
- Private bucket: `note-files`
- Files stored at `{user_id}/{timestamp}-{filename}`
- Access via signed URLs (1-hour expiry)
- Markdown file content stored both in `file_path` (bucket) and `content` (DB column) so rendering doesn't require network round trips

## 5. Architecture

- **Frontend only:** Vite + React SPA, no server framework
- **Backend:** Supabase only (Auth, Postgres, Storage)
- **Browser → Supabase directly** under RLS policies
- **State:** Zustand stores for auth and notes
- **Deployment:** Static Vite build on Vercel
