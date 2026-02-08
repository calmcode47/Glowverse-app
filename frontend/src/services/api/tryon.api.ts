import { client } from "./client";

export type TryOn = {
  id: string;
  type: "LIPSTICK" | "EYESHADOW" | "BLUSH" | "FOUNDATION" | "HAIR_COLOR" | "FULL_MAKEUP";
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  originalImageUrl: string;
  resultImageUrl?: string;
  productId?: string;
  productName?: string;
  productBrand?: string;
  createdAt: string;
};

type TryOnCreate = {
  type: TryOn["type"];
  productId?: string;
  productName?: string;
  productBrand?: string;
  intensity?: number;
};

type Pagination = {
  page?: number;
  limit?: number;
  type?: TryOn["type"];
  status?: TryOn["status"];
};

export async function createTryOn(file: { uri: string; name?: string; type?: string }, data: TryOnCreate): Promise<{ tryOn: TryOn }> {
  const form = new FormData();
  form.append("image", { uri: file.uri, name: file.name || "tryon.jpg", type: file.type || "image/jpeg" } as any);
  Object.entries(data).forEach(([k, v]) => form.append(k, String(v)));
  const res = await client.post<{ tryOn: TryOn }>("/api/v1/tryon", form);
  return res.data;
}

export async function getTryOn(id: string): Promise<{ tryOn: TryOn }> {
  const res = await client.get<{ tryOn: TryOn }>(`/api/v1/tryon/${id}`);
  return res.data;
}

export async function getTryOns(params?: Pagination): Promise<{ items: TryOn[]; pagination?: unknown }> {
  const res = await client.get<{ items: TryOn[]; pagination?: unknown }>("/api/v1/tryon", { params });
  return res.data;
}

export async function deleteTryOn(id: string): Promise<{ message: string }> {
  const res = await client.delete<{ message: string }>(`/api/v1/tryon/${id}`);
  return res.data;
}

export async function saveFavorite(id: string): Promise<{ message: string; favorite?: unknown }> {
  const res = await client.post<{ message: string; favorite?: unknown }>(`/api/v1/tryon/${id}/favorite`);
  return res.data;
}
