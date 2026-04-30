# Houseiana Leads Management Dashboard

Bilingual (Arabic / English) Next.js full-stack app for managing **Fresh Leads** and **Contacted Leads** at Houseiana, with role-based access (Admin / Sales) and a Postgres backend.

## Stack

- **Next.js 14** (App Router) + JavaScript
- **React 18**
- **PostgreSQL** (Neon-friendly) via `pg`
- **Auth**: bcryptjs + JWT in httpOnly cookie (signed via `jose`)
- **Middleware** for route protection by role
- Plain CSS (white / yellow accent / dark text), full RTL/LTR

## Roles

| Role  | Access                                                                |
|-------|-----------------------------------------------------------------------|
| admin | Full dashboard: Fresh + Contacted leads, CRUD, convert, phone search  |
| sales | `/sales` only — phone search returns "already contacted" or "safe to contact" |

## First-time setup

1. **Install Node.js 18+** if you don't have it.
2. Install deps:
   ```bash
   npm install
   ```
3. Configure `.env.local` (already created — review credentials).
4. Run migrations + seed users:
   ```bash
   npm run db:setup
   ```
5. Start the dev server:
   ```bash
   npm run dev
   ```
6. Open http://localhost:3000 and log in.

## Environment variables (`.env.local`)

```
DATABASE_URL=postgres://...        # Postgres connection string
SESSION_SECRET=<random 64-char>    # openssl rand -hex 32
ADMIN_USERNAME=mohamed
ADMIN_PASSWORD=...
SALES_USERNAME=alaa
SALES_PASSWORD=...
```

## Build / Production

```bash
npm run build
npm run start
```

## Deploying to Vercel

The repo is already connected to https://vercel.com/devweb3-outlookcoms-projects/current-leads — every push to `main` deploys automatically.

To sync env vars from your local `.env.local` to all three Vercel environments (production / preview / development):

```bash
npm install -g vercel        # one-time
vercel login                 # one-time
./scripts/sync-vercel-env.sh # link + push DATABASE_URL, SESSION_SECRET, ADMIN_*, SALES_*
vercel --prod                # trigger production deploy
```

After the first deploy, run the database setup once (against the same Neon DB) so tables exist and users are seeded:

```bash
npm run db:setup
```

## Project Layout

```
app/
  api/                 # API routes (auth, leads, search)
  login/               # /login page
  sales/               # sales-only portal
  page.js              # admin dashboard
  layout.js
  globals.css
components/            # all UI components
lib/
  auth.js              # session sign/verify, password check
  db.js                # pg pool + transaction helper
  api-helpers.js       # requireRole()
  serializers.js       # row → JSON mapping
  translations.js      # AR/EN dictionary + status options
  storage.js           # language preference (localStorage)
  utils.js             # phone normalization, dates, validation
db/
  schema.sql           # tables + indexes
scripts/
  setup-db.js          # apply schema + seed users
middleware.js          # role-based redirects
```

## API

All routes require an authenticated session.

| Method | Path                                    | Role        | Purpose                |
|--------|-----------------------------------------|-------------|------------------------|
| POST   | `/api/auth/login`                       | public      | Sign in                |
| POST   | `/api/auth/logout`                      | any         | Sign out               |
| GET    | `/api/auth/me`                          | any         | Current session        |
| GET    | `/api/fresh-leads`                      | admin       | List fresh             |
| POST   | `/api/fresh-leads`                      | admin       | Create fresh           |
| PUT    | `/api/fresh-leads/[id]`                 | admin       | Update fresh           |
| DELETE | `/api/fresh-leads/[id]`                 | admin       | Delete fresh           |
| POST   | `/api/fresh-leads/[id]/convert`         | admin       | Move fresh → contacted |
| GET    | `/api/contacted-leads`                  | admin       | List contacted         |
| POST   | `/api/contacted-leads`                  | admin       | Create contacted       |
| PUT    | `/api/contacted-leads/[id]`             | admin       | Update contacted       |
| DELETE | `/api/contacted-leads/[id]`             | admin       | Delete contacted       |
| POST   | `/api/leads/search`                     | admin/sales | Phone lookup           |

The phone search response is filtered for `sales` (no email/links/source data — only what's needed to decide whether to call).

## Security notes

- `.env.local` is gitignored — credentials never reach the repo.
- Passwords stored as bcrypt hashes (cost 10).
- Session cookie is httpOnly + sameSite=lax + secure in production.
- **Rotate** your DB password and `SESSION_SECRET` if either was ever shared in plaintext.
