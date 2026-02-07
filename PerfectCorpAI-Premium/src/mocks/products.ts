export interface ProductVariant {
  id: string;
  name: string;
  tone?: string;
  texture?: 'gel' | 'cream' | 'foam' | 'oil';
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  rating: number;
  description: string;
  benefits: string[];
  routines: string[];
  variants: ProductVariant[];
  heroColor: string;
}

export const MEN_PRODUCTS: Product[] = [
  {
    id: 'daily_cleanser',
    name: 'Iron Cleanse',
    brand: 'Forge',
    price: 19.99,
    rating: 4.7,
    description: 'High-performance daily cleanser removes sweat, grime, and oil without stripping.',
    benefits: ['Deep Clean', 'pH Balanced', 'Non-Drying'],
    routines: ['AM: Cleanse', 'PM: Cleanse', 'Post-Workout: Quick Rinse'],
    variants: [
      { id: 'gel', name: 'Gel', texture: 'gel' },
      { id: 'foam', name: 'Foam', texture: 'foam' }
    ],
    heroColor: '#FF6B2C'
  },
  {
    id: 'beard_oil',
    name: 'Steel Beard Oil',
    brand: 'Alpha',
    price: 24.99,
    rating: 4.8,
    description: 'Condition and strengthen beard with lightweight oil blend.',
    benefits: ['Softens', 'Tames', 'Adds Shine'],
    routines: ['PM: Apply 3-5 drops', 'Pre-Work: Minimal grooming'],
    variants: [
      { id: 'classic', name: 'Classic', texture: 'oil' },
      { id: 'citrus', name: 'Citrus', texture: 'oil' }
    ],
    heroColor: '#00C9FF'
  },
  {
    id: 'moisturizer_spf',
    name: 'Titan Shield SPF 30',
    brand: 'Prime',
    price: 29.99,
    rating: 4.6,
    description: 'Matte moisturizer with sun protection for daily performance.',
    benefits: ['Hydrates', 'SPF 30', 'Matte Finish'],
    routines: ['AM: Apply after cleanse', 'Pre-Outdoor: Reapply'],
    variants: [
      { id: 'light', name: 'Light Tone', tone: 'light', texture: 'cream' },
      { id: 'medium', name: 'Medium Tone', tone: 'medium', texture: 'cream' },
      { id: 'deep', name: 'Deep Tone', tone: 'deep', texture: 'cream' }
    ],
    heroColor: '#B4FF39'
  }
];
