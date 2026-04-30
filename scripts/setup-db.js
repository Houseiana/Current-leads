/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

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

async function upsertUser(pool, username, password, role) {
  const hash = await bcrypt.hash(password, 10);
  await pool.query(
    `INSERT INTO users (username, password_hash, role)
     VALUES ($1, $2, $3)
     ON CONFLICT (username)
     DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role`,
    [username, hash, role]
  );
  console.log(`✓ user ${username} (${role}) ready`);
}

async function main() {
  loadDotenv();

  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is missing. Add it to .env.local");
    process.exit(1);
  }

  const adminUser = process.env.ADMIN_USERNAME;
  const adminPass = process.env.ADMIN_PASSWORD;
  const salesUser = process.env.SALES_USERNAME;
  const salesPass = process.env.SALES_PASSWORD;

  if (!adminUser || !adminPass || !salesUser || !salesPass) {
    console.error(
      "ADMIN_USERNAME / ADMIN_PASSWORD / SALES_USERNAME / SALES_PASSWORD must all be set in .env.local"
    );
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    max: 2,
  });

  console.log("Connecting to database...");
  const schemaPath = path.join(__dirname, "..", "db", "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf8");

  console.log("Applying schema...");
  await pool.query(schema);
  console.log("✓ schema applied");

  console.log("Seeding users...");
  await upsertUser(pool, adminUser, adminPass, "admin");
  await upsertUser(pool, salesUser, salesPass, "sales");

  await pool.end();
  console.log("\nDone. You can now run: npm run dev");
}

main().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
