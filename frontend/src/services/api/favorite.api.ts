import { client } from "./client";

type Favorite = {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  productBrand?: string;
  productCategory?: string;
  productImageUrl?: string;
  price?: number;
  notes?: string;
  tags?: string[];
  createdAt: string;
};

type Pagination = { page?: number; limit?: number; category?: string };

export async function getAllFavorites(params?: Pagination): Promise<{ favorites: Favorite[]; pagination?: unknown }> {
  const res = await client.get<{ favorites: Favorite[]; pagination?: unknown }>("/api/v1/favorites", { params });
  return res.data;
}

export async function addFavorite(data: { productId: string; productName: string; productBrand?: string; productCategory?: string; productImageUrl?: string; price?: number }): Promise<{ favorite: Favorite }> {
  const res = await client.post<{ favorite: Favorite }>("/api/v1/favorites", data);
  return res.data;
}

export async function removeFavorite(productId: string): Promise<{ message: string }> {
  const res = await client.delete<{ message: string }>(`/api/v1/favorites/${productId}`);
  return res.data;
}

export async function updateFavorite(productId: string, data: { notes?: string; tags?: string[] }): Promise<{ favorite: Favorite }> {
  const res = await client.patch<{ favorite: Favorite }>(`/api/v1/favorites/${productId}`, data);
  return res.data;
}

export async function searchProducts(query: { keyword?: string; category?: string; skinType?: string; limit?: number }): Promise<{ products: unknown[] }> {
  const res = await client.get<{ products: unknown[] }>("/api/v1/favorites/products/search", { params: query });
  return res.data;
}

export async function getRecommendations(): Promise<{ recommendations: unknown[] }> {
  const res = await client.get<{ recommendations: unknown[] }>("/api/v1/favorites/products/recommendations");
  return res.data;
}
