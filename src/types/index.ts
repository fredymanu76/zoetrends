export interface ProductImage {
  url: string;
  storagePath: string;
  order: number;
}

export interface ModelPreviewImage {
  url: string;
  angle: "front" | "side" | "back" | "detail";
  modelName: string;
  generatedAt: string;
  provider: string;
}

export interface ProductVariant {
  size: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  pricePence: number;
  originalPricePence?: number;
  category: string;
  collections: string[];
  colors: string[];
  variants: ProductVariant[];
  images: ProductImage[];
  badge?: string;
  status: "draft" | "active" | "archived";
  featured: boolean;
  modelPreviewEnabled?: boolean;
  garmentCategory?: GarmentCategory;
  aiReadyGarmentImageUrl?: string;
  modelPreviewImages?: ModelPreviewImage[];
  createdAt: string;
  updatedAt: string;
}

export type GarmentCategory =
  | "top"
  | "bottom"
  | "dress"
  | "jacket"
  | "full_outfit";

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  pricePence: number;
  size: string;
  color: string;
  quantity: number;
  image?: string;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  county?: string;
  postcode: string;
  country: string;
}

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "PROCESSING"
  | "DISPATCHED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export interface OrderItem {
  productId: string;
  name: string;
  slug: string;
  pricePence: number;
  size: string;
  color: string;
  quantity: number;
  image?: string;
}

export interface Order {
  id: string;
  orderCode: string;
  customerEmail: string;
  customerName: string;
  userId?: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotalPence: number;
  shippingPence: number;
  discountPence: number;
  totalPence: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  sumupCheckoutId?: string;
  discountCode?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export type DiscountType = "percentage" | "fixed";

export interface Discount {
  id: string;
  code: string;
  type: DiscountType;
  value: number;
  minimumOrderPence?: number;
  maxUses?: number;
  currentUses: number;
  active: boolean;
  validFrom: string;
  validUntil: string;
}
