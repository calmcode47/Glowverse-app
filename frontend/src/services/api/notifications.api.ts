import { client } from "./client";

export type NotificationType = "order" | "promo" | "product" | "system" | "social";
export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  deepLink?: string;
};

function map(n: any): AppNotification {
  return {
    id: String(n.id || n._id || ""),
    type: (String(n.type || "system").toLowerCase() as NotificationType),
    title: String(n.title || ""),
    message: String(n.message || ""),
    createdAt: String(n.createdAt || new Date().toISOString()),
    read: Boolean(n.read),
    deepLink: n.deepLink ? String(n.deepLink) : undefined
  };
}

export async function list(): Promise<AppNotification[]> {
  const res = await client.get("/api/v1/notifications");
  const arr = Array.isArray(res.data.notifications) ? res.data.notifications : Array.isArray(res.data) ? res.data : [];
  return arr.map(map);
}

export async function markRead(id: string): Promise<void> {
  await client.patch(`/api/v1/notifications/${encodeURIComponent(id)}/read`);
}

export async function markAllRead(): Promise<void> {
  await client.patch("/api/v1/notifications/read-all");
}

export async function remove(id: string): Promise<void> {
  await client.delete(`/api/v1/notifications/${encodeURIComponent(id)}`);
}

export async function clearAll(): Promise<void> {
  await client.delete("/api/v1/notifications");
}
