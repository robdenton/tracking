# Parachute

A private, personal Relationship OS for nurturing your network of founders and marketers.

**Philosophy:** Systematic generosity. The app helps you remember who matters, understand what's happening in their world, and take small, thoughtful actions that compound over time.

---

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Set up your database (SQLite by default)
# DATABASE_URL is already set to file:./prisma/dev.db in .env

# 3. Push schema and seed demo data
npx prisma db push
npm run seed

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Switching to PostgreSQL

1. In `.env`, change:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/parachute"
   ```
2. In `prisma/schema.prisma`, change:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Run: `npx prisma migrate dev --name init`

---

## Folder structure

```
app/                    Next.js App Router pages + API routes
  api/                  Route handlers (people, signals, suggestions, interactions, etc.)
  people/               People list + detail + add/edit
  signals/              Signal feed
  suggestions/          Suggestion engine output
  timeline/             Global chronological view
components/
  ui/                   shadcn-style primitives (Button, Card, Badge, etc.)
  layout/               Sidebar navigation
  people/               Person-specific components (form, log buttons)
  signals/              Signal filters + actions
  suggestions/          Suggestion actions + generate button
integrations/           Extension points for future data sources
  gmail.ts              Gmail sync stub
  whatsapp.ts           WhatsApp sync stub
  social.ts             LinkedIn/Twitter ingestion stub
  news.ts               News/RSS ingestion stub
lib/
  prisma.ts             Prisma client singleton
  utils.ts              Helpers, formatters, constants
prisma/
  schema.prisma         Full relational schema
  seed.ts               25 realistic demo people + history
server/
  people.ts             People CRUD service
  signals.ts            Signals service
  suggestions.ts        Suggestion generation engine (deterministic rules)
  timeline.ts           Timeline aggregation service
```

---

## Suggestion engine rules

The suggestion engine (`server/suggestions.ts`) runs deterministic rules — no AI:

| Rule | Trigger | Priority |
|------|---------|----------|
| Recency check-in | Last interaction > 90 days | High (>180d) / Medium |
| Funding signal | Funding signal in last 7 days | High |
| Hiring signal | Hiring signal in last 7 days | Medium |
| Challenge response | High-relevance post (LinkedIn/tweet, score ≥7) | Medium |
| Multi-signal boost | 3+ high-relevance signals in 7 days | Escalates to High |

Run manually via the **Generate** button on the Suggestions page, or call `POST /api/suggestions/generate`.

---

## Future integration points

Each file in `integrations/` has typed stubs ready to be wired up:

- **Gmail** — fetch last email per contact, auto-create Interaction records
- **WhatsApp** — last message date via WA Business API or Baileys
- **LinkedIn/Twitter** — post ingestion → Signal records
- **News/RSS** — company monitoring → funding/news signals

---

## Tech stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS + custom shadcn/ui primitives
- Prisma 5 + SQLite (swap to PostgreSQL via env)
- Zod validation on all API routes
- Lucide icons
- date-fns
