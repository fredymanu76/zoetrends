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

const products = [
  {
    name: "Made in Italy Floral Wrap Dress",
    category: "Dresses",
    collections: ["new-arrivals", "clothing", "dresses"],
    pricePence: 6400,
    originalPricePence: 7900,
    colors: ["#f6efe8", "#1f5d78", "#b8795f"],
    badge: "New",
    featured: true,
    description:
      "A soft wrap dress with a blue botanical print, easy waist shaping, and a relaxed boutique finish.",
    imageUrl:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Satin Button Blouse",
    category: "Tops",
    collections: ["new-arrivals", "clothing", "tops"],
    pricePence: 3800,
    colors: ["#f8ece8", "#d8b8ad"],
    badge: "New",
    featured: true,
    description:
      "A lightweight satin blouse with a soft drape, long cuffs, and an elegant day-to-evening shape.",
    imageUrl:
      "https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Wide Leg Tailored Trousers",
    category: "Trousers",
    collections: ["clothing", "trousers"],
    pricePence: 5200,
    colors: ["#222222", "#ded6c8"],
    featured: true,
    description:
      "High-waist trousers with a wide leg silhouette and a clean tailored line for polished everyday styling.",
    imageUrl:
      "https://images.unsplash.com/photo-1506629905607-d9f297d4f5f9?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Cream Knit Cardigan",
    category: "Knitwear",
    collections: ["new-arrivals", "clothing", "knitwear"],
    pricePence: 4900,
    colors: ["#eee5d5", "#b99c72"],
    description:
      "A cosy button cardigan in a soft neutral knit, designed for layering over dresses and camisoles.",
    imageUrl:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Boucle Short Jacket",
    category: "Jackets & Coats",
    collections: ["clothing", "jackets-coats"],
    pricePence: 7200,
    originalPricePence: 8900,
    colors: ["#efe7dd", "#111111", "#c9a84d"],
    badge: "Bestseller",
    featured: true,
    description:
      "A cropped boucle jacket with contrast trim and gold-tone buttons, made for smart boutique layering.",
    imageUrl:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Pleated Midi Skirt",
    category: "Trousers",
    collections: ["new-arrivals", "clothing", "trousers"],
    pricePence: 4500,
    colors: ["#b78b8a", "#f7efe9"],
    description:
      "A feminine pleated midi skirt with easy movement and a soft blush tone for occasion or casual wear.",
    imageUrl:
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Italian Linen Jumpsuit",
    category: "Jumpsuits",
    collections: ["clothing", "jumpsuits"],
    pricePence: 6900,
    colors: ["#87937c", "#f5f0e8"],
    badge: "New",
    description:
      "A relaxed linen jumpsuit with a tie waist, wide leg, and breathable finish for warm-weather styling.",
    imageUrl:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Woven Shoulder Bag",
    category: "Bags",
    collections: ["accessories", "bags", "gift-for-her"],
    pricePence: 4200,
    colors: ["#b48955", "#f6eadc"],
    featured: true,
    description:
      "A compact woven shoulder bag with a structured profile and warm neutral tone.",
    imageUrl:
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Gold Layered Necklace",
    category: "Jewellery",
    collections: ["accessories", "jewellery", "gift-for-her"],
    pricePence: 2400,
    colors: ["#c8a64a"],
    description:
      "A layered gold-tone necklace for easy finishing, delicate enough for daytime and polished for evening.",
    imageUrl:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Silk Feel Printed Scarf",
    category: "Scarves",
    collections: ["accessories", "scarves", "gift-items"],
    pricePence: 2200,
    colors: ["#e4c6bb", "#1f5d78", "#c9a84d"],
    badge: "Gift",
    description:
      "A silky printed scarf with boutique colour accents, perfect for styling around the neck, hair, or bag.",
    imageUrl:
      "https://images.unsplash.com/photo-1601924638867-3ec6f0f6dcb2?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Block Heel Sandals",
    category: "Sandals",
    collections: ["footwear", "sandals"],
    pricePence: 4600,
    colors: ["#111111", "#d3b894"],
    description:
      "Comfortable block heel sandals with a slim strap profile for occasion dressing and summer evenings.",
    imageUrl:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Pointed Suede Boots",
    category: "Boots",
    collections: ["footwear", "boots"],
    pricePence: 7800,
    originalPricePence: 9400,
    colors: ["#7a5646", "#1f1d1b"],
    badge: "Sale",
    description:
      "Pointed ankle boots with a soft suede-look finish and wearable heel height.",
    imageUrl:
      "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=900&q=85",
  },
];

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
  let upserted = 0;
  for (const product of products) {
    const slug = slugify(product.name);

    const variants = ["XS", "S", "M", "L", "XL", "XXL"].map((size, index) => ({
      size,
      stock: 8 + index,
    }));
    const images = [
      {
        url: product.imageUrl,
        storagePath: `seed-photo/${slug}`,
        order: 0,
      },
    ];

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
          $1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb,
          $11, 'active', $12, false, null, null, '[]'::jsonb, now(), now()
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
          status = 'active',
          featured = excluded.featured,
          model_preview_enabled = false,
          garment_category = null,
          ai_ready_garment_image_url = null,
          model_preview_images = '[]'::jsonb,
          updated_at = now()
      `,
      [
        product.name,
        slug,
        product.description,
        product.pricePence,
        product.originalPricePence || null,
        product.category,
        product.collections,
        product.colors,
        JSON.stringify(variants),
        JSON.stringify(images),
        product.badge || null,
        Boolean(product.featured),
      ]
    );
    upserted += 1;
  }

  const count = await client.query(
    "select count(*)::int as active_products from public.products where status = 'active'"
  );
  console.log(
    JSON.stringify(
      {
        seeded: upserted,
        activeProducts: count.rows[0].active_products,
        imageSource: "unsplash-demo-photos",
      },
      null,
      2
    )
  );
} finally {
  await client.end();
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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
