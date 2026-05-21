export const SUMUP_CURRENCY = "GBP";
export const SUMUP_API_URL = "https://api.sumup.com/v0.1";

export const SHIPPING_RATES = {
  standard: { pence: 395, label: "Standard Delivery (3-5 days)" },
  nextDay: { pence: 695, label: "Next Day Delivery" },
  free: { pence: 0, label: "Free Delivery" },
} as const;

export const FREE_SHIPPING_THRESHOLD_PENCE = 5000; // Free shipping over £50

export const COLLECTIONS = [
  { slug: "new-arrivals", label: "New Arrivals" },
  { slug: "clothing", label: "Clothing" },
  { slug: "dresses", label: "Dresses" },
  { slug: "tops", label: "Tops" },
  { slug: "trousers", label: "Trousers" },
  { slug: "jumpsuits", label: "Jumpsuits" },
  { slug: "knitwear", label: "Knitwear" },
  { slug: "jackets-coats", label: "Jackets & Coats" },
  { slug: "accessories", label: "Accessories" },
  { slug: "bags", label: "Bags" },
  { slug: "jewellery", label: "Jewellery" },
  { slug: "scarves", label: "Scarves" },
  { slug: "belts", label: "Belts" },
  { slug: "hats", label: "Hats" },
  { slug: "gift-items", label: "Gift Items" },
  { slug: "gift-for-him", label: "Gift For Him" },
  { slug: "gift-for-her", label: "Gift For Her" },
  { slug: "baby-shower", label: "Baby Shower" },
  { slug: "weddings", label: "Weddings" },
  { slug: "birthdays", label: "Birthdays" },
  { slug: "mothers-day", label: "Mothers Day" },
  { slug: "fathers-day", label: "Fathers Day" },
  { slug: "footwear", label: "Footwear" },
  { slug: "sandals", label: "Sandals" },
  { slug: "heels", label: "Heels" },
  { slug: "flats", label: "Flats" },
  { slug: "boots", label: "Boots" },
  { slug: "sale", label: "Sale" },
] as const;

export const CATEGORIES = [
  "Dresses",
  "Tops",
  "Trousers",
  "Jumpsuits",
  "Knitwear",
  "Jackets & Coats",
  "Bags",
  "Jewellery",
  "Scarves",
  "Belts",
  "Hats",
  "Sandals",
  "Heels",
  "Flats",
  "Boots",
] as const;

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
