import bcrypt from "bcryptjs";
import { query } from "./db";
import { MIGRATIONS, SCHEMA_STATEMENTS } from "./schema";

let bootstrapPromise = null;

async function applySchema() {
  for (const stmt of SCHEMA_STATEMENTS) {
    await query(stmt);
  }
  for (const stmt of MIGRATIONS) {
    await query(stmt);
  }
}

async function seedUserIfMissing(username, password, role) {
  if (!username || !password) return false;
  const { rows } = await query(
    "SELECT id FROM users WHERE username = $1",
    [username]
  );
  if (rows.length > 0) return false;
  const hash = await bcrypt.hash(password, 10);
  await query(
    `INSERT INTO users (username, password_hash, role)
     VALUES ($1, $2, $3)
     ON CONFLICT (username) DO NOTHING`,
    [username, hash, role]
  );
  return true;
}

// Upsert: insert if missing, otherwise reset password + role.
// Used for EXTRA_SALES_USERS so the env var stays the source of truth
// (changing the env var on the next deploy resets the password).
async function upsertUser(username, password, role) {
  if (!username || !password) return null;
  const hash = await bcrypt.hash(password, 10);
  const { rows } = await query(
    `INSERT INTO users (username, password_hash, role)
     VALUES ($1, $2, $3)
     ON CONFLICT (username) DO UPDATE
       SET password_hash = EXCLUDED.password_hash,
           role = EXCLUDED.role
     RETURNING (xmax = 0) AS inserted`,
    [username, hash, role]
  );
  return rows[0]?.inserted ? "inserted" : "updated";
}

function parseExtraSalesUsers(raw) {
  if (!raw) return [];
  return raw
    .split(",")
    .map((pair) => pair.trim())
    .filter(Boolean)
    .map((pair) => {
      const idx = pair.indexOf(":");
      if (idx === -1) return null;
      return {
        username: pair.slice(0, idx).trim(),
        password: pair.slice(idx + 1).trim(),
      };
    })
    .filter((p) => p && p.username && p.password);
}

async function doBootstrap() {
  await applySchema();
  const seeded = [];
  if (
    await seedUserIfMissing(
      process.env.ADMIN_USERNAME,
      process.env.ADMIN_PASSWORD,
      "admin"
    )
  ) {
    seeded.push(process.env.ADMIN_USERNAME);
  }
  if (
    await seedUserIfMissing(
      process.env.SALES_USERNAME,
      process.env.SALES_PASSWORD,
      "sales"
    )
  ) {
    seeded.push(process.env.SALES_USERNAME);
  }
  const updated = [];
  for (const u of parseExtraSalesUsers(process.env.EXTRA_SALES_USERS)) {
    const r = await upsertUser(u.username, u.password, "sales");
    if (r === "inserted") seeded.push(u.username);
    else if (r === "updated") updated.push(u.username);
  }
  return { seeded, updated };
}

export async function ensureBootstrapped() {
  if (!bootstrapPromise) {
    bootstrapPromise = doBootstrap().catch((err) => {
      bootstrapPromise = null;
      throw err;
    });
  }
  return bootstrapPromise;
}

export async function bootstrapStatus() {
  const status = {
    env: {
      DATABASE_URL: !!process.env.DATABASE_URL,
      SESSION_SECRET: !!process.env.SESSION_SECRET,
      ADMIN_USERNAME: !!process.env.ADMIN_USERNAME,
      ADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD,
      SALES_USERNAME: !!process.env.SALES_USERNAME,
      SALES_PASSWORD: !!process.env.SALES_PASSWORD,
      EXTRA_SALES_USERS: !!process.env.EXTRA_SALES_USERS,
    },
    db: { connected: false, usersTable: false, userCount: 0 },
  };
  try {
    const tbl = await query(
      "SELECT to_regclass('public.users') AS t"
    );
    status.db.connected = true;
    status.db.usersTable = !!tbl.rows[0]?.t;
    if (status.db.usersTable) {
      const c = await query("SELECT COUNT(*)::int AS c FROM users");
      status.db.userCount = c.rows[0]?.c || 0;
    }
  } catch (err) {
    status.db.error = err.message;
  }
  return status;
}

export async function schemaDetails() {
  const out = { tables: [] };
  const tables = await query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);
  for (const { table_name } of tables.rows) {
    const cols = await query(
      `SELECT column_name, data_type, is_nullable, column_default
       FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = $1
       ORDER BY ordinal_position`,
      [table_name]
    );
    const idx = await query(
      `SELECT indexname, indexdef
       FROM pg_indexes
       WHERE schemaname = 'public' AND tablename = $1
       ORDER BY indexname`,
      [table_name]
    );
    const count = await query(
      `SELECT COUNT(*)::int AS c FROM "${table_name.replace(/"/g, '""')}"`
    );
    out.tables.push({
      name: table_name,
      rowCount: count.rows[0]?.c || 0,
      columns: cols.rows.map((c) => ({
        name: c.column_name,
        type: c.data_type,
        nullable: c.is_nullable === "YES",
        default: c.column_default,
      })),
      indexes: idx.rows.map((i) => ({
        name: i.indexname,
        definition: i.indexdef,
      })),
    });
  }
  return out;
}
