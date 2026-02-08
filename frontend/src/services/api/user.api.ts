import { client } from "./client";

type User = { id: string; email: string; name?: string; avatar?: string; profile?: Record<string, unknown> };

export async function updateProfile(data: { name?: string; phoneNumber?: string; dateOfBirth?: string; gender?: string }): Promise<{ user: User }> {
  const res = await client.patch<{ user: User }>("/api/v1/users/profile", data);
  return res.data;
}

export async function updatePreferences(data: { skinType?: string; skinTone?: string; preferences?: unknown }): Promise<{ user: User }> {
  const res = await client.patch<{ user: User }>("/api/v1/users/preferences", data);
  return res.data;
}

export async function uploadAvatar(file: { uri: string; name?: string; type?: string }): Promise<{ avatarUrl: string }> {
  const form = new FormData();
  form.append("image", { uri: file.uri, name: file.name || "avatar.jpg", type: file.type || "image/jpeg" } as any);
  const res = await client.post<{ avatarUrl: string }>("/api/v1/users/avatar", form);
  return res.data;
}

export async function getStats(): Promise<{ analyses: number; tryOns: number; favorites: number; totals: Record<string, number> }> {
  const res = await client.get<{ analyses: number; tryOns: number; favorites: number; totals: Record<string, number> }>("/api/v1/users/stats");
  return res.data;
}

export async function getHistory(): Promise<{ analyses: unknown[]; tryOns: unknown[] }> {
  const res = await client.get<{ analyses: unknown[]; tryOns: unknown[] }>("/api/v1/users/history");
  return res.data;
}

export async function deleteHistoryItem(id: string): Promise<{ message: string }> {
  const res = await client.delete<{ message: string }>(`/api/v1/users/history/${id}`);
  return res.data;
}
