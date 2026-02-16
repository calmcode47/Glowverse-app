import { client } from "./client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { products as localProducts } from "../../data/products";
import type { CartItem } from "./cart.api";
import type { Product } from "../../data/products";

export type OrderItem = {
  productId: string;
  variantId?: string;
  quantity: number;
  price?: number;
  product?: Product;
};

export type Order = {
  id: string;
  number?: string;
  status: "processing" | "shipped" | "delivered" | "cancelled" | "placed";
  items: Array<OrderItem>;
  subtotal: number;
  discount?: number;
  tax: number;
  shipping: number;
  total: number;
  createdAt: string;
  estimatedDelivery?: string;
  shippingAddress?: Address;
  paymentMethod?: string;
  trackingNumber?: string | null;
  timeline?: Array<{ step: string; at: string }>;
};

export type Address = {
  id: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
};

export type CreateOrderRequest = {
  items: Array<{ productId: string; variantId?: string; quantity: number }>;
  shippingAddressId: string;
  paymentMethod: string;
  promoCode?: string;
  notes?: string;
};

function mapAddress(a: any): Address {
  return {
    id: String(a.id || a._id || ""),
    fullName: String(a.fullName || a.name || ""),
    street: String(a.street || a.address1 || ""),
    city: String(a.city || ""),
    state: String(a.state || a.province || ""),
    postalCode: String(a.postalCode || a.zip || ""),
    country: String(a.country || ""),
    phone: a.phone ? String(a.phone) : undefined,
    isDefault: Boolean(a.isDefault)
  };
}

function mapOrder(o: any): Order {
  const items: Array<OrderItem> = Array.isArray(o.items)
    ? o.items.map((it: any) => ({
        productId: String(it.productId || it.product?.id || ""),
        variantId: it.variantId ? String(it.variantId) : undefined,
        quantity: Number(it.quantity || 1),
        price: Number(it.price || it.product?.price || 0),
        product: it.product as Product | undefined
      }))
    : [];
  return {
    id: String(o.id || o._id || ""),
    number: o.number ? String(o.number) : undefined,
    status: (String(o.status || "placed").toLowerCase() as Order["status"]),
    items,
    subtotal: Number(o.subtotal ?? items.reduce((s, it) => s + (it.price || 0) * it.quantity, 0)),
    discount: o.discount ? Number(o.discount) : undefined,
    tax: Number(o.tax ?? 0),
    shipping: Number(o.shipping ?? 0),
    total: Number(o.total ?? 0),
    createdAt: String(o.createdAt || new Date().toISOString()),
    estimatedDelivery: o.estimatedDelivery ? String(o.estimatedDelivery) : undefined,
    shippingAddress: o.shippingAddress ? mapAddress(o.shippingAddress) : undefined,
    paymentMethod: o.paymentMethod ? String(o.paymentMethod) : undefined,
    trackingNumber: o.trackingNumber ? String(o.trackingNumber) : null,
    timeline: Array.isArray(o.timeline) ? o.timeline : undefined
  };
}

export async function listOrders(): Promise<Order[]> {
  try {
    const res = await client.get("/api/v1/orders");
    const orders = Array.isArray(res.data.orders) ? res.data.orders : Array.isArray(res.data) ? res.data : [];
    return orders.map(mapOrder);
  } catch {
    const raw = await AsyncStorage.getItem("demo_orders");
    const arr = raw ? JSON.parse(raw) : [];
    return arr.map(mapOrder);
  }
}

export async function getOrderById(orderId: string): Promise<Order> {
  try {
    const res = await client.get(`/api/v1/orders/${encodeURIComponent(orderId)}`);
    return mapOrder(res.data.order || res.data);
  } catch {
    const raw = await AsyncStorage.getItem("demo_orders");
    const arr = raw ? JSON.parse(raw) : [];
    const found = arr.find((o: any) => String(o.id) === String(orderId));
    if (!found) throw new Error("Order not found");
    return mapOrder(found);
  }
}

export async function getOrderDetails(orderId: string): Promise<Order> {
  return await getOrderById(orderId);
}

export async function createOrder(payload: CreateOrderRequest): Promise<Order> {
  try {
    const res = await client.post("/api/v1/orders", payload);
    return mapOrder(res.data.order || res.data);
  } catch {
    const id = `order_${Date.now()}`;
    const items: Array<OrderItem> = payload.items.map((it) => {
      const p = localProducts.find((x) => x.id === it.productId);
      return { ...it, price: p?.price || 0, product: p };
    });
    const subtotal = items.reduce((s, it) => s + (it.price || 0) * it.quantity, 0);
    const order: Order = {
      id,
      number: id.slice(-8),
      status: "placed",
      items,
      subtotal,
      discount: 0,
      tax: 0,
      shipping: 0,
      total: subtotal,
      createdAt: new Date().toISOString(),
      paymentMethod: payload.paymentMethod,
    };
    const raw = await AsyncStorage.getItem("demo_orders");
    const arr = raw ? JSON.parse(raw) : [];
    arr.push(order);
    await AsyncStorage.setItem("demo_orders", JSON.stringify(arr));
    return order;
  }
}

export async function cancelOrder(orderId: string, reason?: string): Promise<Order> {
  try {
    const res = await client.patch(`/api/v1/orders/${encodeURIComponent(orderId)}`, { status: "cancelled", reason });
    return mapOrder(res.data.order || res.data);
  } catch {
    const raw = await AsyncStorage.getItem("demo_orders");
    const arr = raw ? JSON.parse(raw) : [];
    const idx = arr.findIndex((o: any) => String(o.id) === String(orderId));
    if (idx === -1) throw new Error("Order not found");
    arr[idx].status = "cancelled";
    await AsyncStorage.setItem("demo_orders", JSON.stringify(arr));
    return mapOrder(arr[idx]);
  }
}

export async function getUserAddresses(userId: string): Promise<Address[]> {
  try {
    const res = await client.get(`/api/v1/users/${encodeURIComponent(userId)}/addresses`);
    const arr = Array.isArray(res.data.addresses) ? res.data.addresses : Array.isArray(res.data) ? res.data : [];
    return arr.map(mapAddress);
  } catch {
    const raw = await AsyncStorage.getItem(`demo_addresses_${userId}`);
    const arr = raw ? JSON.parse(raw) : [];
    return arr.map(mapAddress);
  }
}

export function subscribeToOrderUpdates(orderId: string, onUpdate: (o: Order) => void): () => void {
  let cancelled = false;
  let lastStatus: string | undefined;
  const poll = async () => {
    if (cancelled) return;
    try {
      const o = await getOrderById(orderId);
      if (o.status !== lastStatus) {
        lastStatus = o.status;
        onUpdate(o);
      }
    } catch {}
    if (!cancelled) setTimeout(poll, 30000);
  };
  poll();
  return () => {
    cancelled = true;
  };
}

export async function trackShipment(orderId: string): Promise<{ trackingUrl?: string; trackingNumber?: string | null }> {
  const order = await getOrderById(orderId);
  const num = order.trackingNumber || null;
  if (!num) return { trackingNumber: null };
  const trackingUrl = num.startsWith("1Z")
    ? `https://www.ups.com/track?tracknum=${num}`
    : /^\d{12,14}$/.test(num)
    ? `https://www.fedex.com/fedextrack/?tracknumbers=${num}`
    : /^\d{20,22}$/.test(num)
    ? `https://tools.usps.com/go/TrackConfirmAction?tLabels=${num}`
    : `https://www.ups.com/track?tracknum=${num}`;
  return { trackingUrl, trackingNumber: num };
}

export async function reorder(orderId: string): Promise<number> {
  try {
    const order = await getOrderById(orderId);
    const items = Array.isArray(order.items) ? order.items : [];
    let added = 0;
    const { addItem } = await import("./cart.api");
    for (const it of items) {
      await addItem({ productId: it.productId, variantId: it.variantId, quantity: it.quantity });
      added += it.quantity;
    }
    return added;
  } catch {
    return 0;
  }
}

export async function addUserAddress(userId: string, address: Omit<Address, "id" | "isDefault"> & { isDefault?: boolean }): Promise<Address> {
  try {
    const res = await client.post(`/api/v1/users/${encodeURIComponent(userId)}/addresses`, address);
    return mapAddress(res.data.address || res.data);
  } catch {
    const raw = await AsyncStorage.getItem(`demo_addresses_${userId}`);
    const arr = raw ? JSON.parse(raw) : [];
    const a = { ...address, id: `addr_${Date.now()}` };
    if (a.isDefault) arr.forEach((x: any) => (x.isDefault = false));
    arr.push(a);
    await AsyncStorage.setItem(`demo_addresses_${userId}`, JSON.stringify(arr));
    return mapAddress(a);
  }
}

export async function updateUserAddress(userId: string, addressId: string, address: Partial<Omit<Address, "id">>): Promise<Address> {
  try {
    const res = await client.patch(`/api/v1/users/${encodeURIComponent(userId)}/addresses/${encodeURIComponent(addressId)}`, address);
    return mapAddress(res.data.address || res.data);
  } catch {
    const raw = await AsyncStorage.getItem(`demo_addresses_${userId}`);
    const arr = raw ? JSON.parse(raw) : [];
    const idx = arr.findIndex((x: any) => String(x.id) === String(addressId));
    if (idx >= 0) {
      arr[idx] = { ...arr[idx], ...address };
      await AsyncStorage.setItem(`demo_addresses_${userId}`, JSON.stringify(arr));
      return mapAddress(arr[idx]);
    }
    throw new Error("Address not found");
  }
}

export async function deleteUserAddress(userId: string, addressId: string): Promise<{ message?: string }> {
  try {
    const res = await client.delete(`/api/v1/users/${encodeURIComponent(userId)}/addresses/${encodeURIComponent(addressId)}`);
    return res.data;
  } catch {
    const raw = await AsyncStorage.getItem(`demo_addresses_${userId}`);
    const arr = raw ? JSON.parse(raw) : [];
    const next = arr.filter((x: any) => String(x.id) !== String(addressId));
    await AsyncStorage.setItem(`demo_addresses_${userId}`, JSON.stringify(next));
    return { message: "deleted" };
  }
}
