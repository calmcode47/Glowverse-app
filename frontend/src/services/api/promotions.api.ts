import { client } from "./client";

export type Promotion = {
  id: string;
  title: string;
  description?: string;
  code?: string;
  discountLabel?: string;
  image?: string;
  termsUrl?: string;
  expiresAt?: string;
  featured?: boolean;
};

function map(p: any): Promotion {
  return {
    id: String(p.id || p._id || ""),
    title: String(p.title || ""),
    description: p.description ? String(p.description) : undefined,
    code: p.code ? String(p.code) : undefined,
    discountLabel: p.discountLabel ? String(p.discountLabel) : (p.discount ? `${p.discount}% OFF` : undefined),
    image: p.imageUrl || p.image || undefined,
    termsUrl: p.termsUrl ? String(p.termsUrl) : undefined,
    expiresAt: p.expiresAt ? String(p.expiresAt) : undefined,
    featured: Boolean(p.featured)
  };
}

export async function listPromotions(): Promise<Promotion[]> {
  const res = await client.get("/api/v1/promotions");
  const arr = Array.isArray(res.data.promotions) ? res.data.promotions : Array.isArray(res.data) ? res.data : [];
  return arr.map(map);
}
