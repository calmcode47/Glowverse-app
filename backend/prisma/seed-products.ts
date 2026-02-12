
import { PrismaClient, ProductCategory, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const brands = [
    "GlowLab", "PureBeauty", "LuxeSkin", "RadiantLife", "BeautyEssence",
    "NaturalGlow", "VitalityBeauty", "PerfectSkin", "EssenceBeauty", "LuminousLife"
];

const getRandomBrand = () => brands[Math.floor(Math.random() * brands.length)];
const getRandomPrice = (min: number, max: number) => Number((Math.random() * (max - min) + min).toFixed(2));
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const sixMonthsAgo = new Date();
sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

// Helper to create product data
const createProduct = (
    name: string,
    category: ProductCategory,
    subCategory: string,
    priceMin: number,
    priceMax: number,
    description: string,
    shortDesc: string,
    index: number,
    tags: string[],
    benefits: string[],
    howToUse: string,
    ingredients: string = "Water, Glycerin, Natural Extracts"
): Prisma.ProductCreateInput => {
    const brand = getRandomBrand();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const price = getRandomPrice(priceMin, priceMax);
    const compareAtPrice = Math.random() > 0.6 ? Number((price * 1.2).toFixed(2)) : null; // 40% chance of discount
    const sku = `SKU-${category.substring(0, 4)}-${index.toString().padStart(3, '0')}`;

    // Image placeholders
    const images = [
        `https://picsum.photos/seed/${slug}-1/800/800`,
        `https://picsum.photos/seed/${slug}-2/800/800`,
        `https://picsum.photos/seed/${slug}-3/800/800`,
        `https://picsum.photos/seed/${slug}-4/800/800`
    ];

    return {
        name,
        slug,
        description,
        shortDescription: shortDesc,
        brand,
        category,
        subCategory,
        price,
        compareAtPrice,
        currency: "USD",
        stock: getRandomInt(0, 200),
        lowStockThreshold: 10,
        sku,
        weight: new Prisma.Decimal(getRandomInt(50, 500) / 1000), // kg
        dimensions: JSON.stringify({ length: getRandomInt(5, 15), width: getRandomInt(5, 15), height: getRandomInt(10, 20), unit: "cm" }),
        images: JSON.stringify(images),
        thumbnailUrl: `https://picsum.photos/seed/${slug}-1/400/400`,
        tags: JSON.stringify(tags),
        ingredients,
        benefits: JSON.stringify(benefits),
        howToUse,
        isActive: true,
        isFeatured: Math.random() > 0.8, // ~20% featured
        isNewArrival: Math.random() > 0.7, // ~30% new arrival
        isBestseller: Math.random() > 0.8, // ~20% bestseller
        rating: new Prisma.Decimal((Math.random() * 1.5 + 3.5).toFixed(1)), // 3.5 - 5.0
        reviewCount: getRandomInt(0, 500),
        viewCount: getRandomInt(100, 5000),
        purchaseCount: getRandomInt(0, 1000),
        publishedAt: getRandomDate(sixMonthsAgo, new Date()),
        perfectCorpProductId: category === 'MAKEUP' ? `PC-${subCategory.toUpperCase()}-${index}` : null,
        metadata: JSON.stringify({
            awards: Math.random() > 0.9 ? ["Best of Beauty 2025"] : [],
            certifications: ["Cruelty-Free", "Vegan"]
        })
    };
};

export async function seedProducts() {
    console.log('🌱 Seeding products...');

    const products: Prisma.ProductCreateInput[] = [];

    // ==========================================
    // 1. SKINCARE (15 products)
    // ==========================================
    const skincareItems = [
        { name: "Hydrating Hyaluronic Serum", sub: "Serums", desc: "Deep hydration for thirsty skin.", short: "Plumping serum." },
        { name: "Brightening Vitamin C Cream", sub: "Moisturizers", desc: "Radiance boosting daily moisturizer.", short: "Glow moisturizer." },
        { name: "Gentle Foaming Cleanser", sub: "Cleansers", desc: "Removes impurities without stripping.", short: "Daily cleanser." },
        { name: "Retinol Night Repair Oil", sub: "Treatments", desc: "Target fine lines while you sleep.", short: "Anti-aging oil." },
        { name: "Soothing Aloe Vera Gel", sub: "Treatments", desc: "Calms irritated skin instantly.", short: "Soothing gel." },
        { name: "Exfoliating AHA Toner", sub: "Toners", desc: "Refines texture and minimizes pores.", short: "Resurfacing toner." },
        { name: "Niacinamide Pore Serum", sub: "Serums", desc: "Controls oil and reduces pore size.", short: "Pore minimizing." },
        { name: "Rich Peptide Eye Cream", sub: "Eye Care", desc: "Firms and brightens delicate eye area.", short: "Firming eye cream." },
        { name: "Daily SPF 50 Sunscreen", sub: "Sun Care", desc: "Broad spectrum protection with no cast.", short: "Invisible SPF." },
        { name: "Clay Detox Mask", sub: "Masks", desc: "Purifies pores and absorbs excess oil.", short: "Detox mask." },
        { name: "Hydrating Sheet Mask Pack", sub: "Masks", desc: "Instant moisture boost for glowing skin.", short: "Sheet masks." },
        { name: "Rose Water Mist", sub: "Toners", desc: "Refreshing hydration on the go.", short: "Facial mist." },
        { name: "Balancing Jojoba Oil", sub: "Oils", desc: "Regulates sebum production naturally.", short: "Balancing oil." },
        { name: "Anti-Aging Neck Cream", sub: "Treatments", desc: "Targets sagging and wrinkles on neck.", short: "Neck firming." },
        { name: "Blemish Spot Treatment", sub: "Treatments", desc: "Fast acting gel for breakouts.", short: "Acne spot treatment." },
    ];

    skincareItems.forEach((item, i) => {
        products.push(createProduct(
            item.name,
            ProductCategory.SKINCARE,
            item.sub,
            15.99, 79.99,
            `${item.desc} Formulated with clinically proven ingredients to deliver visible results.`,
            item.short,
            i + 100,
            ["skincare", "hydrating", "anti-aging"],
            ["Hydrates skin", "Improves texture", "Radiant finish"],
            "Apply to clean face morning and night."
        ));
    });

    // ==========================================
    // 2. MAKEUP (15 products)
    // ==========================================
    const makeupItems = [
        { name: "Velvet Matte Lipstick in Ruby Red", sub: "Lips", desc: "Long-lasting matte color." },
        { name: "HD Foundation in Natural Beige", sub: "Face", desc: "Full coverage with typical finish." },
        { name: "Volumizing Mascara Black", sub: "Eyes", desc: "Dramatic volume without clumps." },
        { name: "Liquid Eyeliner Pen", sub: "Eyes", desc: "Precise cat eyes made easy." },
        { name: "Cream Blush in Peachy Glow", sub: "Cheeks", desc: "Dewy flush of color." },
        { name: "Setting Powder Translucent", sub: "Face", desc: "Locks makeup for 12 hours." },
        { name: "Eyeshadow Palette Nude", sub: "Eyes", desc: "Daily neutrals for every eye color." },
        { name: "Highlighter Stick Champagne", sub: "Face", desc: "Instant glow on high points." },
        { name: "Tinted Lip Balm Rose", sub: "Lips", desc: "Hydration with a hint of tint." },
        { name: "Brow Gel Clear", sub: "Brows", desc: "Tames unruly brows all day." },
        { name: "Bronzer Powder Sunkissed", sub: "Cheeks", desc: "Warmth for a healthy glow." },
        { name: "Concealer Wand Light", sub: "Face", desc: "Hides dark circles and blemishes." },
        { name: "Lip Gloss Sparkling Clear", sub: "Lips", desc: "High shine without stickiness." },
        { name: "Primer Pore Blurring", sub: "Face", desc: "Smooth canvas for makeup application." },
        { name: "Setting Spray Dewy Finish", sub: "Face", desc: "Hydrating mist to set makeup." },
    ];

    makeupItems.forEach((item, i) => {
        products.push(createProduct(
            item.name,
            ProductCategory.MAKEUP,
            item.sub,
            89.99, 49.99,
            `${item.desc} High performance formula for professional results.`,
            item.desc,
            i + 200,
            ["makeup", "long-wearing", "cruelty-free"],
            ["High pigment", "Long lasting", "Comfortable wear"],
            "Apply as desired."
        ));
    });

    // ==========================================
    // 3. HAIRCARE (10 products)
    // ==========================================
    const haircareItems = [
        { name: "Strengthening Shampoo", sub: "Shampoo", desc: "Fortifies weak strands." },
        { name: "Hydrating Conditioner", sub: "Conditioner", desc: "Detangles and moisturizes." },
        { name: "Repair Hair Mask", sub: "Treatment", desc: "Intensive repair for damaged hair." },
        { name: "Argan Hair Oil", sub: "Treatment", desc: "Frizz control and shine." },
        { name: "Volumizing Mousse", sub: "Styling", desc: "Lift and body for fine hair." },
        { name: "Heat Protectant Spray", sub: "Styling", desc: "Shields hair up to 450°F." },
        { name: "Dry Shampoo Fresh", sub: "Styling", desc: "Refreshes hair between washes." },
        { name: "Curl Defining Cream", sub: "Styling", desc: "Bouncy curls without crunch." },
        { name: "Scalp Scrub Detox", sub: "Treatment", desc: "Removes buildup promoting growth." },
        { name: "Leave-In Conditioner Spray", sub: "Conditioner", desc: "Weightless moisture and protection." },
    ];

    haircareItems.forEach((item, i) => {
        products.push(createProduct(
            item.name,
            ProductCategory.HAIRCARE,
            item.sub,
            12.99, 39.99,
            `${item.desc} Salon quality results at home.`,
            item.desc,
            i + 300,
            ["haircare", "strengthening", "shine"],
            ["Strengthens hair", "Adds shine", "Protects color"],
            "Massage into wet hair or apply to damp hair."
        ));
    });

    // ==========================================
    // 4. BODYCARE (5 products)
    // ==========================================
    const bodycareItems = [
        { name: "Shea Butter Body Lotion", sub: "Moisturizers" },
        { name: "Coffee Body Scrub", sub: "Exfoliators" },
        { name: "Lavender Body Oil", sub: "Oils" },
        { name: "Hand Cream Intensive", sub: "Hands" },
        { name: "Foot Repair Balm", sub: "Feet" },
    ];

    bodycareItems.forEach((item, i) => {
        products.push(createProduct(
            item.name,
            ProductCategory.BODYCARE,
            item.sub,
            14.99, 34.99,
            "Nourishing body care for soft, smooth skin.",
            "Daily body care.",
            i + 400,
            ["bodycare", "moisturizing", "softening"],
            ["Deep hydration", "Smooths skin", "Absorbs quickly"],
            "Apply liberally to body."
        ));
    });

    // ==========================================
    // 5. FRAGRANCE (3 products)
    // ==========================================
    const fragranceItems = [
        { name: "Eau de Parfum Floral Dream", sub: "Perfume" },
        { name: "Eau de Toilette Ocean Breeze", sub: "Cologne" },
        { name: "Solid Perfume Vanilla", sub: "Perfume" },
    ];

    fragranceItems.forEach((item, i) => {
        products.push(createProduct(
            item.name,
            ProductCategory.FRAGRANCE,
            item.sub,
            49.99, 89.99,
            "Captivating distinctive scent.",
            "Signature fragrance.",
            i + 500,
            ["fragrance", "long-lasting", "luxury"],
            ["Long lasting scent", "Unique blend", "Travel friendly"],
            "Spray on pulse points."
        ));
    });

    // ==========================================
    // 6. TOOLS (5 products)
    // ==========================================
    const toolItems = [
        { name: "Rose Quartz Roller", sub: "Face Tools" },
        { name: "Makeup Brush Set", sub: "Brushes" },
        { name: "Konjac Sponge", sub: "Sponges" },
        { name: "Eyelash Curler", sub: "Tools" },
        { name: "Silk Sleep Mask", sub: "Accessories" },
    ];

    toolItems.forEach((item, i) => {
        products.push(createProduct(
            item.name,
            ProductCategory.TOOLS,
            item.sub,
            9.99, 69.99,
            "Essential beauty tool for your routine.",
            "Beauty essential.",
            i + 600,
            ["tools", "beauty", "accessory"],
            ["Improves application", "Enhances routine", "Durable quality"],
            "Use as directed."
        ));
    });

    // ==========================================
    // 7. SUPPLEMENTS (3 products)
    // ==========================================
    const supplementItems = [
        { name: "Collagen Peptides Powder", sub: "Collagen" },
        { name: "Hair & Nail Vitamins", sub: "Vitamins" },
        { name: "Glow Skin Gummies", sub: "Vitamins" },
    ];

    supplementItems.forEach((item, i) => {
        products.push(createProduct(
            item.name,
            ProductCategory.SUPPLEMENTS,
            item.sub,
            24.99, 54.99,
            "Beauty from within.",
            "Daily supplement.",
            i + 700,
            ["wellness", "supplements", "beauty-from-within"],
            ["Supports skin health", "Strengthens hair/nails", "Tasty & easy"],
            "Take daily with water." // simplistic
        ));
    });

    // Insert into DB
    console.log(`Creating ${products.length} products...`);

    for (const product of products) {
        const exists = await prisma.product.findUnique({ where: { slug: product.slug } });
        if (!exists) {
            await prisma.product.create({ data: product });
        }
    }

    console.log(`✅ Created ${products.length} products`);
    return products.length;
}

