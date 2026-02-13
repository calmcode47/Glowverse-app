import { client } from "./client";
import type { Product } from "../../data/products";

export type Variant = { id: string; name?: string; color?: string; size?: string };

export type CartItem = {
  id: string;
  productId: string;
  product: Product;
  variantId?: string;
  variant?: Variant;
  quantity: number;
  price: number;
  total: number;
};

export type AppliedPromo = {
  code: string;
  discountType: "percentage" | "fixed" | "free_shipping";
  discountValue: number;
  discountAmount: number;
  description: string;
};

export type Cart = {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  itemCount: number;
  promo?: AppliedPromo;
};

export type AddCartItemDTO = {
  productId: string;
  variantId?: string;
  quantity: number;
};

function mapItem(i: any): CartItem {
  const p = i.product || {};
  const product: Product = {
    id: String(p.id || i.productId),
    name: String(p.name || ""),
    brand: String(p.brand || ""),
    category: String(p.category || "tech") as any,
    price: Number(p.price || i.price || 0),
    rating: Number(p.rating || 0),
    reviews: Number(p.reviews || 0),
    image: typeof p.imageUrl === "string" ? p.imageUrl : typeof p.image === "string" ? p.image : undefined,
    images: Array.isArray(p.images) ? p.images : undefined,
    description: String(p.description || ""),
    features: Array.isArray(p.features) ? p.features : [],
    inStock: p.stock === undefined ? true : Number(p.stock) > 0
  };
  return {
    id: String(i.id || i.itemId || i._id),
    productId: String(i.productId || product.id),
    product,
    variantId: i.variantId ? String(i.variantId) : undefined,
    variant: i.variant ? (i.variant as Variant) : undefined,
    quantity: Number(i.quantity || 1),
    price: Number(i.price || product.price || 0),
    total: Number(i.total || (i.price || product.price || 0) * (i.quantity || 1))
  };
}

function mapCart(c: any): Cart {
  const items: CartItem[] = Array.isArray(c.items) ? c.items.map(mapItem) : [];
  const subtotal = Number(c.subtotal ?? items.reduce((s: number, it: CartItem) => s + it.total, 0));
  const tax = Number(c.tax ?? 0);
  const shipping = Number(c.shipping ?? 0);
  const promo: AppliedPromo | undefined = c.promo
    ? {
        code: String(c.promo.code || ""),
        discountType: c.promo.discountType || "fixed",
        discountValue: Number(c.promo.discountValue || 0),
        discountAmount: Number(c.promo.discountAmount || 0),
        description: String(c.promo.description || "")
      }
    : undefined;
  const total = Number(c.total ?? subtotal + tax + shipping - (promo?.discountAmount || 0));
  const itemCount = Number(c.itemCount ?? items.reduce((n: number, it: CartItem) => n + it.quantity, 0));
  return {
    id: String(c.id || c.cartId || ""),
    items,
    subtotal,
    tax,
    shipping,
    total,
    itemCount,
    promo
  };
}

function normalizeCartResponse(d: any): Cart {
  const c = d.cart || d;
  return mapCart(c);
}

export async function getCart(): Promise<Cart> {
  const res = await client.get("/api/v1/cart");
  return normalizeCartResponse(res.data);
}

export async function addItem(data: AddCartItemDTO): Promise<CartItem> {
  const res = await client.post("/api/v1/cart/items", data);
  const item = res.data.item || res.data;
  return mapItem(item);
}

export async function updateItemQuantity(itemId: string, quantity: number): Promise<CartItem> {
  const res = await client.patch(`/api/v1/cart/items/${encodeURIComponent(itemId)}`, { quantity });
  const item = res.data.item || res.data;
  return mapItem(item);
}

export async function removeItem(itemId: string): Promise<void> {
  await client.delete(`/api/v1/cart/items/${encodeURIComponent(itemId)}`);
}

export async function clearCart(): Promise<void> {
  await client.delete(`/api/v1/cart`);
}

export async function applyPromoCode(code: string): Promise<AppliedPromo> {
  const res = await client.post(`/api/v1/cart/promo`, { code });
  const p = res.data.promo || res.data;
  return {
    code: String(p.code || code),
    discountType: p.discountType || "fixed",
    discountValue: Number(p.discountValue || 0),
    discountAmount: Number(p.discountAmount || 0),
    description: String(p.description || "")
  };
}

export async function removePromoCode(): Promise<void> {
  await client.delete(`/api/v1/cart/promo`);
}
