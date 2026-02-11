import { PrismaClient, ProductCategory } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Sample product data for e-commerce catalog
 */
const sampleProducts = [
    {
        name: "Hydrating Facial Serum",
        description: "A lightweight, fast-absorbing serum that delivers intense hydration and helps restore skin's moisture barrier. Perfect for all skin types.",
        brand: "GlowEssence",
        category: ProductCategory.SKINCARE,
        subCategory: "Serum",
        price: 45.99,
        compareAtPrice: 59.99,
        stock: 150,
        lowStockThreshold: 20,
        images: JSON.stringify([
            "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800",
            "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=alt"
        ]),
        thumbnailUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400",
        tags: JSON.stringify(["hydrating", "serum", "anti-aging", "hyaluronic acid"]),
        ingredients: "Water, Hyaluronic Acid, Glycerin, Niacinamide, Vitamin B5, Allantoin",
        benefits: JSON.stringify([
            "Deep hydration for up to 24 hours",
            "Reduces fine lines and wrinkles",
            "Improves skin texture",
            "Suitable for sensitive skin"
        ]),
        howToUse: "Apply 2-3 drops to clean, dry face morning and evening. Gently massage until fully absorbed. Follow with moisturizer.",
        isActive: true,
        isFeatured: true,
        rating: 4.7,
        reviewCount: 342,
        perfectCorpProductId: "PC-SER-001"
    },
    {
        name: "Matte Finish Foundation",
        description: "Long-lasting, full coverage foundation with a natural matte finish. Controls shine and minimizes pores for a flawless look.",
        brand: "BeautyPro",
        category: ProductCategory.MAKEUP,
        subCategory: "Foundation",
        price: 38.50,
        compareAtPrice: null,
        stock: 200,
        lowStockThreshold: 30,
        images: JSON.stringify([
            "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800",
            "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=alt"
        ]),
        thumbnailUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400",
        tags: JSON.stringify(["foundation", "matte", "full coverage", "long-lasting", "pore minimizing"]),
        ingredients: "Dimethicone, Water, Titanium Dioxide, Iron Oxides, Talc, SPF 15",
        benefits: JSON.stringify([
            "Full coverage that lasts 16+ hours",
            "Oil-free and non-comedogenic",
            "SPF 15 sun protection",
            "Available in 20 shades"
        ]),
        howToUse: "Shake well. Apply with brush, sponge, or fingers. Blend outward from center of face. Build coverage as desired.",
        isActive: true,
        isFeatured: true,
        rating: 4.5,
        reviewCount: 589,
        perfectCorpProductId: "PC-FND-002"
    },
    {
        name: "Velvet Matte Lipstick",
        description: "Rich, highly pigmented lipstick with a luxurious velvet matte finish. Comfortable wear without drying lips.",
        brand: "VividColor",
        category: ProductCategory.MAKEUP,
        subCategory: "Lipstick",
        price: 24.00,
        compareAtPrice: 32.00,
        stock: 300,
        lowStockThreshold: 50,
        images: JSON.stringify([
            "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800",
            "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&q=alt"
        ]),
        thumbnailUrl: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400",
        tags: JSON.stringify(["lipstick", "matte", "long-lasting", "vivid color", "vegan"]),
        ingredients: "Ricinus Communis Seed Oil, Candelilla Wax, Vitamin E, Natural Pigments",
        benefits: JSON.stringify([
            "Intense color payoff in one swipe",
            "Comfortable matte finish",
            "Infused with vitamin E",
            "Vegan and cruelty-free"
        ]),
        howToUse: "Apply directly to lips starting from the center and working outward. For precise application, use a lip liner first.",
        isActive: true,
        isFeatured: false,
        rating: 4.8,
        reviewCount: 1203,
        perfectCorpProductId: "PC-LIP-003"
    },
    {
        name: "Revitalizing Hair Oil",
        description: "Nourishing hair oil blend that repairs damage, adds shine, and tames frizz. Suitable for all hair types.",
        brand: "NatureLocks",
        category: ProductCategory.HAIRCARE,
        subCategory: "Hair Oil",
        price: 29.99,
        compareAtPrice: null,
        stock: 120,
        lowStockThreshold: 15,
        images: JSON.stringify([
            "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800",
            "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800&q=alt"
        ]),
        thumbnailUrl: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400",
        tags: JSON.stringify(["hair oil", "argan oil", "frizz control", "shine", "repair"]),
        ingredients: "Argan Oil, Coconut Oil, Jojoba Oil, Vitamin E, Rosemary Extract",
        benefits: JSON.stringify([
            "Deeply nourishes and repairs hair",
            "Adds natural shine without greasiness",
            "Controls frizz for up to 48 hours",
            "Heat protection up to 450°F"
        ]),
        howToUse: "Apply 2-4 drops to damp or dry hair, focusing on mid-lengths to ends. Style as usual. Can be used daily.",
        isActive: true,
        isFeatured: false,
        rating: 4.6,
        reviewCount: 427,
        perfectCorpProductId: null
    },
    {
        name: "Luxury Parfum - Midnight Rose",
        description: "An intoxicating blend of rose, vanilla, and musk. Long-lasting eau de parfum with sophisticated fragrance profile.",
        brand: "Essence Royale",
        category: ProductCategory.FRAGRANCE,
        subCategory: "Eau de Parfum",
        price: 89.00,
        compareAtPrice: 120.00,
        stock: 75,
        lowStockThreshold: 10,
        images: JSON.stringify([
            "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800",
            "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=alt"
        ]),
        thumbnailUrl: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400",
        tags: JSON.stringify(["perfume", "fragrance", "rose", "luxury", "long-lasting"]),
        ingredients: "Alcohol Denat., Fragrance, Water, Essential Oils",
        benefits: JSON.stringify([
            "8-10 hour lasting power",
            "Elegant and sophisticated scent",
            "Perfect for evening wear",
            "Beautifully packaged gift-ready bottle"
        ]),
        howToUse: "Spray on pulse points: wrists, neck, behind ears. For best results, apply to moisturized skin.",
        isActive: true,
        isFeatured: true,
        rating: 4.9,
        reviewCount: 156,
        perfectCorpProductId: null
    },
    {
        name: "Professional Makeup Brush Set",
        description: "Complete 12-piece professional makeup brush set with ultra-soft synthetic bristles. Includes storage case.",
        brand: "BeautyPro",
        category: ProductCategory.TOOLS,
        subCategory: "Brush Set",
        price: 64.99,
        compareAtPrice: 89.99,
        stock: 95,
        lowStockThreshold: 15,
        images: JSON.stringify([
            "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800",
            "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&q=alt"
        ]),
        thumbnailUrl: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400",
        tags: JSON.stringify(["makeup brushes", "professional", "brush set", "vegan", "tools"]),
        ingredients: "Synthetic Fibers, Wood Handles, Aluminum Ferrules",
        benefits: JSON.stringify([
            "12 essential brushes for complete looks",
            "Ultra-soft vegan bristles",
            "Durable and easy to clean",
            "Includes travel-friendly storage case"
        ]),
        howToUse: "Use each brush for its designated purpose. Clean regularly with brush cleanser. Store in case when traveling.",
        isActive: true,
        isFeatured: false,
        rating: 4.7,
        reviewCount: 284,
        perfectCorpProductId: null
    },
    {
        name: "Collagen Boost Supplements",
        description: "Premium marine collagen peptides for healthy skin, hair, and nails. Flavorless powder easily mixes in beverages.",
        brand: "VitalGlow",
        category: ProductCategory.SUPPLEMENTS,
        subCategory: "Collagen",
        price: 52.00,
        compareAtPrice: null,
        stock: 180,
        lowStockThreshold: 25,
        images: JSON.stringify([
            "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800",
            "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=alt"
        ]),
        thumbnailUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
        tags: JSON.stringify(["supplements", "collagen", "skin health", "hair growth", "beauty from within"]),
        ingredients: "Marine Collagen Peptides (Type I), Vitamin C, Hyaluronic Acid, Biotin",
        benefits: JSON.stringify([
            "Supports skin elasticity and hydration",
            "Promotes healthy hair and nail growth",
            "Reduces fine lines and wrinkles",
            "Highly bioavailable marine collagen"
        ]),
        howToUse: "Mix one scoop (10g) in water, coffee, smoothie, or juice daily. Best taken consistently for 8-12 weeks for visible results.",
        isActive: true,
        isFeatured: false,
        rating: 4.4,
        reviewCount: 512,
        perfectCorpProductId: null
    },
    {
        name: "Vitamin C Brightening Cream",
        description: "Powerful brightening moisturizer with 15% Vitamin C and niacinamide. Evens skin tone and boosts radiance.",
        brand: "GlowEssence",
        category: ProductCategory.SKINCARE,
        subCategory: "Moisturizer",
        price: 54.99,
        compareAtPrice: 68.00,
        stock: 110,
        lowStockThreshold: 20,
        images: JSON.stringify([
            "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800",
            "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=alt"
        ]),
        thumbnailUrl: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400",
        tags: JSON.stringify(["vitamin c", "brightening", "moisturizer", "anti-aging", "radiance"]),
        ingredients: "15% L-Ascorbic Acid, Niacinamide, Hyaluronic Acid, Ferulic Acid, Vitamin E",
        benefits: JSON.stringify([
            "Visibly brightens and evens skin tone",
            "Reduces dark spots and hyperpigmentation",
            "Boosts collagen production",
            "Provides antioxidant protection"
        ]),
        howToUse: "Apply to clean face morning and evening. Allow to absorb before applying sunscreen (AM) or night cream (PM).",
        isActive: true,
        isFeatured: true,
        rating: 4.6,
        reviewCount: 678,
        perfectCorpProductId: "PC-CRM-004"
    },
    {
        name: "Waterproof Gel Eyeliner",
        description: "Long-wearing gel eyeliner with intense black pigment. Waterproof and smudge-proof formula lasts all day.",
        brand: "VividColor",
        category: ProductCategory.MAKEUP,
        subCategory: "Eyeliner",
        price: 18.50,
        compareAtPrice: null,
        stock: 250,
        lowStockThreshold: 40,
        images: JSON.stringify([
            "https://images.unsplash.com/photo-1631214540787-40daa2336ea5?w=800",
            "https://images.unsplash.com/photo-1631214540787-40daa2336ea5?w=800&q=alt"
        ]),
        thumbnailUrl: "https://images.unsplash.com/photo-1631214540787-40daa2336ea5?w=400",
        tags: JSON.stringify(["eyeliner", "gel", "waterproof", "long-lasting", "black"]),
        ingredients: "Cyclopentasiloxane, Trimethylsiloxysilicate, Iron Oxides, Carnauba Wax",
        benefits: JSON.stringify([
            "24-hour waterproof wear",
            "Glides on smoothly without tugging",
            "Intense black color payoff",
            "Comes with precision brush"
        ]),
        howToUse: "Use included brush to apply along lash line. Can create both thin and dramatic looks. Remove with oil-based makeup remover.",
        isActive: true,
        isFeatured: false,
        rating: 4.5,
        reviewCount: 391,
        perfectCorpProductId: "PC-EYE-005"
    },
    {
        name: "Repairing Hair Mask",
        description: "Intensive deep conditioning treatment for damaged hair. Restores moisture, strength, and shine in just 5 minutes.",
        brand: "NatureLocks",
        category: ProductCategory.HAIRCARE,
        subCategory: "Hair Mask",
        price: 34.00,
        compareAtPrice: 42.00,
        stock: 140,
        lowStockThreshold: 20,
        images: JSON.stringify([
            "https://images.unsplash.com/photo-1571875257727-256c39da42af?w=800",
            "https://images.unsplash.com/photo-1571875257727-256c39da42af?w=800&q=alt"
        ]),
        thumbnailUrl: "https://images.unsplash.com/photo-1571875257727-256c39da42af?w=400",
        tags: JSON.stringify(["hair mask", "deep conditioning", "repair", "damaged hair", "keratin"]),
        ingredients: "Keratin, Argan Oil, Shea Butter, Coconut Oil, Pro-Vitamin B5",
        benefits: JSON.stringify([
            "Repairs damage from heat and color",
            "Restores moisture and elasticity",
            "Works in just 5 minutes",
            "Leaves hair soft and manageable"
        ]),
        howToUse: "After shampooing, apply generously to damp hair. Leave for 5-10 minutes. Rinse thoroughly. Use 1-2 times per week.",
        isActive: true,
        isFeatured: false,
        rating: 4.8,
        reviewCount: 724,
        perfectCorpProductId: null
    }
];

async function main() {
    console.log("🌱 Starting seed...");

    // Clear existing product data (optional - comment out if you want to keep existing data)
    console.log("🗑️  Clearing existing product data...");
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.cartItem.deleteMany({});
    await prisma.cart.deleteMany({});
    await prisma.product.deleteMany({});

    // Seed products
    console.log("📦 Seeding products...");
    for (const productData of sampleProducts) {
        const product = await prisma.product.create({
            data: productData
        });
        console.log(`✅ Created product: ${product.name} (${product.category})`);
    }

    console.log("✨ Seed completed successfully!");
    console.log(`📊 Total products created: ${sampleProducts.length}`);
}

main()
    .catch((e) => {
        console.error("❌ Error seeding database:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
