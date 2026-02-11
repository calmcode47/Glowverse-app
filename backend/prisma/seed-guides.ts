/// <reference types="node" />
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed sample grooming guides
 */
async function seedGuides() {
    console.log('🌱 Seeding grooming guides...');

    // Create sample guides
    const guides = [
        {
            title: "Morning Skincare Routine for Glowing Skin",
            slug: "morning-skincare-routine",
            description: "A complete morning skincare routine to achieve radiant, glowing skin every day.",
            excerpt: "Start your day with this simple yet effective 5-step morning routine.",
            content: `# Morning Skincare Routine

Achieve glowing skin with this comprehensive morning routine. Follow these steps daily for best results.

## Why Morning Skincare Matters

Your skin works hard at night to repair itself. A morning routine protects and prepares your skin for the day ahead.

## The Routine

Follow these steps in order for maximum effectiveness. Each step builds on the previous one to create a protective barrier and healthy glow.`,
            category: 'SKINCARE_ROUTINE',
            tags: JSON.stringify(['skincare', 'morning', 'routine', 'glowing-skin', 'beginner-friendly']),
            difficulty: 'BEGINNER',
            readTime: 8,
            duration: 10,
            thumbnailUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571',
            images: JSON.stringify([]),
            isPublished: true,
            publishedAt: new Date('2026-01-15'),
            steps: {
                create: [
                    {
                        order: 1,
                        title: "Cleanse",
                        content: "Start with a gentle, pH-balanced cleanser. Wet your face with lukewarm water and massage the cleanser in circular motions for 30-60 seconds.",
                        tips: JSON.stringify(["Use lukewarm water, not hot", "Don't scrub too hard", "Choose a cleanser for your skin type"])
                    },
                    {
                        order: 2,
                        title: "Tone",
                        content: "Apply toner to balance your skin's pH and prepare it for better absorption of subsequent products. Pat gently with fingertips or use a cotton pad.",
                        tips: JSON.stringify(["Avoid alcohol-based toners", "Pat, don't rub", "Choose hydrating toners for dry skin"])
                    },
                    {
                        order: 3,
                        title: "Serum",
                        content: "Apply vitamin C serum for brightening and antioxidant protection. Use 2-3 drops and gently press into skin.",
                        tips: JSON.stringify(["Vitamin C is great for morning", "Wait 30 seconds before next step", "Store serum away from light"])
                    },
                    {
                        order: 4,
                        title: "Moisturize",
                        content: "Lock in hydration with a lightweight moisturizer. Apply while skin is still slightly damp for better absorption.",
                        tips: JSON.stringify(["Use upward motions", "Don't forget your neck", "Choose gel moisturizers for oily skin"])
                    },
                    {
                        order: 5,
                        title: "SPF",
                        content: "The most important step! Apply broad-spectrum SPF 30+ sunscreen. Use about a nickel-sized amount for face and neck.",
                        tips: JSON.stringify(["Never skip sunscreen", "Reapply every 2 hours", "SPF goes last, always"])
                    }
                ]
            }
        },
        {
            title: "Evening Skincare Routine for Deep Repair",
            slug: "evening-skincare-routine",
            description: "A restorative evening routine to help your skin repair and regenerate overnight.",
            excerpt: "Wind down with this 6-step evening routine for maximum skin repair.",
            content: `# Evening Skincare Routine

Your skin repairs itself at night, making your evening routine crucial for healthy, youthful skin.

## The Science of Night Repair

During sleep, skin cell regeneration increases and the skin is more receptive to active ingredients. Maximize this natural repair process with the right products.`,
            category: 'SKINCARE_ROUTINE',
            tags: JSON.stringify(['skincare', 'evening', 'routine', 'anti-aging', 'repair']),
            difficulty: 'BEGINNER',
            readTime: 10,
            duration: 15,
            thumbnailUrl: 'https://images.unsplash.com/photo-1552693673-1bf958298935',
            images: JSON.stringify([]),
            isPublished: true,
            publishedAt: new Date('2026-01-18'),
            steps: {
                create: [
                    {
                        order: 1,
                        title: "Remove Makeup",
                        content: "Use a gentle makeup remover or cleansing oil to dissolve makeup, sunscreen, and sebum. Massage for 1-2 minutes.",
                        tips: JSON.stringify(["Don't tug on skin", "Pay attention to eye area", "Oil cleansers work for all skin types"])
                    },
                    {
                        order: 2,
                        title: "Double Cleanse",
                        content: "Follow up with a water-based cleanser to remove any remaining residue. This ensures completely clean skin.",
                        tips: JSON.stringify(["Essential after wearing makeup/sunscreen", "Use gentle circular motions", "Rinse thoroughly"])
                    },
                    {
                        order: 3,
                        title: "Exfoliate (2-3x per week)",
                        content: "Use a chemical exfoliant (AHA/BHA) to remove dead skin cells and unclog pores. Start slowly if you're new to exfoliation.",
                        tips: JSON.stringify(["Don't over-exfoliate", "Start 1x per week", "Avoid mixing with retinol on same night"])
                    },
                    {
                        order: 4,
                        title: "Toner",
                        content: "Apply hydrating toner to replenish moisture and prep skin for treatment products.",
                        tips: JSON.stringify(["Can use multiple layers (7 skin method)", "Pat in gently", "Choose calming ingredients for nighttime"])
                    },
                    {
                        order: 5,
                        title: "Treatment Serum",
                        content: "Apply targeted treatment like retinol, niacinamide, or peptides. These work best overnight when skin is in repair mode.",
                        tips: JSON.stringify(["Introduce retinol slowly", "Use pea-sized amount", "Always start with lower concentrations"])
                    },
                    {
                        order: 6,
                        title: "Night Cream & Eye Cream",
                        content: "Seal everything in with a rich night cream. Don't forget eye cream for the delicate eye area.",
                        tips: JSON.stringify(["Night creams can be richer than day creams", "Tap eye cream gently", "Consider sleeping masks for extra hydration"])
                    }
                ]
            }
        },
        {
            title: "Hair Care Tips for Healthy, Shiny Hair",
            slug: "hair-care-tips",
            description: "Essential hair care tips and techniques for maintaining healthy, beautiful hair.",
            excerpt: "Transform your hair with these expert-recommended care tips.",
            content: `# Hair Care Tips

Achieve salon-worthy hair at home with these essential care tips and techniques.

## Understanding Your Hair

Different hair types need different care. Learn what works for your unique hair texture and needs.`,
            category: 'HAIRCARE',
            tags: JSON.stringify(['haircare', 'tips', 'healthy-hair', 'shine']),
            difficulty: 'BEGINNER',
            readTime: 6,
            thumbnailUrl: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da',
            images: JSON.stringify([]),
            isPublished: true,
            publishedAt: new Date('2026-01-20')
        },
        {
            title: "Beginner's Guide to Natural Makeup",
            slug: "natural-makeup-guide",
            description: "Learn how to create a beautiful, natural makeup look perfect for everyday wear.",
            excerpt: "Master the no-makeup makeup look with this beginner-friendly guide.",
            content: `# Natural Makeup Guide

Create a fresh, natural makeup look that enhances your features without looking overdone.

## The Natural Look Philosophy

Natural makeup is about enhancing, not masking. The goal is to look like the best version of yourself.`,
            category: 'MAKEUP_TUTORIAL',
            tags: JSON.stringify(['makeup', 'natural', 'beginner', 'everyday']),
            difficulty: 'BEGINNER',
            readTime: 12,
            thumbnailUrl: 'https://images.unsplash.com/photo-1487412912498-0447578fcca8',
            images: JSON.stringify([]),
            isPublished: true,
            publishedAt: new Date('2026-01-22')
        },
        {
            title: "How to Use Retinol: A Complete Guide",
            slug: "retinol-usage-guide",
            description: "Everything you need to know about using retinol safely and effectively.",
            excerpt: "Navigate retinol with confidence using this comprehensive guide.",
            content: `# Retinol Usage Guide

Retinol is one of the most effective anti-aging ingredients available. Learn how to use it properly for maximum benefits and minimal irritation.

## What is Retinol?

Retinol is a vitamin A derivative that speeds up cell turnover, boosts collagen production, and helps treat acne and signs of aging.`,
            category: 'PRODUCT_USAGE',
            tags: JSON.stringify(['retinol', 'anti-aging', 'skincare', 'advanced']),
            difficulty: 'INTERMEDIATE',
            readTime: 15,
            thumbnailUrl: 'https://images.unsplash.com/photo-1556228852-80f3c6b3ca4b',
            images: JSON.stringify([]),
            isPublished: true,
            publishedAt: new Date('2026-01-25')
        },
        {
            title: "5 Daily Wellness Habits for Glowing Skin",
            slug: "daily-wellness-habits",
            description: "Simple lifestyle habits that contribute to healthier, more radiant skin.",
            excerpt: "Beauty starts from within - adopt these daily wellness habits.",
            content: `# Daily Wellness Habits

True beauty radiates from within. These daily wellness habits will transform your skin from the inside out.

## The Skin-Health Connection

Your skin is your body's largest organ and reflects your overall health. What you eat, drink, and how you live directly impacts your skin's appearance.`,
            category: 'WELLNESS',
            tags: JSON.stringify(['wellness', 'lifestyle', 'holistic', 'healthy-habits']),
            difficulty: 'BEGINNER',
            readTime: 7,
            thumbnailUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773',
            images: JSON.stringify([]),
            isPublished: true,
            publishedAt: new Date('2026-01-28')
        },
        {
            title: "Nutrition for Healthy Skin and Hair",
            slug: "nutrition-for-beauty",
            description: "The best foods and nutrients for maintaining beautiful skin and hair from within.",
            excerpt: "Feed your beauty with these nutrition essentials.",
            content: `# Nutrition for Beauty

What you eat directly impacts the health and appearance of your skin and hair. Discover the nutrients your body needs for natural beauty.

## Beauty Foods

Certain foods are packed with vitamins, minerals, and antioxidants that support skin and hair health.`,
            category: 'NUTRITION',
            tags: JSON.stringify(['nutrition', 'diet', 'healthy-skin', 'healthy-hair', 'vitamins']),
            difficulty: 'BEGINNER',
            readTime: 10,
            thumbnailUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061',
            images: JSON.stringify([]),
            isPublished: true,
            publishedAt: new Date('2026-02-01')
        },
        {
            title: "10-Step Korean Skincare Routine",
            slug: "korean-skincare-routine",
            description: "Discover the famous 10-step Korean skincare routine for flawless, glowing skin.",
            excerpt: "Unlock the secrets of Korean beauty with this detailed routine.",
            content: `# Korean Skincare Routine

The 10-step Korean skincare routine has taken the world by storm. Here's how to implement it for maximum results.

## The K-Beauty Philosophy

Korean skincare emphasizes prevention, hydration, and gentle care. It's about maintaining healthy skin,not just treating problems.`,
            category: 'SKINCARE_ROUTINE',
            tags: JSON.stringify(['korean-beauty', 'skincare', 'advanced', 'k-beauty']),
            difficulty: 'ADVANCED',
            readTime: 18,
            thumbnailUrl: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15',
            images: JSON.stringify([]),
            isPublished: true,
            publishedAt: new Date('2026-02-03')
        },
        {
            title: "Men's Grooming Essentials",
            slug: "mens-grooming-essentials",
            description: "A simple, effective grooming routine tailored for men's specific skincare needs.",
            excerpt: "Level up your grooming game with this essential routine.",
            content: `# Men's Grooming Essentials

Men's skin has unique needs - it's thicker, oilier, and faces daily shaving. This routine addresses all of those concerns.

## Men's Skin 101

Men's skin is about 25% thicker than women's and produces more oil. It requires specific care approaches.`,
            category: 'GROOMING_TIPS',
            tags: JSON.stringify(['mens-grooming', 'skincare', 'beginner', 'essentials']),
            difficulty: 'BEGINNER',
            readTime: 8,
            thumbnailUrl: 'https://images.unsplash.com/photo-1621607512214-68297480165e',
            images: JSON.stringify([]),
            isPublished: true,
            publishedAt: new Date('2026-02-05')
        },
        {
            title: "Building Your Minimalist Skincare Routine",
            slug: "minimalist-skincare",
            description: "Simplify your skincare with this effective minimalist routine - less is more.",
            excerpt: "Achieve great skin with fewer products and a simpler routine.",
            content: `# Minimalist Skincare

You don't need 20 products for great skin. This minimalist routine focuses on the essentials for maximum impact.

## Less is More

A simplified routine is easier to maintain, costs less, and reduces the risk of product interactions and irritation.`,
            category: 'SKINCARE_ROUTINE',
            tags: JSON.stringify(['minimalist', 'simple', 'beginner-friendly', 'essentials']),
            difficulty: 'BEGINNER',
            readTime: 6,
            thumbnailUrl: 'https://images.unsplash.com/photo-1556228994-30e95582e8ae',
            images: JSON.stringify([]),
            isPublished: true,
            publishedAt: new Date('2026-02-08')
        }
    ];

    for (const guide of guides) {
        await prisma.guide.create({
            data: guide as any
        });
        console.log(`✅ Created guide: ${guide.title}`);
    }

    console.log('✨ Guides seeded successfully!');
}

// Run seed
seedGuides()
    .catch((e) => {
        console.error('❌ Error seeding guides:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
