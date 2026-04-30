# Internal Dashboard

Bilingual (Arabic / English) Next.js full-stack app with role-based access (Admin / Sales) and a Postgres backend.

## Stack

- Next.js 14 (App Router) + JavaScript
- React 18
- PostgreSQL via `pg`
- Auth: bcryptjs + JWT in httpOnly cookie (signed via `jose`)
- Middleware-based route protection

## Roles

| Role  | Access |
|-------|--------|
| admin | Full dashboard, all CRUD, phone search |
| sales | Phone search only — checks if a contact already exists |

## First-time setup

```bash
npm install
npm run db:setup     # creates tables + seeds users
npm run dev
```

Open http://localhost:3000 → redirects to login.

## Environment variables

Configure in `.env.local`:

```
DATABASE_URL=postgres://...
SESSION_SECRET=<random 64-char hex>
ADMIN_USERNAME=...
ADMIN_PASSWORD=...
SALES_USERNAME=...
SALES_PASSWORD=...
```

`SESSION_SECRET` can be generated with: `openssl rand -hex 32`

## Build

```bash
npm run build
npm run start
```

## Deploying to Vercel

The repo is connected to Vercel — pushing to `main` triggers a deploy. To sync env vars from `.env.local`:

```bash
npm install -g vercel
vercel login
./scripts/sync-vercel-env.sh
vercel --prod
```

Run `npm run db:setup` once against the same DB to apply schema and seed users.

## Layout

```
app/
  api/                 # auth + CRUD + search
  login/admin/         # admin sign-in
  login/sales/         # sales sign-in
  sales/               # sales portal (search only)
  page.js              # admin dashboard
components/
lib/
db/
scripts/
middleware.js
```

## Privacy

- `robots.txt` blocks all crawlers; pages also send `noindex,nofollow`.
- `.env.local` is gitignored.
- Passwords stored as bcrypt hashes (cost 10).
- Session cookie is httpOnly + sameSite=lax, secure in production.
