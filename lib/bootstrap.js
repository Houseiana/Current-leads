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
  return { seeded };
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
