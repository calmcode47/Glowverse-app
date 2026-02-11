import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Comprehensive test data seeder
 * Creates realistic test data for all features
 */
async function seedTestData() {
    console.log('🌱 Starting comprehensive test data seeding...\n');

    try {
        // ============================================
        // 1. CREATE TEST USERS
        // ============================================
        console.log('👥 Creating test users...');
        const hashedPassword = await bcrypt.hash('Test@123', 10);

        const users = await Promise.all([
            prisma.user.create({
                data: {
                    email: 'admin@glowverse.com',
                    password: hashedPassword,
                    name: 'Admin User',
                    role: 'ADMIN',
                    isVerified: true,
                    isActive: true
                }
            }),
            prisma.user.create({
                data: {
                    email: 'john@example.com',
                    password: hashedPassword,
                    name: 'John Doe',
                    role: 'USER',
                    isVerified: true,
                    isActive: true
                }
            }),
            prisma.user.create({
                data: {
                    email: 'jane@example.com',
                    password: hashedPassword,
                    name: 'Jane Smith',
                    role: 'USER',
                    isVerified: true,
                    isActive: true
                }
            })
        ]);
        console.log(`✅ Created ${users.length} users\n`);

        // ============================================
        // 2. CREATE TEST PRODUCTS
        // ============================================
        console.log('🛍️  Creating test products...');
        const products = await Promise.all([
            // Skincare
            ...['Hydrating Cleanser', 'Vitamin C Serum', 'Hyaluronic Moisturizer', 'Retinol Night Cream', 'Sunscreen SPF 50'].map((name, i) =>
                prisma.product.create({
                    data: {
                        name,
                        slug: name.toLowerCase().replace(/\s+/g, '-'),
                        description: `Premium ${name} for all skin types`,
                        price: 19.99 + (i * 10),
                        category: 'SKINCARE',
                        brand: 'GlowLab',
                        stock: 100,
                        images: [`https://via.placeholder.com/300?text=${name.replace(/\s+/g, '+')}`],
                        isActive: true,
                        isFeatured: i < 2
                    }
                })
            ),
            // Makeup
            ...['Foundation', 'Concealer', 'Mascara', 'Lipstick', 'Eyeshadow Palette'].map((name, i) =>
                prisma.product.create({
                    data: {
                        name,
                        slug: `makeup-${name.toLowerCase().replace(/\s+/g, '-')}`,
                        description: `Long-lasting ${name}`,
                        price: 24.99 + (i * 5),
                        category: 'MAKEUP',
                        brand: 'BeautyPro',
                        stock: 80,
                        images: [`https://via.placeholder.com/300?text=${name.replace(/\s+/g, '+')}`],
                        isActive: true,
                        isFeatured: i === 0
                    }
                })
            ),
            // Haircare
            ...['Shampoo', 'Conditioner', 'Hair Mask', 'Hair Oil'].map((name, i) =>
                prisma.product.create({
                    data: {
                        name: `Nourishing ${name}`,
                        slug: `hair-${name.toLowerCase().replace(/\s+/g, '-')}`,
                        description: `Professional ${name} for healthy hair`,
                        price: 15.99 + (i * 7),
                        category: 'HAIRCARE',
                        brand: 'HairCare+',
                        stock: 120,
                        images: [`https://via.placeholder.com/300?text=${name.replace(/\s+/g, '+')}`],
                        isActive: true,
                        isFeatured: false
                    }
                })
            ),
            // Fragrance
            ...['Floral Perfume', 'Woody Cologne', 'Fresh Body Mist'].map((name, i) =>
                prisma.product.create({
                    data: {
                        name,
                        slug: `fragrance-${name.toLowerCase().replace(/\s+/g, '-')}`,
                        description: `Luxury ${name}`,
                        price: 49.99 + (i * 20),
                        category: 'FRAGRANCE',
                        brand: 'ScentLux',
                        stock: 50,
                        images: [`https://via.placeholder.com/300?text=${name.replace(/\s+/g, '+')}`],
                        isActive: true,
                        isFeatured: i === 0
                    }
                })
            )
        ]);
        console.log(`✅ Created ${products.length} products\n`);

        // ============================================
        // 3. CREATE TEST PROMOTIONS
        // ============================================
        console.log('🎟️  Creating test promotions...');
        const promotions = await Promise.all([
            prisma.promotion.create({
                data: {
                    code: 'WELCOME10',
                    description: 'Welcome discount for new users',
                    type: 'FIRST_ORDER',
                    discountType: 'PERCENTAGE',
                    discountValue: 10,
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                    isActive: true,
                    usageLimit: 1000,
                    usageCount: 0
                }
            }),
            prisma.promotion.create({
                data: {
                    code: 'SAVE20',
                    description: '20% off on orders over $50',
                    type: 'GENERAL',
                    discountType: 'PERCENTAGE',
                    discountValue: 20,
                    minOrderValue: 50,
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    isActive: true,
                    usageLimit: 500,
                    usageCount: 0
                }
            }),
            prisma.promotion.create({
                data: {
                    code: 'FLAT5',
                    description: '$5 flat discount',
                    type: 'GENERAL',
                    discountType: 'FIXED',
                    discountValue: 5,
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
                    isActive: true,
                    usageLimit: 2000,
                    usageCount: 0
                }
            })
        ]);
        console.log(`✅ Created ${promotions.length} promotions\n`);

        // ============================================
        // 4. CREATE TEST GUIDES
        // ============================================
        console.log('📚 Creating test guides...');
        const guides = await Promise.all([
            prisma.guide.create({
                data: {
                    title: 'Complete Morning Skincare Routine',
                    slug: 'morning-skincare-routine',
                    description: 'Start your day with this comprehensive morning skincare routine',
                    content: '# Morning Skincare\n\nYour complete guide to morning skincare...',
                    excerpt: 'A simple 5-step morning routine for glowing skin',
                    category: 'SKINCARE_ROUTINE',
                    tags: ['morning', 'skincare', 'routine', 'beginner'],
                    difficulty: 'BEGINNER',
                    readTime: 8,
                    duration: 10,
                    thumbnailUrl: 'https://via.placeholder.com/600x400?text=Morning+Routine',
                    isPublished: true,
                    publishedAt: new Date()
                }
            }),
            prisma.guide.create({
                data: {
                    title: 'Natural Makeup Tutorial for Beginners',
                    slug: 'natural-makeup-tutorial',
                    description: 'Learn how to create a beautiful natural makeup look',
                    content: '# Natural Makeup\n\nStep-by-step tutorial for natural makeup...',
                    excerpt: 'Master the no-makeup makeup look',
                    category: 'MAKEUP_TUTORIAL',
                    tags: ['makeup', 'natural', 'beginner', 'tutorial'],
                    difficulty: 'BEGINNER',
                    readTime: 12,
                    duration: 20,
                    thumbnailUrl: 'https://via.placeholder.com/600x400?text=Natural+Makeup',
                    isPublished: true,
                    publishedAt: new Date()
                }
            }),
            prisma.guide.create({
                data: {
                    title: 'Hair Care Routine for Damaged Hair',
                    slug: 'damaged-hair-care',
                    description: 'Restore and repair damaged hair with this expert routine',
                    content: '# Hair Repair\n\nComprehensive guide to repairing damaged hair...',
                    excerpt: 'Bring your hair back to life',
                    category: 'HAIRCARE',
                    tags: ['haircare', 'repair', 'damaged-hair', 'treatment'],
                    difficulty: 'INTERMEDIATE',
                    readTime: 10,
                    duration: 30,
                    thumbnailUrl: 'https://via.placeholder.com/600x400?text=Hair+Care',
                    isPublished: true,
                    publishedAt: new Date()
                }
            }),
            prisma.guide.create({
                data: {
                    title: 'Daily Wellness Habits for Glowing Skin',
                    slug: 'wellness-habits',
                    description: 'Lifestyle habits that contribute to healthy, glowing skin',
                    content: '# Wellness for Beauty\n\nSimple daily habits for radiant skin...',
                    excerpt: 'Beauty starts from within',
                    category: 'WELLNESS',
                    tags: ['wellness', 'lifestyle', 'healthy-habits', 'skin-health'],
                    difficulty: 'BEGINNER',
                    readTime: 7,
                    thumbnailUrl: 'https://via.placeholder.com/600x400?text=Wellness',
                    isPublished: true,
                    publishedAt: new Date()
                }
            })
        ]);
        console.log(`✅ Created ${guides.length} guides\n`);

        // ============================================
        // 5. CREATE SAMPLE NOTIFICATIONS
        // ============================================
        console.log('🔔 Creating sample notifications...');
        const notifications = await Promise.all(
            users.slice(1).map(user =>
                prisma.notification.create({
                    data: {
                        userId: user.id,
                        type: 'GENERAL',
                        title: 'Welcome to Glowverse!',
                        message: 'Thanks for joining our beauty community',
                        isRead: false
                    }
                })
            )
        );
        console.log(`✅ Created ${notifications.length} notifications\n`);

        console.log('✨ Test data seeding completed successfully!\n');
        console.log('📊 Summary:');
        console.log(`   - Users: ${users.length}`);
        console.log(`   - Products: ${products.length}`);
        console.log(`   - Promotions: ${promotions.length}`);
        console.log(`   - Guides: ${guides.length}`);
        console.log(`   - Notifications: ${notifications.length}`);
        console.log('\n🔑 Login credentials:');
        console.log('   Admin: admin@glowverse.com / Test@123');
        console.log('   User 1: john@example.com / Test@123');
        console.log('   User 2: jane@example.com / Test@123\n');

    } catch (error) {
        console.error('❌ Error seeding test data:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the seeder
seedTestData()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
