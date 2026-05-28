import fs from "node:fs";
import path from "node:path";
import pg from "pg";

loadEnv(".env.local");

const required = [
  "SUPABASE_DB_HOST",
  "SUPABASE_DB_PORT",
  "SUPABASE_DB_NAME",
  "SUPABASE_DB_USER",
  "SUPABASE_DB_PASSWORD",
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing ${key}`);
  }
}

const schemaPath = path.join(process.cwd(), "supabase", "zoetrends_schema.sql");
const sql = fs.readFileSync(schemaPath, "utf8");
const client = new pg.Client({
  host: process.env.SUPABASE_DB_HOST,
  port: Number(process.env.SUPABASE_DB_PORT),
  database: process.env.SUPABASE_DB_NAME,
  user: process.env.SUPABASE_DB_USER,
  password: process.env.SUPABASE_DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
try {
  await client.query(sql);
  const result = await client.query(`
    select
      to_regclass('public.products') as products_table,
      to_regclass('public.model_generation_jobs') as model_jobs_table
  `);
  console.log(JSON.stringify(result.rows[0], null, 2));
} finally {
  await client.end();
}

function loadEnv(fileName) {
  const filePath = path.join(process.cwd(), fileName);
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (!match) continue;

    const key = match[1].trim();
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}
