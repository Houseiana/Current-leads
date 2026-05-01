/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

function loadDotenv() {
  const file = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, "utf8");
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const idx = trimmed.indexOf("=");
    if (idx === -1) return;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  });
}

async function main() {
  loadDotenv();
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL not set.");
    process.exit(1);
  }
  const host = url.replace(/^.*@/, "").replace(/\/.*$/, "");
  console.log(`Connecting to: ${host}\n`);

  const pool = new Pool({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    max: 2,
  });

  try {
    const tables = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log("Tables:", tables.rows.map((r) => r.table_name).join(", ") || "(none)");

    if (!tables.rows.find((r) => r.table_name === "users")) {
      console.log("\n✗ users table missing. Run: npm run db:setup");
      return;
    }

    const users = await pool.query(
      "SELECT id, username, role, created_at FROM users ORDER BY id"
    );
    console.log(`\nUsers (${users.rows.length}):`);
    if (users.rows.length === 0) {
      console.log("  (none — run: npm run db:setup)");
    } else {
      for (const u of users.rows) {
        console.log(`  - ${u.username}  (${u.role})  id=${u.id}`);
      }
    }

    const fresh = await pool.query("SELECT COUNT(*)::int AS c FROM fresh_leads");
    const contacted = await pool.query(
      "SELECT COUNT(*)::int AS c FROM contacted_leads"
    );
    console.log(`\nfresh_leads rows:     ${fresh.rows[0].c}`);
    console.log(`contacted_leads rows: ${contacted.rows[0].c}`);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Check failed:", err.message);
  process.exit(1);
});
