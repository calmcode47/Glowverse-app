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
  image: string; // Renamed from imageUri to match main product schema
  badge?: "Good" | "Our Brands" | "Offers";
  description?: string;
};

// ... (omitted charts) ...

export type ChartDataPoint = {
  label: string;
  value: number;
  color?: "orange" | "primary";
};

export const dashboardStats: { id: string; label: string; value: number }[] = [
  { id: "score", label: "Score", value: 89 },
  { id: "engagement", label: "Engagement", value: 72 }
];

export const brandChartData: ChartDataPoint[] = [
  { label: "A", value: 24, color: "primary" },
  { label: "B", value: 32, color: "orange" },
  { label: "C", value: 18, color: "primary" },
  { label: "D", value: 40, color: "orange" },
  { label: "E", value: 28, color: "primary" },
  { label: "F", value: 35, color: "orange" },
  { label: "G", value: 22, color: "primary" },
  { label: "H", value: 30, color: "orange" }
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
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&auto=format&fit=crop&q=80",
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
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80",
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
    image: "https://images.unsplash.com/photo-1593743284583-135800073e5e?w=600&auto=format&fit=crop&q=80",
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
    image: "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=600&auto=format&fit=crop&q=80",
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
    image: "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=600&auto=format&fit=crop&q=80",
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
    image: "https://images.unsplash.com/photo-1517130038641-a774d04afb3c?w=600&auto=format&fit=crop&q=80",
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
    image: "https://images.unsplash.com/photo-1626285861696-9f0bf5a49c6d?w=600&auto=format&fit=crop&q=80",
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
    image: "https://images.unsplash.com/photo-1615900119312-2acd3a71f344?w=600&auto=format&fit=crop&q=80",
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
    image: "https://images.unsplash.com/photo-1596462502278-27bfdd403348?w=600&auto=format&fit=crop&q=80",
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
    image: "https://images.unsplash.com/photo-1621607512214-68297480165e?w=600&auto=format&fit=crop&q=80",
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
    image: "https://images.unsplash.com/photo-1556228852-6d35a585d566?w=600&auto=format&fit=crop&q=80",
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
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80",
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
