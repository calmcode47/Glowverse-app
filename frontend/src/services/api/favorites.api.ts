import { client } from "./client";
import type { Product } from "../../data/products";

export type Favorite = {
  id: string;
  productId: string;
  product: Product;
  createdAt: string;
};

function mapFavorite(f: any): Favorite {
  const p = f.product || {};
  const product: Product = {
    id: String(p.id || f.productId),
    name: String(p.name || ""),
    brand: String(p.brand || ""),
    category: String(p.category || "tech") as any,
    price: Number(p.price || 0),
    rating: Number(p.rating || 0),
    reviews: Number(p.reviews || 0),
    image: typeof p.imageUrl === "string" ? p.imageUrl : typeof p.image === "string" ? p.image : undefined,
    images: Array.isArray(p.images) ? p.images : undefined,
    description: String(p.description || ""),
    features: Array.isArray(p.features) ? p.features : [],
    inStock: p.stock === undefined ? true : Number(p.stock) > 0
  };
  return {
    id: String(f.id || f._id || ""),
    productId: String(f.productId || product.id),
    product,
    createdAt: String(f.createdAt || new Date().toISOString())
  };
}

export async function getFavorites(): Promise<Favorite[]> {
  const res = await client.get("/api/v1/favorites");
  const arr = Array.isArray(res.data.favorites) ? res.data.favorites : Array.isArray(res.data) ? res.data : [];
  return arr.map(mapFavorite);
}

export async function addFavorite(productId: string): Promise<Favorite> {
  const res = await client.post("/api/v1/favorites", { productId });
  const fav = res.data.favorite || res.data;
  return mapFavorite(fav);
}

export async function removeFavorite(favoriteId: string): Promise<void> {
  await client.delete(`/api/v1/favorites/${encodeURIComponent(favoriteId)}`);
}

export async function checkIsFavorite(productId: string): Promise<boolean> {
  try {
    const list = await getFavorites();
    return list.some((f) => f.productId === productId);
  } catch {
    return false;
  }
}
