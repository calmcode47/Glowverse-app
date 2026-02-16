import type { Product } from "../data/products";
import type { MakeupProduct } from "../modules/ar-sdk/types";

export interface ARProduct {
  sdkProductId: string;
  type: 'lip' | 'eye' | 'cheek' | 'skin' | 'brow';
  colors: {
    primary: { r: number; g: number; b: number };
    secondary?: { r: number; g: number; b: number };
  };
  intensity: {
    default: number; // 0-100
    min: number;
    max: number;
  };
  texture?: string;
  finish?: 'matte' | 'glossy' | 'shimmer';
}

export function convertGlowverseProductToAR(product: Product): ARProduct {
  const hex = (product as any).colorHex || '#CC3366';
  const { r, g, b } = hexToRgb(hex);
  const type = mapCategory(product.category);
  const intensity = defaultIntensityFor(type);
  return {
    sdkProductId: product.id,
    type,
    colors: { primary: { r, g, b } },
    intensity,
    finish: finishFor(product),
    texture: (product as any).textureUrl || undefined
  };
}

export function arProductToMakeupProduct(ar: ARProduct): MakeupProduct {
  const color = `rgb(${ar.colors.primary.r}, ${ar.colors.primary.g}, ${ar.colors.primary.b})`;
  return {
    id: ar.sdkProductId,
    name: ar.sdkProductId,
    category: mapTypeToMakeupCategory(ar.type),
    brand: 'Glowverse',
    color,
    finish: ar.finish || 'matte',
    opacity: Math.max(0, Math.min(1, ar.intensity.default / 100)),
    textureUrl: ar.texture,
    vendorProductId: ar.sdkProductId
  };
}

function mapCategory(cat: string): ARProduct['type'] {
  const c = cat.toLowerCase();
  if (c.includes('lip')) return 'lip';
  if (c.includes('eye')) return 'eye';
  if (c.includes('blush')) return 'cheek';
  if (c.includes('foundation')) return 'skin';
  if (c.includes('brow')) return 'brow';
  return 'lip';
}

function mapTypeToMakeupCategory(t: ARProduct['type']): MakeupProduct['category'] {
  switch (t) {
    case 'lip': return 'lipstick';
    case 'eye': return 'eyeshadow';
    case 'cheek': return 'blush';
    case 'skin': return 'foundation';
    case 'brow': return 'eyeliner';
  }
}

function finishFor(product: Product): 'matte' | 'glossy' | 'shimmer' {
  const f = ((product as any).finish || '').toLowerCase();
  if (f.includes('gloss')) return 'glossy';
  if (f.includes('shimmer') || f.includes('sparkle')) return 'shimmer';
  return 'matte';
}

function defaultIntensityFor(type: ARProduct['type']): ARProduct['intensity'] {
  switch (type) {
    case 'lip': return { default: 80, min: 20, max: 100 };
    case 'eye': return { default: 70, min: 10, max: 100 };
    case 'cheek': return { default: 60, min: 10, max: 90 };
    case 'skin': return { default: 50, min: 30, max: 80 };
    case 'brow': return { default: 65, min: 20, max: 100 };
  }
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const num = parseInt(h, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

