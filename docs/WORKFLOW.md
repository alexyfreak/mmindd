# Development Workflow

## Principles

1. **One feature = one commit.** Every new feature or significant change gets its own commit with a descriptive message.
2. **Build before commit.** Always run `npm run build` before committing to catch TypeScript and build errors.
3. **Push after each milestone.** Push to the remote after each completed feature phase.
4. **No force-push.** Never rewrite history on shared branches.

## Commit Convention

```
type: short description

<details if needed>
```

Types:
- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation
- `chore:` — Tooling, deps, config
- `refactor:` — Code restructuring

## Feature Workflow

1. **Pull latest** from remote
2. **Implement** the feature
3. **Run build** — `npm run build` (runs `tsc -b && vite build`)
4. **Fix errors** — iterate until build passes
5. **Stage** — `git add -A`
6. **Commit** — `git commit -m "feat: descriptive message"`
7. **Push** — `git push`

## Project Phases (Completed)

| Phase | Description | Commit |
|-------|-------------|--------|
| 0 | Scaffold Vite project, install deps, configure Tailwind | - |
| 1 | Supabase schema, storage bucket, env vars | - |
| 2 | Auth (LoginScreen, authStore) | - |
| 3 | Layout shell (AppShell, TopBar, FilterTabs, IconRail) | - |
| 4 | Note card components (Text, Image, Markdown) | - |
| 5 | Add-note flow (ComposeCard) | - |
| 6 | Fetch & render notes on login | - |
| 7 | Search & filters (client-side) | - |
| 8 | Polish (empty state, loading, toasts, logout) | - |
| 9 | Deploy to Vercel | - |
| 10 | Markdown viewer with TOC, syntax highlighting | initial |

## Local Development

```bash
npm run dev     # Start Vite dev server with HMR
npm run build   # TypeScript check + production build
npm run lint    # Run Oxlint
```

## Environment

Required env vars in `.env.local`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

The `.env.local` file is gitignored. `.env.example` serves as a template.

## Deployment

```bash
vercel --prod
```

Environment variables must be set in Vercel project settings:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
