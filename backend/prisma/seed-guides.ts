import { PrismaClient, GuideCategory, DifficultyLevel, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const guides: any[] = [
    {
        title: "Complete Morning Skincare Routine for Glowing Skin",
        slug: "morning-skincare-routine-glowing-skin",
        description: "Master the perfect morning skincare routine to start your day with radiance and protection.",
        content: "# Morning Skincare Routine\n\nA consistent morning routine is key to maintaining healthy, glowing skin...",
        excerpt: "A comprehensive guide to morning skincare steps for all skin types.",
        thumbnailUrl: "https://images.unsplash.com/photo-1556228552-cab036ca6d5d?auto=format&fit=crop&q=80&w=1600",
        coverImage: "https://images.unsplash.com/photo-1556228552-cab036ca6d5d?auto=format&fit=crop&q=80&w=1600",
        images: JSON.stringify([
            "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=1600",
            "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=1600",
        ]),
        category: GuideCategory.SKINCARE_ROUTINE,
        tags: JSON.stringify(["morning routine", "glowing skin", "hydration", "SPF", "beginner-friendly"]),
        difficulty: DifficultyLevel.BEGINNER,
        readTime: 8,
        duration: 15,
        isPublished: true,
        isFeatured: true,
        publishedAt: new Date('2025-10-15T08:00:00Z'),
        steps: {
            create: [
                {
                    order: 1,
                    title: "Cleanse Your Face",
                    content: "Start with a gentle cleanser to remove any oils produced overnight. Use lukewarm water.",
                    imageUrl: "https://images.unsplash.com/photo-1556228720-198322c36643?auto=format&fit=crop&q=80&w=800",
                    tips: JSON.stringify(["Use lukewarm water", "Massage in circular motions", "Rinse thoroughly"]),
                },
                {
                    order: 2,
                    title: "Apply Vitamin C Serum",
                    content: "Vitamin C protects against environmental damage and brightens skin tone.",
                    imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800",
                    tips: JSON.stringify(["Apply to dry skin", "Pat gently until absorbed"]),
                },
                {
                    order: 3,
                    title: "Moisturize",
                    content: "Lock in hydration with a lightweight moisturizer suitable for your skin type.",
                    imageUrl: "https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?auto=format&fit=crop&q=80&w=800",
                    tips: JSON.stringify(["Don't forget your neck", "Apply while skin is slightly damp"]),
                },
                {
                    order: 4,
                    title: "Apply Sunscreen",
                    content: "The most important step! Apply broad-spectrum SPF 30 or higher.",
                    imageUrl: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&q=80&w=800",
                    tips: JSON.stringify(["Use two finger lengths of product", "Reapply throughout the day if outside"]),
                }
            ],
        },
    },
    {
        title: "Double Cleansing Method: The Korean Secret",
        slug: "double-cleansing-method-korean-secret",
        description: "Deep dive into the double cleansing method that changed the skincare game forever.",
        content: "# Double Cleansing Guide\n\nDouble cleansing involves using an oil-based cleanser followed by a water-based one...",
        excerpt: "Learn how to properly double cleanse for clear, congestion-free skin.",
        thumbnailUrl: "https://images.unsplash.com/photo-1552693673-1bf958298935?auto=format&fit=crop&q=80&w=1600",
        images: JSON.stringify([]),
        category: GuideCategory.SKINCARE_ROUTINE,
        tags: JSON.stringify(["double cleansing", "k-beauty", "deep clean", "acne-prone"]),
        difficulty: DifficultyLevel.INTERMEDIATE,
        readTime: 6,
        duration: 5,
        isPublished: true,
        isFeatured: true,
        publishedAt: new Date('2025-10-20T18:00:00Z'),
        steps: {
            create: [
                {
                    order: 1,
                    title: "Oil Cleansing",
                    content: "Massage cleansing oil or balm onto DRY skin to dissolve makeup and sebum.",
                    tips: JSON.stringify(["Must apply to dry skin", "Massage for at least 60 seconds"]),
                },
                {
                    order: 2,
                    title: "Emulsify",
                    content: "Add a little water to turn the oil milky, then rinse.",
                    tips: JSON.stringify(["Water should be lukewarm"]),
                },
                {
                    order: 3,
                    title: "Water-Based Cleanse",
                    content: "Follow with a gel or foam cleanser to remove any residue.",
                    tips: JSON.stringify(["Choose a gentle, low pH cleanser"]),
                }
            ]
        }
    },
    {
        title: "Natural Everyday Makeup Look in 10 Minutes",
        slug: "natural-everyday-makeup-10-minutes",
        description: "Quick and easy makeup routine for a fresh, polished look suitable for work or school.",
        content: "# 10-Minute Makeup\n\nYou don't need an hour to look put together. Here is a quick routine...",
        excerpt: "Look polished in just 10 minutes with this simple routine.",
        thumbnailUrl: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&q=80&w=1600",
        category: GuideCategory.MAKEUP_TUTORIAL,
        tags: JSON.stringify(["makeup", "natural look", "quick routine", "beginner"]),
        difficulty: DifficultyLevel.BEGINNER,
        readTime: 5,
        duration: 10,
        isPublished: true,
        isFeatured: false,
        publishedAt: new Date('2025-11-01T09:00:00Z'),
        steps: {
            create: [
                {
                    order: 1,
                    title: "Even Out Skin Tone",
                    content: "Apply tinted moisturizer or light foundation.",
                    tips: JSON.stringify(["Use fingers for natural finish"]),
                },
                {
                    order: 2,
                    title: "Conceal",
                    content: "Dab concealer only where needed (under eyes, blemishes).",
                    tips: JSON.stringify(["Blend well margins"]),
                },
                {
                    order: 3,
                    title: "Brows and Mascara",
                    content: "Fill in brows lightly and apply mascara to open up eyes.",
                    tips: JSON.stringify(["Brush brows up for lifting effect"]),
                },
                {
                    order: 4,
                    title: "Cheeks and Lips",
                    content: "Apply cream blush and a tinted lip balm.",
                    tips: JSON.stringify(["Cream products look more natural"]),
                }
            ]
        }
    },
    {
        title: "Retinol Guide: How to Use and When",
        slug: "retinol-guide-beginners",
        description: "Everything you need to know about the gold standard anti-aging ingredient.",
        content: "# Retinol 101\n\nRetinol is a Vitamin A derivative that speeds up cell turnover...",
        excerpt: "Demystifying retinol: usage, benefits, and how to avoid irritation.",
        thumbnailUrl: "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=1600",
        category: GuideCategory.PRODUCT_USAGE,
        tags: JSON.stringify(["retinol", "anti-aging", "active ingredients", "night routine"]),
        difficulty: DifficultyLevel.INTERMEDIATE,
        readTime: 12,
        duration: 0,
        isPublished: true,
        isFeatured: true,
        publishedAt: new Date('2025-09-10T20:00:00Z'),
        steps: {
            create: [
                {
                    order: 1,
                    title: "Start Slow",
                    content: "Begin using retinol 2-3 times a week at night.",
                    tips: JSON.stringify(["Consistency over intensity", "Pea-sized amount is enough"]),
                },
                {
                    order: 2,
                    title: "The Sandwich Method",
                    content: "Apply moisturizer, then retinol, then moisturizer again to reduce irritation.",
                    tips: JSON.stringify(["Great for sensitive skin"]),
                },
                {
                    order: 3,
                    title: "Always Use SPF",
                    content: "Retinol makes skin more sensitive to sun. SPF is non-negotiable.",
                    tips: JSON.stringify(["SPF 30 minimum", "Reapply every 2 hours"]),
                }
            ]
        }
    },
    {
        title: "How to Style Curly Hair: Complete Guide",
        slug: "curly-hair-styling-guide",
        description: "Embrace your natural texture with these styling tips for curly hair.",
        content: "# Curly Hair Care\n\nCurly hair requires moisture and specific styling techniques...",
        excerpt: "Define your curls and banish frizz with this routine.",
        thumbnailUrl: "https://images.unsplash.com/photo-1534120247760-c44c3e4a62f1?auto=format&fit=crop&q=80&w=1600",
        category: GuideCategory.HAIRCARE,
        tags: JSON.stringify(["curly hair", "styling", "frizz control", "hydration"]),
        difficulty: DifficultyLevel.INTERMEDIATE,
        readTime: 10,
        duration: 30,
        isPublished: true,
        isFeatured: false,
        publishedAt: new Date('2025-11-05T12:00:00Z'),
        steps: {
            create: [
                {
                    order: 1,
                    title: "Apply Product to Wet Hair",
                    content: "Apply leave-in conditioner and gel while hair is soaking wet.",
                    tips: JSON.stringify(["Listen for the 'squish' sound"]),
                },
                {
                    order: 2,
                    title: "Scrunch",
                    content: "Scrunch hair upwards towards scalp to encourage curl formation.",
                    tips: JSON.stringify(["Don't rake fingers through after this"]),
                },
                {
                    order: 3,
                    title: "Diffuse or Air Dry",
                    content: "Use a diffuser on low heat/speed or let air dry completely.",
                    tips: JSON.stringify(["Don't touch hair while drying to avoid frizz"]),
                }
            ]
        }
    },
    {
        title: "Men's Grooming: Essential Daily Routine",
        slug: "mens-grooming-essential-routine",
        description: "Simple, effective daily grooming habits every man should adopt.",
        content: "# Men's Grooming\n\nLooking good doesn't have to be complicated...",
        excerpt: "The basics of men's skincare and grooming.",
        thumbnailUrl: "https://images.unsplash.com/photo-1549476464-37392a713ee4?auto=format&fit=crop&q=80&w=1600",
        category: GuideCategory.GROOMING_TIPS,
        tags: JSON.stringify(["men's grooming", "skincare", "basics", "daily routine"]),
        difficulty: DifficultyLevel.BEGINNER,
        readTime: 6,
        duration: 10,
        isPublished: true,
        isFeatured: false,
        publishedAt: new Date('2025-10-25T14:00:00Z'),
        steps: {
            create: [
                {
                    order: 1,
                    title: "Cleanse",
                    content: "Wash face morning and night to remove dirt and oil.",
                    tips: JSON.stringify(["Don't use body wash on face"]),
                },
                {
                    order: 2,
                    title: "Moisturize with SPF",
                    content: "Hydrate and protect in one step for the day.",
                    tips: JSON.stringify(["SPF prevents premature aging"]),
                },
                {
                    order: 3,
                    title: "Beard Care",
                    content: "Apply beard oil if you have facial hair to keep it soft.",
                    tips: JSON.stringify(["Brush to distribute oil"]),
                }
            ]
        }
    },
    {
        title: "Smokey Eye Tutorial for Beginners",
        slug: "smokey-eye-tutorial-beginners",
        description: "Master the classic smokey eye look without looking like a panda.",
        content: "...",
        excerpt: "Step-by-step guide to a sultry smokey eye.",
        thumbnailUrl: "https://images.unsplash.com/photo-1526045612212-70caf35c14df?auto=format&fit=crop&q=80&w=1600",
        category: GuideCategory.MAKEUP_TUTORIAL,
        tags: JSON.stringify(["makeup", "smokey eye", "evening look", "eye makeup"]),
        difficulty: DifficultyLevel.INTERMEDIATE,
        readTime: 8,
        duration: 20,
        isPublished: true,
        isFeatured: true,
        publishedAt: new Date('2025-12-01T17:00:00Z'),
        steps: {
            create: [
                { order: 1, title: "Prime Lids", content: "Apply eye primer.", tips: "[]" },
                { order: 2, title: "Base Shadow", content: "Apply medium shade all over lid.", tips: "[]" },
                { order: 3, title: "Darken Outer V", content: "Apply darker shade to outer corner.", tips: "[]" }
            ]
        }
    }
];

export async function seedGuides() {
    console.log('🌱 Seeding guides...');

    // Clean up existing guides (optional, be careful in prod)
    // await prisma.guide.deleteMany({}); 

    for (const guide of guides) {
        const exists = await prisma.guide.findUnique({ where: { slug: guide.slug } });
        if (!exists) {
            await prisma.guide.create({
                data: guide,
            });
            // console.log(`Created guide: ${guide.title}`);
        } else {
            // console.log(`Guide already exists: ${guide.title}`);
        }
    }

    console.log('✅ Guides seeded');
}
