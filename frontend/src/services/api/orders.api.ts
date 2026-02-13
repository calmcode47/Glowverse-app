import { client } from "./client";
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
  const res = await client.get("/api/v1/orders");
  const orders = Array.isArray(res.data.orders) ? res.data.orders : Array.isArray(res.data) ? res.data : [];
  return orders.map(mapOrder);
}

export async function getOrderById(orderId: string): Promise<Order> {
  const res = await client.get(`/api/v1/orders/${encodeURIComponent(orderId)}`);
  return mapOrder(res.data.order || res.data);
}

export async function createOrder(payload: CreateOrderRequest): Promise<Order> {
  const res = await client.post("/api/v1/orders", payload);
  return mapOrder(res.data.order || res.data);
}

export async function cancelOrder(orderId: string): Promise<Order> {
  const res = await client.patch(`/api/v1/orders/${encodeURIComponent(orderId)}`, { status: "cancelled" });
  return mapOrder(res.data.order || res.data);
}

export async function getUserAddresses(userId: string): Promise<Address[]> {
  const res = await client.get(`/api/v1/users/${encodeURIComponent(userId)}/addresses`);
  const arr = Array.isArray(res.data.addresses) ? res.data.addresses : Array.isArray(res.data) ? res.data : [];
  return arr.map(mapAddress);
}

export async function addUserAddress(userId: string, address: Omit<Address, "id" | "isDefault"> & { isDefault?: boolean }): Promise<Address> {
  const res = await client.post(`/api/v1/users/${encodeURIComponent(userId)}/addresses`, address);
  return mapAddress(res.data.address || res.data);
}

export async function updateUserAddress(userId: string, addressId: string, address: Partial<Omit<Address, "id">>): Promise<Address> {
  const res = await client.patch(`/api/v1/users/${encodeURIComponent(userId)}/addresses/${encodeURIComponent(addressId)}`, address);
  return mapAddress(res.data.address || res.data);
}

export async function deleteUserAddress(userId: string, addressId: string): Promise<{ message?: string }> {
  const res = await client.delete(`/api/v1/users/${encodeURIComponent(userId)}/addresses/${encodeURIComponent(addressId)}`);
  return res.data;
}
