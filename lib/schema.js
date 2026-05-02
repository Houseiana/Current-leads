export const SCHEMA_SQL = `
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'sales')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fresh_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  phone_normalized TEXT NOT NULL,
  area TEXT NOT NULL,
  project_name TEXT NOT NULL,
  lead_source TEXT NOT NULL,
  lead_source_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fresh_leads_phone_norm
  ON fresh_leads(phone_normalized);
CREATE INDEX IF NOT EXISTS idx_fresh_leads_created_at
  ON fresh_leads(created_at DESC);

CREATE TABLE IF NOT EXISTS contacted_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  phone_normalized TEXT NOT NULL,
  email TEXT,
  area TEXT,
  unit TEXT,
  sales_name TEXT NOT NULL,
  sales_phone_used TEXT,
  sales_whatsapp_used TEXT,
  status TEXT NOT NULL DEFAULT 'Called',
  unit_link TEXT,
  web_lead_source_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  contacted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE contacted_leads
  RENAME COLUMN houseiana_unit_link TO unit_link;
`;

// Note: the trailing ALTER will fail if the column was never named that way.
// We run schema in pieces in lib/bootstrap.js to handle that gracefully.

export const SCHEMA_STATEMENTS = [
  "CREATE EXTENSION IF NOT EXISTS pgcrypto",
  `CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'sales')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS fresh_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    phone_normalized TEXT NOT NULL,
    area TEXT NOT NULL,
    project_name TEXT NOT NULL,
    lead_source TEXT NOT NULL,
    lead_source_link TEXT,
    lead_type TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  "CREATE INDEX IF NOT EXISTS idx_fresh_leads_phone_norm ON fresh_leads(phone_normalized)",
  "CREATE INDEX IF NOT EXISTS idx_fresh_leads_created_at ON fresh_leads(created_at DESC)",
  `CREATE TABLE IF NOT EXISTS contacted_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    phone_normalized TEXT NOT NULL,
    email TEXT,
    area TEXT,
    unit TEXT,
    sales_name TEXT NOT NULL,
    sales_phone_used TEXT,
    sales_whatsapp_used TEXT,
    status TEXT NOT NULL DEFAULT 'Called',
    unit_link TEXT,
    web_lead_source_link TEXT,
    lead_type TEXT,
    notes TEXT,
    call_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    contacted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  "CREATE INDEX IF NOT EXISTS idx_contacted_leads_phone_norm ON contacted_leads(phone_normalized)",
  "CREATE INDEX IF NOT EXISTS idx_contacted_leads_created_at ON contacted_leads(created_at DESC)",
  `CREATE TABLE IF NOT EXISTS blacklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    phone TEXT NOT NULL,
    phone_normalized TEXT NOT NULL,
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  "CREATE INDEX IF NOT EXISTS idx_blacklist_phone_norm ON blacklist(phone_normalized)",
  "CREATE INDEX IF NOT EXISTS idx_blacklist_created_at ON blacklist(created_at DESC)",
];

// Idempotent migrations to run after schema is applied.
// Each migration must be safe to re-run.
export const MIGRATIONS = [
  // Rename old column if a previous version of the schema created it.
  `DO $$
   BEGIN
     IF EXISTS (
       SELECT 1
       FROM information_schema.columns
       WHERE table_name = 'contacted_leads' AND column_name = 'houseiana_unit_link'
     ) AND NOT EXISTS (
       SELECT 1
       FROM information_schema.columns
       WHERE table_name = 'contacted_leads' AND column_name = 'unit_link'
     ) THEN
       ALTER TABLE contacted_leads RENAME COLUMN houseiana_unit_link TO unit_link;
     END IF;
   END $$`,
  // lead_type column on existing tables
  "ALTER TABLE fresh_leads ADD COLUMN IF NOT EXISTS lead_type TEXT",
  "ALTER TABLE contacted_leads ADD COLUMN IF NOT EXISTS lead_type TEXT",
  // notes column on contacted leads
  "ALTER TABLE contacted_leads ADD COLUMN IF NOT EXISTS notes TEXT",
  // call_at: when sales actually placed the call (sales-entered)
  "ALTER TABLE contacted_leads ADD COLUMN IF NOT EXISTS call_at TIMESTAMPTZ",
  // Drop the employees table — that module was added by mistake and reverted.
  // IF EXISTS makes this idempotent: harmless after the table is gone.
  "DROP TABLE IF EXISTS employees CASCADE",
];
