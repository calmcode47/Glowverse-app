import { client } from "./client";
import type { Product as UIProduct } from "../../data/products";
import { products as localProducts, featuredProducts, newProducts, bestsellers } from "../../data/products";
import { requestDeduplicator } from "@utils/requestDeduplication";

export type ProductQueryParams = {
  page?: number;
  limit?: number;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "price_asc" | "price_desc" | "rating" | "newest";
  inStockOnly?: boolean;
};

export type ProductsResponse = {
  products: UIProduct[];
  total: number;
  page: number;
  totalPages: number;
};

function toThumb(url?: string, size = 400): string | undefined {
  if (!url) return url;
  try {
    const u = new URL(url);
    if (u.hostname.includes("res.cloudinary")) {
      const parts = u.pathname.split("/");
      const uploadIdx = parts.findIndex((p) => p === "upload");
      if (uploadIdx !== -1) {
        parts.splice(uploadIdx + 1, 0, `c_fill,w_${size},h_${size},q_auto,f_auto`);
        u.pathname = parts.join("/");
        return u.toString();
      }
    }
  } catch { }
  return url;
}

function mapApiProduct(p: any): UIProduct {
  const images: string[] =
    Array.isArray(p.images) && p.images.length
      ? p.images.map((x: any) => String(x))
      : p.imageUrl
        ? [String(p.imageUrl)]
        : p.image
          ? [String(p.image)]
          : [];
  const image = images[0] ? toThumb(images[0], 600) : undefined;
  return {
    id: String(p.id || p._id || p.uuid),
    name: String(p.name || p.title || ""),
    brand: String(p.brand || p.manufacturer || "Unknown"),
    category: String(p.category || "tech") as any,
    price: Number(p.price || p.currentPrice || 0),
    originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
    discount: p.discount ? Number(p.discount) : undefined,
    rating: Number(p.rating || p.avgRating || 0),
    reviews: Number(p.reviews || p.reviewCount || 0),
    image,
    images: images.map((u) => toThumb(u, 800)!) || [],
    description: String(p.description || ""),
    features: Array.isArray(p.features) ? p.features : [],
    inStock: p.stock === undefined ? true : Number(p.stock) > 0,
    isNew: Boolean(p.isNew || p.newArrival),
    isFeatured: Boolean(p.isFeatured),
    isBestseller: Boolean(p.isBestseller),
    colors: Array.isArray(p.colors) ? p.colors : undefined,
    sizes: Array.isArray(p.sizes) ? p.sizes : undefined,
    priceHistory: Array.isArray(p.priceHistory) ? p.priceHistory : undefined
  };
}

function normalizeList(res: any): { items: any[]; total: number; page: number; totalPages: number } {
  const items = Array.isArray(res.products) ? res.products : Array.isArray(res.items) ? res.items : [];
  const total = Number(res.total || res.count || items.length || 0);
  const page = Number(res.page || res.currentPage || 1);
  const totalPages = Number(res.pages || res.totalPages || Math.max(1, Math.ceil(total / (res.limit || 20))));
  return { items, total, page, totalPages };
}

export async function getProducts(params: ProductQueryParams = {}): Promise<ProductsResponse> {
  try {
    const res = await client.get("/api/v1/products", { params });
    const { items, total, page, totalPages } = normalizeList(res.data);
    return { products: items.map(mapApiProduct), total, page, totalPages };
  } catch {
    // Fallback to local data in dev/demo mode
    let items = [...localProducts];
    if (params.category) items = items.filter(p => p.category === params.category);
    if (params.brand) items = items.filter(p => p.brand.toLowerCase() === params.brand!.toLowerCase());
    if (typeof params.minPrice === "number") items = items.filter(p => p.price >= (params.minPrice as number));
    if (typeof params.maxPrice === "number") items = items.filter(p => p.price <= (params.maxPrice as number));
    if (params.inStockOnly) items = items.filter(p => p.inStock);
    const sortBy = params.sortBy || "newest";
    if (sortBy === "price_asc") items.sort((a, b) => a.price - b.price);
    else if (sortBy === "price_desc") items.sort((a, b) => b.price - a.price);
    else if (sortBy === "rating") items.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    // "newest" retains mock order
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const pageItems = items.slice(start, start + limit);
    return { products: pageItems, total, page, totalPages };
  }
}

export async function getProductById(id: string): Promise<UIProduct> {
  return requestDeduplicator.execute(`product:${id}`, async () => {
    try {
      const res = await client.get(`/api/v1/products/${id}`);
      const data = res.data.product || res.data || {};
      const mapped = mapApiProduct(data);
      return mapped;
    } catch {
      const found = localProducts.find(p => p.id === id);
      if (!found) throw new Error("Product not found");
      return found;
    }
  });
}

export async function searchProducts(query: string, filters?: Omit<ProductQueryParams, "page" | "limit" | "sortBy"> & { sortBy?: ProductQueryParams["sortBy"]; page?: number; limit?: number }): Promise<ProductsResponse> {
  try {
    const params: Record<string, any> = { q: query, ...filters };
    const res = await client.get("/api/v1/products/search", { params });
    const { items, total, page, totalPages } = normalizeList(res.data);
    return { products: items.map(mapApiProduct), total, page, totalPages };
  } catch {
    const q = (query || "").toLowerCase();
    let items = localProducts.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
    if (filters?.category) items = items.filter(p => p.category === filters.category);
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const pageItems = items.slice(start, start + limit);
    return { products: pageItems, total, page, totalPages };
  }
}

export async function getPopularSearches(): Promise<string[]> {
  try {
    const res = await client.get("/api/v1/search/popular");
    const arr = Array.isArray(res.data.items) ? res.data.items : Array.isArray(res.data) ? res.data : [];
    return arr.map((x: any) => String(x));
  } catch {
    // Fallback to popular brands/categories from local data
    const terms = Array.from(new Set(localProducts.flatMap(p => [p.brand, p.category, p.name.split(" ")[0]])));
    return terms.slice(0, 8);
  }
}

export async function getSearchSuggestions(q: string, limit = 8): Promise<string[]> {
  try {
    const res = await client.get("/api/v1/products/search", { params: { q, limit } });
    const { items } = normalizeList(res.data);
    const names = items.map((p: any) => String(p.name || p.title || ""));
    const uniq = Array.from(new Set(names));
    return uniq.slice(0, limit);
  } catch {
    const query = (q || "").toLowerCase();
    const matches = localProducts
      .map(p => p.name)
      .filter(name => name.toLowerCase().includes(query));
    return Array.from(new Set(matches)).slice(0, limit);
  }
}
export async function getProductsByCategory(category: string, params: Omit<ProductQueryParams, "category"> = {}): Promise<ProductsResponse> {
  try {
    const res = await client.get(`/api/v1/products/category/${encodeURIComponent(category)}`, { params });
    const { items, total, page, totalPages } = normalizeList(res.data);
    return { products: items.map(mapApiProduct), total, page, totalPages };
  } catch {
    let items = localProducts.filter(p => p.category === (category as any));
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const pageItems = items.slice(start, start + limit);
    return { products: pageItems, total, page, totalPages };
  }
}

export async function getFeaturedProducts(): Promise<UIProduct[]> {
  try {
    const res = await client.get("/api/v1/products/featured");
    const items = Array.isArray(res.data.products) ? res.data.products : [];
    return items.map(mapApiProduct);
  } catch {
    return featuredProducts;
  }
}

export async function getNewArrivals(): Promise<UIProduct[]> {
  try {
    const res = await client.get("/api/v1/products/new-arrivals");
    const items = Array.isArray(res.data.products) ? res.data.products : [];
    return items.map(mapApiProduct);
  } catch {
    return newProducts;
  }
}

export async function getBestsellers(): Promise<UIProduct[]> {
  try {
    const res = await client.get("/api/v1/products/bestsellers");
    const items = Array.isArray(res.data.products) ? res.data.products : [];
    return items.map(mapApiProduct);
  } catch {
    return bestsellers.length ? bestsellers : localProducts.slice(0, 10);
  }
}
