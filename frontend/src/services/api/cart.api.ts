import { client } from "./client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { products as localProducts } from "../../data/products";
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
  try {
    const res = await client.get("/api/v1/cart");
    return normalizeCartResponse(res.data);
  } catch {
    const raw = await AsyncStorage.getItem("demo_cart");
    const stored = raw ? JSON.parse(raw) : { id: "demo", items: [], subtotal: 0, tax: 0, shipping: 0, total: 0, itemCount: 0 };
    return mapCart(stored);
  }
}

export async function addItem(data: AddCartItemDTO): Promise<CartItem> {
  try {
    const res = await client.post("/api/v1/cart/items", data);
    const item = res.data.item || res.data;
    return mapItem(item);
  } catch {
    const raw = await AsyncStorage.getItem("demo_cart");
    const cart = raw ? JSON.parse(raw) : { id: "demo", items: [] as any[] };
    const product = localProducts.find(p => p.id === data.productId);
    if (!product) throw new Error("Product not found");
    const existing = cart.items.find((i: any) => i.productId === data.productId && i.variantId === (data.variantId || null));
    if (existing) {
      existing.quantity += data.quantity;
      existing.total = existing.quantity * (existing.price || product.price);
    } else {
      const it = {
        id: `ci_${Date.now()}`,
        productId: product.id,
        product,
        variantId: data.variantId || null,
        quantity: data.quantity,
        price: product.price,
        total: product.price * data.quantity
      };
      cart.items.push(it);
    }
    const mappedCart = recalc(cart);
    await AsyncStorage.setItem("demo_cart", JSON.stringify(mappedCart));
    return mapItem(mappedCart.items[mappedCart.items.length - 1]);
  }
}

export async function updateItemQuantity(itemId: string, quantity: number): Promise<CartItem> {
  try {
    const res = await client.patch(`/api/v1/cart/items/${encodeURIComponent(itemId)}`, { quantity });
    const item = res.data.item || res.data;
    return mapItem(item);
  } catch {
    const raw = await AsyncStorage.getItem("demo_cart");
    const cart = raw ? JSON.parse(raw) : { id: "demo", items: [] as any[] };
    const it = cart.items.find((x: any) => String(x.id) === String(itemId));
    if (!it) throw new Error("Item not found");
    it.quantity = Math.max(1, quantity);
    it.total = it.quantity * it.price;
    const mappedCart = recalc(cart);
    await AsyncStorage.setItem("demo_cart", JSON.stringify(mappedCart));
    return mapItem(it);
  }
}

export async function removeItem(itemId: string): Promise<void> {
  try {
    await client.delete(`/api/v1/cart/items/${encodeURIComponent(itemId)}`);
  } catch {
    const raw = await AsyncStorage.getItem("demo_cart");
    const cart = raw ? JSON.parse(raw) : { id: "demo", items: [] as any[] };
    cart.items = cart.items.filter((x: any) => String(x.id) !== String(itemId));
    const mappedCart = recalc(cart);
    await AsyncStorage.setItem("demo_cart", JSON.stringify(mappedCart));
  }
}

export async function clearCart(): Promise<void> {
  try {
    await client.delete(`/api/v1/cart`);
  } catch {
    await AsyncStorage.setItem("demo_cart", JSON.stringify({ id: "demo", items: [], subtotal: 0, tax: 0, shipping: 0, total: 0, itemCount: 0 }));
  }
}

export async function applyPromoCode(code: string): Promise<AppliedPromo> {
  try {
    const res = await client.post(`/api/v1/cart/promo`, { code });
    const p = res.data.promo || res.data;
    return {
      code: String(p.code || code),
      discountType: p.discountType || "fixed",
      discountValue: Number(p.discountValue || 0),
      discountAmount: Number(p.discountAmount || 0),
      description: String(p.description || "")
    };
  } catch {
    const raw = await AsyncStorage.getItem("demo_cart");
    const cart = raw ? JSON.parse(raw) : { id: "demo", items: [] as any[] };
    const sub = cart.items.reduce((s: number, it: any) => s + it.total, 0);
    const discountAmount = Math.round(sub * 0.1 * 100) / 100;
    cart.promo = {
      code,
      discountType: "percentage",
      discountValue: 10,
      discountAmount,
      description: "10% off demo promo"
    };
    const mappedCart = recalc(cart);
    await AsyncStorage.setItem("demo_cart", JSON.stringify(mappedCart));
    return mappedCart.promo!;
  }
}

export async function removePromoCode(): Promise<void> {
  try {
    await client.delete(`/api/v1/cart/promo`);
  } catch {
    const raw = await AsyncStorage.getItem("demo_cart");
    const cart = raw ? JSON.parse(raw) : { id: "demo", items: [] as any[] };
    delete cart.promo;
    const mappedCart = recalc(cart);
    await AsyncStorage.setItem("demo_cart", JSON.stringify(mappedCart));
  }
}

function recalc(cart: any) {
  const items = Array.isArray(cart.items) ? cart.items : [];
  const subtotal = items.reduce((s: number, it: any) => s + (it.total || 0), 0);
  const tax = 0;
  const shipping = 0;
  const promo = cart.promo;
  const total = subtotal + tax + shipping - (promo?.discountAmount || 0);
  const itemCount = items.reduce((n: number, it: any) => n + (it.quantity || 0), 0);
  return { id: cart.id || "demo", items, subtotal, tax, shipping, total, itemCount, promo };
}
