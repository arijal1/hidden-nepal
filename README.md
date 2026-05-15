# Hidden Nepal 🏔️

> AI-powered travel companion for discovering Nepal's hidden side.

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router, PPR) |
| Database | Supabase (PostgreSQL + PostGIS) |
| Auth | Clerk |
| Maps | Mapbox GL JS |
| AI | OpenAI GPT-4o (streaming) |
| State | Zustand |
| Styling | Tailwind CSS |
| Monorepo | Turborepo + pnpm workspaces |
| Deploy | Vercel |

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/yourname/hidden-nepal.git
cd hidden-nepal
pnpm install
```

### 2. Set up environment variables

```bash
cp apps/web/.env.example apps/web/.env.local
```

Fill in all values in `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...

# OpenAI
OPENAI_API_KEY=sk-...
```

### 3. Set up Supabase

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
cd apps/web
supabase link --project-ref your-project-ref

# Run migrations
supabase db push

# Or run locally
supabase start
supabase db reset  # applies all migrations + seed data
```

### 4. Run development server

```bash
pnpm dev
# → http://localhost:3000
```

---

## Project Structure

```
hidden-nepal/
├── apps/
│   └── web/                    # Next.js app
│       ├── app/
│       │   ├── (marketing)/    # Homepage, landing pages
│       │   ├── (platform)/     # Destinations, treks, plan, gems, explore
│       │   ├── admin/          # CMS dashboard (admin only)
│       │   └── api/            # Route handlers
│       ├── components/
│       │   ├── home/           # Homepage sections
│       │   ├── destinations/   # Destination detail components
│       │   ├── treks/          # Trek components
│       │   ├── layout/         # Navbar, Footer
│       │   ├── map/            # Mapbox components
│       │   └── shared/         # AnimatedSection, etc.
│       ├── lib/
│       │   ├── supabase/       # DB client + queries
│       │   ├── seo/            # Metadata + JSON-LD
│       │   ├── ai/             # OpenAI prompts
│       │   └── utils/          # Formatters, helpers
│       ├── hooks/              # useGeolocation, useOfflineStorage
│       ├── stores/             # Zustand (plannerStore)
│       ├── types/              # All TypeScript types
│       └── supabase/
│           └── migrations/     # SQL migrations (001, 002, 003)
└── packages/                   # Shared packages (types, ui, config)
```

---

## Database Setup

Migrations run in order:

| File | Description |
|---|---|
| `001_initial_schema.sql` | All tables, indexes, PostGIS functions, triggers |
| `002_rls_policies.sql` | Row Level Security for all tables |
| `003_seed_data.sql` | 8 destinations, 3 trek routes, 3 hidden gems, festivals |

---

## Making a User Admin

In Supabase SQL editor:

```sql
UPDATE profiles
SET is_admin = TRUE
WHERE id = 'your-clerk-user-id';
```

Then set the role in Clerk dashboard → Users → your user → Metadata:
```json
{ "role": "admin" }
```

---

## Deployment (Vercel)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

Set all environment variables from `.env.example` in Vercel dashboard → Project Settings → Environment Variables.

**Recommended regions:** `sin1` (Singapore) and `hkg1` (Hong Kong) for Nepal traffic proximity.

---

## Key Features

- **AI Itinerary Planner** — GPT-4o streaming, 3-step wizard, day-by-day output
- **Hidden Gems Engine** — Community submissions, admin moderation, verified badges
- **Destination Pages** — Parallax hero, Mapbox 3D terrain, transport routes, reviews
- **Trek Routes** — Elevation profile canvas chart, stage-by-stage breakdown, permit info
- **PostGIS Nearby** — Spatial queries for nearby destinations
- **Offline PWA** — IndexedDB saves destinations + itineraries for offline use
- **Admin CMS** — Destination/trek/gem management, review moderation, safety alerts
- **Full SEO** — JSON-LD schemas, dynamic sitemaps, OpenGraph, ISR

---

## License

MIT — built by Anup Rijal
