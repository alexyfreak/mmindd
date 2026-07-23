# Vault — Private Personal Notes App

A private, single-user "second brain" — a dark-themed notes app that replaces Telegram Saved Messages. Add notes as plain text, images, or `.md` files. They appear as cards in a masonry grid. Everything stored in Supabase, deployed on Vercel.

## Tech Stack

- **Vite + React 18 + TypeScript**
- **Tailwind CSS v4** with `@tailwindcss/typography`
- **Zustand** for state management
- **Supabase JS v2** (Auth + Postgres + Storage) — no custom backend
- **react-markdown + rehype-highlight + remark-gfm** for markdown rendering with syntax highlighting
- **lucide-react** for icons
- **Deploy target:** Vercel (static Vite build)

## Quick Start

```bash
# Install dependencies
npm install

# Copy env template and fill in your Supabase credentials
cp .env.example .env.local

# Start dev server
npm run dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run Oxlint |

## Features

- **Email/password auth** — single-user, no sign-up
- **Masonry grid layout** — CSS columns-based, no library needed
- **3 note types:** Text, Image, Markdown
- **Markdown viewer** with syntax highlighting (highlight.js), dynamic table of contents, and copy-code button
- **Search & filter** — client-side filtering by title/content and note type
- **Private file storage** — images and `.md` files stored in Supabase private bucket, served via signed URLs
- **Dark theme** — near-black navy background with soft off-white text

## Project Structure

```
src/
├── App.tsx                  # Root: auth gate (Login vs Vault)
├── main.tsx                 # Entry point
├── index.css                # Tailwind + theme + typography plugin
├── types.ts                 # Note & FilterType types
├── lib/
│   └── supabase.ts          # Supabase client singleton
├── stores/
│   ├── authStore.ts         # Zustand auth state (session, signIn, signOut)
│   └── noteStore.ts         # Zustand notes state (CRUD, search, filters)
└── components/
    ├── LoginScreen.tsx       # Email + password login form
    ├── AppShell.tsx          # Main layout after login
    ├── TopBar.tsx            # Search input with ⌘K hint
    ├── FilterTabs.tsx        # All / Text / Images / Markdown pills
    ├── IconRail.tsx          # Fixed left icon rail (settings → logout)
    ├── ComposeCard.tsx       # Add-note entry point (text/image/markdown)
    ├── NoteCard.tsx          # Card variants (TextNoteCard, ImageNoteCard, MarkdownCard)
    ├── MarkdownNoteCard.tsx  # Markdown preview card with syntax highlighting
    ├── MarkdownViewer.tsx    # Full markdown viewer with TOC sidebar
    ├── NoteDetailModal.tsx   # Detail modal / full-view overlay
    ├── EmptyState.tsx        # Empty vault placeholder
    └── LoadingSkeleton.tsx   # Loading skeleton cards
```

## Supabase Setup

1. Create a Supabase project
2. Run `supabase/schema.sql` in the SQL Editor
3. Create a single user via the Auth dashboard or the admin API

## Deployment

```bash
vercel --prod
```

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel project settings.
