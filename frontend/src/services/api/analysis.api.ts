import { client } from "./client";

export type Analysis = {
  id: string;
  type: "SKIN_ANALYSIS" | "FACE_SHAPE" | "SKIN_TONE" | "HAIR_ANALYSIS";
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  originalImageUrl: string;
  processedImageUrl?: string;
  results?: unknown;
  createdAt: string;
};

type Pagination = {
  page?: number;
  limit?: number;
  type?: Analysis["type"];
  status?: Analysis["status"];
};

export async function createSkinAnalysis(file: { uri: string; name?: string; type?: string }): Promise<{ analysis: Analysis }> {
  const form = new FormData();
  form.append("image", { uri: file.uri, name: file.name || "analysis.jpg", type: file.type || "image/jpeg" } as any);
  const res = await client.post<{ analysis: Analysis }>("/api/v1/analysis/skin", form);
  return res.data;
}

export async function getAnalyses(params?: Pagination): Promise<{ analyses: Analysis[]; pagination?: unknown }> {
  const res = await client.get<{ analyses: Analysis[]; pagination?: unknown }>("/api/v1/analysis", { params });
  return res.data;
}

export async function getAnalysis(id: string): Promise<{ analysis: Analysis }> {
  const res = await client.get<{ analysis: Analysis }>(`/api/v1/analysis/${id}`);
  return res.data;
}

export async function getRecommendations(id: string): Promise<{ items: unknown[] } | { recommendations: unknown[] }> {
  const res = await client.get(`/api/v1/analysis/${id}/recommendations`);
  return res.data as any;
}

export async function deleteAnalysis(id: string): Promise<{ message: string }> {
  const res = await client.delete<{ message: string }>(`/api/v1/analysis/${id}`);
  return res.data;
}
