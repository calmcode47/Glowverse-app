function insertTransform(url: string, transform: string): string {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("cloudinary")) return url;
    const parts = u.pathname.split("/");
    const idx = parts.findIndex((p) => p === "upload");
    if (idx !== -1) {
      parts.splice(idx + 1, 0, transform);
      u.pathname = parts.join("/");
      return u.toString();
    }
  } catch {}
  return url;
}

export type Preset = "thumb" | "detail" | "avatar";

export function transform(url: string, preset: Preset): string {
  const map: Record<Preset, string> = {
    thumb: "c_fill,w_300,h_300,q_auto,f_auto",
    detail: "c_fill,w_800,h_800,q_auto,f_auto",
    avatar: "c_fill,w_200,h_200,q_auto,f_auto"
  };
  return insertTransform(url, map[preset]);
}

export function lowRes(url: string): string {
  return insertTransform(url, "c_fill,w_30,h_30,q_auto,f_auto");
}

export function preload(urls: string[]) {
  if (typeof Image !== "undefined" && (Image as any).prefetch) {
    urls.forEach((u) => (Image as any).prefetch(u));
  }
}

type Options = {
  width?: number;
  height?: number;
  quality?: string | number; // 'auto' or numeric
  format?: string; // 'auto' | 'webp' | etc.
  crop?: string; // e.g., 'fill'
};

export function getCloudinaryUrl(url: string, opts: Options = {}): string {
  const parts: string[] = [];
  const crop = opts.crop || "c_fill";
  if (crop) parts.push(crop);
  if (opts.width) parts.push(`w_${Math.round(opts.width)}`);
  if (opts.height) parts.push(`h_${Math.round(opts.height)}`);
  parts.push(`q_${opts.quality ?? "auto"}`);
  parts.push(`f_${opts.format ?? "auto"}`);
  const tx = parts.join(",");
  return insertTransform(url, tx);
}
