# Little Hero

A full-stack, AI-powered children's book builder. The web application lets parents create personalised illustrated story books featuring their child as the main character.

---

## 1. Tech Stack

| Layer       | Technology                                                                  |
| ----------- | --------------------------------------------------------------------------- |
| Front-end   | **Next.js 15** (App Router, Server Actions) • **React 19** • **TypeScript** |
| Styling     | **Tailwind CSS** • @shadcn/ui (Radix UI primitives + tailwind-variants)     |
| Auth & DB   | **Supabase** – Postgres, RLS, Auth helpers for Next.js                      |
| Storage     | Supabase Storage buckets                                                    |
| AI services | **OpenAI** (image + story generation)                                       |
| Charts / UI | Recharts, Embla carousel, Lucide icons, Sonner toast                        |
| Tooling     | pnpm, TypeScript 5, ESLint, Prettier                                        |

---

## 2. Repository Structure

```
little-hero/
│
├─ app/                ← Next.js app-router routes (pages + server actions)
│   ├─ api/            ← Edge/serverless API routes (Supabase/AI helpers)
│   │   ├─ books/…     ← REST-like endpoints for book CRUD & generation
│   │   ├─ profiles/…  ← Child profile CRUD endpoints
│   │   └─ book-pages/ ← Signed URL + uploads for illustrated pages
│   ├─ add-book/       ← Multi-step wizard for creating a new book
│   ├─ add-profile/    ← Wizard for adding a new child profile
│   ├─ dashboard/      ← User dashboard (book list)
│   ├─ sign-in|up/…    ← Auth views (passwordless + magic-link)
│   └─ …               ← Additional routes (edit, order, forgot-pw, etc.)
│
├─ components/         ← Re-usable UI components (shadcn/ui generated)
│   └─ ui/             ← Low-level UI primitives (accordion, button, …)
│
├─ hooks/              ← React hooks (auth, media-query, toast helper)
├─ lib/                ← Client-side & server utilities
│   ├─ supabase.ts     ← Supabase singleton (browser & server helpers)
│   ├─ api-client.ts   ← Thin wrapper around fetch for /app/api routes
│   ├─ openai.ts       ← Typed OpenAI helper
│   └─ db/             ← Type-safe queries grouped by domain (books, …)
│
├─ styles/             ← Global Tailwind CSS
├─ public/             ← Static assets (placeholders, logos)
├─ assets/             ← SQL migration scripts & misc docs
├─ middleware.ts       ← Supabase auth cookies → Next.js middleware
└─ **README.md**
```

---

## 3. API Routes (App Router `/app/api`)

All routes are TypeScript files that run on the Edge Runtime (unless file IO is required). Each folder inside `app/api` resembles a REST resource; when the file is called `route.ts` Next.js maps it to a verb based on the exported handlers (GET, POST, etc.).

### 3.1 Books

| Endpoint                              | Purpose                                              |
| ------------------------------------- | ---------------------------------------------------- |
| `POST /api/books/creation`            | Create a stub row for a new book (returns `bookId`). |
| `GET  /api/books/{id}`                | Get a single book owned by the user.                 |
| `POST /api/books/{id}/generate-story` | Generate story text with OpenAI.                     |
| `GET  /api/books/{id}/pages`          | Fetch ordered list of pages & signed image URLs.     |

### 3.2 Book Pages

| Endpoint                           | Purpose                                     |
| ---------------------------------- | ------------------------------------------- |
| `POST /api/book-pages/{id}/upload` | Upload an illustration to Supabase Storage. |

### 3.3 Profiles

| Endpoint                      | Purpose                                   |
| ----------------------------- | ----------------------------------------- |
| `GET/POST /api/profiles`      | List or create child profiles.            |
| `GET/PUT  /api/profiles/{id}` | Retrieve or update an individual profile. |

> All endpoints require a valid Supabase session (cookie-based). Unauthorized requests return **401**.

---

## 4. Database & Supabase

The project ships with SQL migration scripts in `assets/`:

• `SUPABASE_INITIAL_MIGRATION.sql` – Core tables & RLS policies
• `SUPABASE_AUTH_SETUP.sql` – Email magic-link templates and roles
• Other convenience scripts for bucket creation & demo data

If you start from scratch:

1. Create a new Supabase project.
2. Run the SQL files in the supplied order.
3. Copy the `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to a local `.env`.

---

## 5. Environment Variables

Create a `.env.local` at the repo root:

```
NEXT_PUBLIC_SUPABASE_URL=…
NEXT_PUBLIC_SUPABASE_ANON_KEY=…
SUPABASE_SERVICE_ROLE_KEY=…    # **server-only**
OPENAI_API_KEY=…
```

> Do **NOT** commit `.env.local`. It is git-ignored by default.

---

## 6. Getting Started (Local Dev)

```bash
# 1. Install dependencies
pnpm i

# 2. Copy env vars
cp .env.example .env.local   # then fill in the values

# 3. Run the dev server
pnpm dev

# Next.js will be available at http://localhost:3000
```

### Available Scripts

| Command      | Description                       |
| ------------ | --------------------------------- |
| `pnpm dev`   | Start Next.js in development mode |
| `pnpm build` | Create a production build         |
| `pnpm start` | Run the built app (`.next/`)      |
| `pnpm lint`  | Lint the codebase with ESLint     |

---

## 7. Testing API Routes

Because the API lives inside Next.js, you can call endpoints directly when `pnpm dev` is running or deploy the app to Vercel. Use **Insomnia** or **curl** with the `supabase-auth-token` cookie obtained from a browser session.

---

## 8. Code Quality & Conventions

• **TypeScript everywhere** – strive for `strict`-mode compliance.  
• Components live under `components/` and must be stateless/presentational if placed in `components/ui`.  
• Business logic belongs in `lib/` or server actions in route files.  
• Prefer React Server Components (RSC) where possible (e.g. fetching Supabase inside server components).  
• Use [Zod](https://github.com/colinhacks/zod) for runtime schema validation on inputs.

---

## 9. Deployment

The project is designed for **Vercel + Supabase** – zero-config.  
Just set the env vars in Vercel Dashboard and push to `main`.  
CI will run `pnpm build` and Vercel will handle edge functions automatically.

---

## 10. Contributing Guide

1. Create a new branch `feat/my-thing` from `main`.
2. Run `pnpm lint` & ensure `pnpm build` passes.
3. Open a PR with a clear description & screenshots.
4. One reviewer approval is required before merge.

---

## 11. License

This repository is **proprietary** and **all rights reserved**.  
© 2024 Little Hero.
