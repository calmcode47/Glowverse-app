// Boys beauty products & accessories – mock data for Your Brand / SHOP

export type ProductCategory = "skincare" | "grooming" | "hair" | "fragrance" | "accessories" | "body";

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  price: number;
  rating: number;
  reviewCount: number;
  imageUri: string;
  badge?: "Good" | "Our Brands" | "Offers";
  description?: string;
};

export type ChartDataPoint = {
  label: string;
  value: number;
  color?: "primary" | "orange";
};

export type DashboardStat = {
  id: string;
  value: number | string;
  label?: string;
  icon?: "home" | "bell" | "user";
};

// Bar chart data – "Your Brand" analytics style
export const brandChartData: ChartDataPoint[] = [
  { label: "Jan", value: 18000, color: "primary" },
  { label: "Feb", value: 32000, color: "orange" },
  { label: "Mar", value: 25000, color: "primary" },
  { label: "Apr", value: 42000, color: "orange" },
  { label: "May", value: 38000, color: "primary" },
  { label: "Jun", value: 55000, color: "orange" },
  { label: "Jul", value: 48000, color: "primary" },
  { label: "Aug", value: 62000, color: "orange" },
];

export const categoryChartData: ChartDataPoint[] = [
  { label: "Skincare", value: 72, color: "orange" },
  { label: "Grooming", value: 58, color: "primary" },
  { label: "Hair", value: 45, color: "orange" },
  { label: "Accessories", value: 89, color: "primary" },
];

// Dashboard stats (43, 69, etc.)
export const dashboardStats: DashboardStat[] = [
  { id: "score", value: 43, label: "NAME" },
  { id: "engagement", value: 69, label: "Engagement" },
  { id: "notifications", value: "", icon: "bell" },
  { id: "profile", value: "", icon: "user" },
];

// Boys beauty & accessories – full mock catalog
export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Terminal Clean Face Wash",
    brand: "Your Brand",
    category: "skincare",
    price: 12.99,
    rating: 4.8,
    reviewCount: 234,
    imageUri: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
    badge: "Good",
    description: "Oil-control face wash for clear skin.",
  },
  {
    id: "2",
    name: "Stubble & Skin Balm",
    brand: "Your Brand",
    category: "grooming",
    price: 14.99,
    rating: 4.6,
    reviewCount: 189,
    imageUri: "https://images.unsplash.com/photo-1597939907322-a1d8491e4768?w=400",
    badge: "Our Brands",
    description: "Post-shave soothing balm.",
  },
  {
    id: "3",
    name: "Matte Clay Hair Styling",
    brand: "Your Brand",
    category: "hair",
    price: 16.99,
    rating: 4.9,
    reviewCount: 412,
    imageUri: "https://images.unsplash.com/photo-1522338243402-2f46124e2f28?w=400",
    badge: "Offers",
    description: "Strong hold, natural finish.",
  },
  {
    id: "4",
    name: "Daily Moisturizer SPF 15",
    brand: "Your Brand",
    category: "skincare",
    price: 18.99,
    rating: 4.7,
    reviewCount: 567,
    imageUri: "https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=400",
    badge: "Good",
    description: "Lightweight daily hydration.",
  },
  {
    id: "5",
    name: "Cologne Sport",
    brand: "Your Brand",
    category: "fragrance",
    price: 34.99,
    rating: 4.5,
    reviewCount: 98,
    imageUri: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400",
    badge: "Our Brands",
    description: "Fresh, long-lasting scent.",
  },
  {
    id: "6",
    name: "Gym Ring Set",
    brand: "Your Brand",
    category: "accessories",
    price: 24.99,
    rating: 4.8,
    reviewCount: 312,
    imageUri: "https://images.unsplash.com/photo-1611651338412-3f973b695fa0?w=400",
    badge: "Offers",
    description: "Durable silicone rings for active wear.",
  },
  {
    id: "7",
    name: "Beard Oil Blend",
    brand: "Your Brand",
    category: "grooming",
    price: 19.99,
    rating: 4.9,
    reviewCount: 445,
    imageUri: "https://images.unsplash.com/photo-1631730486572-9a8e857c5b8d?w=400",
    badge: "Good",
    description: "Nourishing beard and skin oil.",
  },
  {
    id: "8",
    name: "Face Roller & Gua Sha",
    brand: "Your Brand",
    category: "accessories",
    price: 22.99,
    rating: 4.6,
    reviewCount: 178,
    imageUri: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400",
    badge: "Our Brands",
    description: "Cooling jade roller set.",
  },
  {
    id: "9",
    name: "Charcoal Detox Mask",
    brand: "Your Brand",
    category: "skincare",
    price: 15.99,
    rating: 4.7,
    reviewCount: 223,
    imageUri: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400",
    badge: "Offers",
    description: "Deep pore cleansing mask.",
  },
  {
    id: "10",
    name: "Travel Grooming Kit",
    brand: "Your Brand",
    category: "accessories",
    price: 29.99,
    rating: 4.8,
    reviewCount: 156,
    imageUri: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400",
    badge: "Good",
    description: "Compact kit for on-the-go.",
  },
  {
    id: "11",
    name: "Hair & Body Wash 2-in-1",
    brand: "Your Brand",
    category: "body",
    price: 11.99,
    rating: 4.4,
    reviewCount: 892,
    imageUri: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
    badge: "Our Brands",
    description: "Time-saving 2-in-1 formula.",
  },
  {
    id: "12",
    name: "Sunglasses Classic",
    brand: "Your Brand",
    category: "accessories",
    price: 49.99,
    rating: 4.9,
    reviewCount: 267,
    imageUri: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400",
    badge: "Offers",
    description: "UV protection, timeless style.",
  },
];

// Category filter pills (Good, Our Brands, Offers)
export const shopCategories = [
  { id: "good", label: "Good" },
  { id: "our_brands", label: "Our Brands" },
  { id: "offers", label: "Offers" },
] as const;

// Featured / carousel items for dashboard
export const featuredCarouselItems = mockProducts.slice(0, 4);

// Shop list items (dark theme cards)
export const shopListItems = mockProducts.map((p) => ({
  id: p.id,
  title: p.name,
  subtitle: p.brand,
  icon: "cart" as const,
  badge: p.badge,
}));
