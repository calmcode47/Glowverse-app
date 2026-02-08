// Mock Product Data for Glowverse

export interface Product {
    id: string;
    name: string;
    brand: string;
    category: 'sunglasses' | 'watches' | 'clothes' | 'shoes' | 'gym' | 'tech';
    price: number;
    originalPrice?: number;
    discount?: number;
    rating: number;
    reviews: number;
    image?: string;
    images?: string[];
    description: string;
    features: string[];
    inStock: boolean;
    isNew?: boolean;
    isFeatured?: boolean;
    isBestseller?: boolean;
    colors?: string[];
    sizes?: string[];
}

export const products: Product[] = [
    // Sunglasses
    {
        id: 'sg-001',
        name: 'Aviator Classic',
        brand: 'Ray-Ban',
        category: 'sunglasses',
        price: 159.99,
        originalPrice: 199.99,
        discount: 20,
        rating: 4.8,
        reviews: 234,
        description: 'Iconic aviator sunglasses with premium UV protection',
        features: ['100% UV Protection', 'Polarized Lenses', 'Metal Frame'],
        inStock: true,
        isFeatured: true,
        colors: ['Black', 'Gold', 'Silver'],
    },
    {
        id: 'sg-002',
        name: 'Wayfarer Sport',
        brand: 'Oakley',
        category: 'sunglasses',
        price: 189.99,
        rating: 4.9,
        reviews: 456,
        description: 'Sports performance sunglasses for active lifestyle',
        features: ['Impact Resistant', 'Anti-Glare', 'Lightweight'],
        inStock: true,
        isNew: true,
        colors: ['Black', 'Blue', 'Red'],
    },
    {
        id: 'sg-003',
        name: 'Round Vintage',
        brand: 'Persol',
        category: 'sunglasses',
        price: 249.99,
        rating: 4.7,
        reviews: 189,
        description: 'Vintage-inspired round frame sunglasses',
        features: ['Crystal Lenses', 'Acetate Frame', 'Italian Design'],
        inStock: true,
        colors: ['Tortoise', 'Black', 'Brown'],
    },

    // Watches
    {
        id: 'w-001',
        name: 'Chronograph Pro',
        brand: 'Fossil',
        category: 'watches',
        price: 295.00,
        originalPrice: 350.00,
        discount: 16,
        rating: 4.6,
        reviews: 567,
        description: 'Premium chronograph with leather strap',
        features: ['Water Resistant 50m', 'Date Display', 'Leather Band'],
        inStock: true,
        isFeatured: true,
        isBestseller: true,
        colors: ['Brown', 'Black'],
    },
    {
        id: 'w-002',
        name: 'Smart Watch Elite',
        brand: 'Samsung',
        category: 'watches',
        price: 399.99,
        rating: 4.8,
        reviews: 892,
        description: 'Advanced smartwatch with fitness tracking',
        features: ['Heart Rate Monitor', 'GPS', 'Water Proof', '5 Day Battery'],
        inStock: true,
        isNew: true,
        colors: ['Black', 'Silver', 'Rose Gold'],
    },
    {
        id: 'w-003',
        name: 'Diver Automatic',
        brand: 'Seiko',
        category: 'watches',
        price: 525.00,
        rating: 4.9,
        reviews: 324,
        description: 'Automatic diver watch with 200m water resistance',
        features: ['Automatic Movement', 'Luminous Hands', 'Rotating Bezel'],
        inStock: true,
        colors: ['Blue', 'Black'],
    },

    // Clothes
    {
        id: 'c-001',
        name: 'Performance Polo',
        brand: 'Nike',
        category: 'clothes',
        price: 65.00,
        originalPrice: 85.00,
        discount: 24,
        rating: 4.5,
        reviews: 445,
        description: 'Moisture-wicking polo for active days',
        features: ['Dri-FIT Technology', 'Breathable', 'Stretch Fabric'],
        inStock: true,
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: ['Black', 'Navy', 'White', 'Gray'],
    },
    {
        id: 'c-002',
        name: 'Slim Fit Jeans',
        brand: 'Levi\'s',
        category: 'clothes',
        price: 89.99,
        rating: 4.7,
        reviews: 678,
        description: 'Classic slim fit denim jeans',
        features: ['Stretch Denim', 'Fade Resistant', 'Reinforced Pockets'],
        inStock: true,
        isBestseller: true,
        sizes: ['30', '32', '34', '36', '38'],
        colors: ['Dark Blue', 'Light Blue', 'Black'],
    },
    {
        id: 'c-003',
        name: 'Athletic Hoodie',
        brand: 'Adidas',
        category: 'clothes',
        price: 75.00,
        rating: 4.6,
        reviews: 523,
        description: 'Comfortable hoodie for workouts and casual wear',
        features: ['Cotton Blend', 'Kangaroo Pocket', 'Adjustable Hood'],
        inStock: true,
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Black', 'Gray', 'Navy'],
    },

    // Shoes
    {
        id: 'sh-001',
        name: 'Running Boost',
        brand: 'Adidas',
        category: 'shoes',
        price: 140.00,
        originalPrice: 180.00,
        discount: 22,
        rating: 4.8,
        reviews: 789,
        description: 'High-performance running shoes with boost technology',
        features: ['Boost Midsole', 'Breathable Mesh', 'Torsion System'],
        inStock: true,
        isFeatured: true,
        sizes: ['8', '9', '10', '11', '12'],
        colors: ['Black/White', 'Blue', 'Red'],
    },
    {
        id: 'sh-002',
        name: 'Classic Sneakers',
        brand: 'Nike',
        category: 'shoes',
        price: 110.00,
        rating: 4.7,
        reviews: 1234,
        description: 'Timeless sneakers for everyday style',
        features: ['Air Cushioning', 'Rubber Sole', 'Leather Upper'],
        inStock: true,
        isBestseller: true,
        sizes: ['7', '8', '9', '10', '11', '12'],
        colors: ['White', 'Black', 'Navy'],
    },
    {
        id: 'sh-003',
        name: 'Formal Oxfords',
        brand: 'Clarks',
        category: 'shoes',
        price: 129.99,
        rating: 4.6,
        reviews: 345,
        description: 'Premium leather oxford shoes for formal occasions',
        features: ['Genuine Leather', 'Cushioned Insole', 'Non-Slip Sole'],
        inStock: true,
        sizes: ['8', '9', '10', '11', '12'],
        colors: ['Black', 'Brown', 'Tan'],
    },

    // Gym
    {
        id: 'g-001',
        name: 'Resistance Bands Set',
        brand: 'TRX',
        category: 'gym',
        price: 34.99,
        originalPrice: 49.99,
        discount: 30,
        rating: 4.7,
        reviews: 567,
        description: 'Complete resistance band set for home workouts',
        features: ['5 Resistance Levels', 'Door Anchor', 'Carrying Bag'],
        inStock: true,
        isNew: true,
    },
    {
        id: 'g-002',
        name: 'Protein Shaker',
        brand: 'BlenderBottle',
        category: 'gym',
        price: 12.99,
        rating: 4.5,
        reviews: 890,
        description: 'Leak-proof shaker bottle with mixing ball',
        features: ['28oz Capacity', 'BPA Free', 'Dishwasher Safe'],
        inStock: true,
        colors: ['Black', 'Blue', 'Red', 'Green'],
    },
    {
        id: 'g-003',
        name: 'Wireless Earbuds Sport',
        brand: 'Jaybird',
        category: 'gym',
        price: 99.99,
        rating: 4.8,
        reviews: 445,
        description: 'Sweat-proof wireless earbuds for workouts',
        features: ['8hr Battery', 'Secure Fit', 'Water Resistant'],
        inStock: true,
        isFeatured: true,
        colors: ['Black', 'Blue'],
    },

    // Tech
    {
        id: 't-001',
        name: 'Wireless Charger',
        brand: 'Anker',
        category: 'tech',
        price: 29.99,
        originalPrice: 39.99,
        discount: 25,
        rating: 4.6,
        reviews: 678,
        description: 'Fast wireless charging pad for all devices',
        features: ['15W Fast Charge', 'Non-Slip Surface', 'LED Indicator'],
        inStock: true,
        colors: ['Black', 'White'],
    },
    {
        id: 't-002',
        name: 'Bluetooth Speaker',
        brand: 'JBL',
        category: 'tech',
        price: 79.99,
        rating: 4.8,
        reviews: 1123,
        description: 'Portable waterproof bluetooth speaker',
        features: ['12hr Battery', 'IPX7 Waterproof', '360° Sound'],
        inStock: true,
        isBestseller: true,
        colors: ['Black', 'Blue', 'Red'],
    },
    {
        id: 't-003',
        name: 'Phone Case Pro',
        brand: 'OtterBox',
        category: 'tech',
        price: 49.99,
        rating: 4.7,
        reviews: 567,
        description: 'Military-grade protection phone case',
        features: ['Drop Protection', 'Slim Design', 'Wireless Charging'],
        inStock: true,
        colors: ['Black', 'Blue', 'Clear'],
    },
];

export const featuredProducts = products.filter(p => p.isFeatured);
export const newProducts = products.filter(p => p.isNew);
export const bestsellers = products.filter(p => p.isBestseller);

export const categories = [
    { id: 'sunglasses', name: 'Sunglasses', icon: 'sunglasses', color: '#FFD700' },
    { id: 'watches', name: 'Watches', icon: 'watch', color: '#C0C0C0' },
    { id: 'clothes', name: 'Clothes', icon: 'tshirt-crew', color: '#00D9FF' },
    { id: 'shoes', name: 'Shoes', icon: 'shoe-sneaker', color: '#FF6B35' },
    { id: 'gym', name: 'Gym', icon: 'dumbbell', color: '#39FF14' },
    { id: 'tech', name: 'Tech', icon: 'devices', color: '#B537F2' },
] as const;
