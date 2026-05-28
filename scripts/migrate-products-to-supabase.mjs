import fs from "node:fs";
import path from "node:path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import pg from "pg";

loadEnv(".env.local");

const required = [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
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

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();
const client = new pg.Client({
  host: process.env.SUPABASE_DB_HOST,
  port: Number(process.env.SUPABASE_DB_PORT),
  database: process.env.SUPABASE_DB_NAME,
  user: process.env.SUPABASE_DB_USER,
  password: process.env.SUPABASE_DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

const snapshot = await db.collection("products").get();
const rows = snapshot.docs.map((doc) => {
  const product = doc.data();
  return {
    name: product.name,
    slug: product.slug,
    description: product.description || "",
    price_pence: product.pricePence,
    original_price_pence: product.originalPricePence || null,
    category: product.category || "",
    collections: product.collections || [],
    colors: product.colors || [],
    variants: product.variants || [],
    images: product.images || [],
    badge: product.badge || null,
    status: product.status || "draft",
    featured: product.featured || false,
    model_preview_enabled: product.modelPreviewEnabled || false,
    garment_category: product.garmentCategory || null,
    ai_ready_garment_image_url: product.aiReadyGarmentImageUrl || null,
    model_preview_images: product.modelPreviewImages || [],
    created_at: product.createdAt || new Date().toISOString(),
    updated_at: product.updatedAt || new Date().toISOString(),
  };
});

if (rows.length === 0) {
  console.log("No Firebase products found.");
  process.exit(0);
}

await client.connect();
try {
  for (const row of rows) {
    await client.query(
      `
      insert into public.products (
        name,
        slug,
        description,
        price_pence,
        original_price_pence,
        category,
        collections,
        colors,
        variants,
        images,
        badge,
        status,
        featured,
        model_preview_enabled,
        garment_category,
        ai_ready_garment_image_url,
        model_preview_images,
        created_at,
        updated_at
      )
      values (
        $1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb, $11, $12,
        $13, $14, $15, $16, $17::jsonb, $18, $19
      )
      on conflict (slug) do update set
        name = excluded.name,
        description = excluded.description,
        price_pence = excluded.price_pence,
        original_price_pence = excluded.original_price_pence,
        category = excluded.category,
        collections = excluded.collections,
        colors = excluded.colors,
        variants = excluded.variants,
        images = excluded.images,
        badge = excluded.badge,
        status = excluded.status,
        featured = excluded.featured,
        model_preview_enabled = excluded.model_preview_enabled,
        garment_category = excluded.garment_category,
        ai_ready_garment_image_url = excluded.ai_ready_garment_image_url,
        model_preview_images = excluded.model_preview_images,
        updated_at = excluded.updated_at
      `,
      [
        row.name,
        row.slug,
        row.description,
        row.price_pence,
        row.original_price_pence,
        row.category,
        row.collections,
        row.colors,
        JSON.stringify(row.variants),
        JSON.stringify(row.images),
        row.badge,
        row.status,
        row.featured,
        row.model_preview_enabled,
        row.garment_category,
        row.ai_ready_garment_image_url,
        JSON.stringify(row.model_preview_images),
        row.created_at,
        row.updated_at,
      ]
    );
  }
} finally {
  await client.end();
}

console.log(`Migrated ${rows.length} product${rows.length === 1 ? "" : "s"} to Supabase.`);

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
