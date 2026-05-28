export function formatPence(pence: number): string {
  const pounds = pence / 100;
  return `£${pounds.toFixed(2)}`;
}

export function generateOrderCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "ZT-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

export function categoryToCollectionSlug(category: string): string {
  return slugify(category);
}

export function categoryToCollectionSlugs(category: string): string[] {
  const slug = categoryToCollectionSlug(category);
  if (collectionContainsCategorySlug("clothing", slug)) return [slug, "clothing"];
  if (collectionContainsCategorySlug("accessories", slug)) return [slug, "accessories"];
  if (collectionContainsCategorySlug("footwear", slug)) return [slug, "footwear"];
  return slug ? [slug] : [];
}

export function collectionContainsCategorySlug(
  collectionSlug: string,
  categorySlug: string
): boolean {
  const children: Record<string, Set<string>> = {
    clothing: new Set([
      "dresses",
      "tops",
      "trousers",
      "jumpsuits",
      "knitwear",
      "jackets-coats",
    ]),
    accessories: new Set(["bags", "jewellery", "scarves", "belts", "hats"]),
    footwear: new Set(["sandals", "heels", "flats", "boots"]),
  };

  return children[collectionSlug]?.has(categorySlug) || false;
}

export function collectionMatchesProductSlugs(
  collectionSlug: string,
  productSlugs: string[]
): boolean {
  return productSlugs.some(
    (slug) =>
      slug === collectionSlug ||
      collectionContainsCategorySlug(collectionSlug, slug)
  );
}

export function formatSlug(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
