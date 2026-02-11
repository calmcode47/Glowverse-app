/// <reference types="node" />
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Comprehensive Production Seed
 * Seeds all necessary data for a fully functional application
 */
async function main() {
  console.log('🌱 Starting comprehensive database seeding...\n');

  try {
    // ============================================
    // 1. CREATE USERS
    // ============================================
    console.log('👥 Creating users...');
    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    const admin = await prisma.user.upsert({
      where: { email: 'admin@glowverse.com' },
      update: {},
      create: {
        email: 'admin@glowverse.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'ADMIN',
        isVerified: true,
        isActive: true
      }
    });

    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@glowverse.com' },
      update: {},
      create: {
        email: 'demo@glowverse.com',
        password: await bcrypt.hash('Demo@123', 10),
        name: 'Demo User',
        role: 'USER',
        isVerified: true,
        isActive: true
      }
    });

    console.log('✅ Created 2 users\n');

    // ============================================
    // 2. CREATE PRODUCTS
    // ============================================
    console.log('🛍️  Creating products...');

    const productData = [
      // Skincare
      { name: 'Hydrating Gel Cleanser', category: 'SKINCARE', price: 24.99, brand: 'GlowLab', description: 'Gentle daily cleanser for all skin types', stock: 150, featured: true },
      { name: 'Vitamin C Brightening Serum', category: 'SKINCARE', price: 39.99, brand: 'GlowLab', description: 'Powerful antioxidant serum for radiant skin', stock: 100, featured: true },
      { name: 'Hyaluronic Acid Moisturizer', category: 'SKINCARE', price: 34.99, brand: 'GlowLab', description: 'Intense hydration for plump, dewy skin', stock: 120, featured: false },
      { name: 'Retinol Night Cream', category: 'SKINCARE', price: 44.99, brand: 'GlowLab', description: 'Anti-aging powerhouse for smoother skin', stock: 80, featured: false },
      { name: 'Mineral Sunscreen SPF 50', category: 'SKINCARE', price: 29.99, brand: 'GlowLab', description: 'Broad spectrum protection', stock: 200, featured: true },
      { name: 'AHA/BHA Exfoliating Toner', category: 'SKINCARE', price: 27.99, brand: 'GlowLab', description: 'Chemical exfoliant for glowing skin', stock: 90, featured: false },
      { name: 'Niacinamide Serum', category: 'SKINCARE', price: 32.99, brand: 'GlowLab', description: 'Pore-refining and brightening', stock: 110, featured: false },
      { name: 'Eye Revitalizing Cream', category: 'SKINCARE', price: 38.99, brand: 'GlowLab', description: 'Reduces dark circles and puffiness', stock: 75, featured: false },

      // Makeup
      { name: 'Flawless Foundation', category: 'MAKEUP', price: 36.99, brand: 'BeautyPro', description: 'Long-lasting, buildable coverage', stock: 85, featured: true },
      { name: 'Full Coverage Concealer', category: 'MAKEUP', price: 24.99, brand: 'BeautyPro', description: 'Hides imperfections seamlessly', stock: 95, featured: false },
      { name: 'Volumizing Mascara', category: 'MAKEUP', price: 22.99, brand: 'BeautyPro', description: 'Dramatic lashes all day', stock: 120, featured: false },
      { name: 'Matte Lipstick Collection', category: 'MAKEUP', price: 19.99, brand: 'BeautyPro', description: '12 stunning shades', stock: 140, featured: false },
      { name: 'Eyeshadow Palette - Nude', category: 'MAKEUP', price: 42.99, brand: 'BeautyPro', description: '20 versatile neutral shades', stock: 65, featured: true },
      { name: 'HD Setting Powder', category: 'MAKEUP', price: 28.99, brand: 'BeautyPro', description: 'Locks makeup in place', stock: 100, featured: false },
      { name: 'Cream Blush Stick', category: 'MAKEUP', price: 21.99, brand: 'BeautyPro', description: 'Natural flush of color', stock: 88, featured: false },

      // Haircare
      { name: 'Nourishing Shampoo', category: 'HAIRCARE', price: 18.99, brand: 'HairCare+', description: 'Sulfate-free formula for healthy hair', stock: 150, featured: false },
      { name: 'Repairing Conditioner', category: 'HAIRCARE', price: 19.99, brand: 'HairCare+', description: 'Deep conditioning treatment', stock: 145, featured: false },
      { name: 'Intensive Hair Mask', category: 'HAIRCARE', price: 26.99, brand: 'HairCare+', description: 'Weekly repair treatment', stock: 90, featured: false },
      { name: 'Argan Oil Hair Serum', category: 'HAIRCARE', price: 24.99, brand: 'HairCare+', description: 'Smoothing and shine-boosting', stock: 110, featured: false },
      { name: 'Heat Protectant Spray', category: 'HAIRCARE', price: 16.99, brand: 'HairCare+', description: 'Shields from styling damage', stock: 130, featured: false },

      // Fragrance
      { name: 'Floral Bouquet Perfume', category: 'FRAGRANCE', price: 64.99, brand: 'ScentLux', description: 'Elegant floral notes', stock: 45, featured: true },
      { name: 'Woody Spice Cologne', category: 'FRAGRANCE', price: 69.99, brand: 'ScentLux', description: 'Warm and sophisticated', stock: 40, featured: false },
      { name: 'Fresh Citrus Body Mist', category: 'FRAGRANCE', price: 24.99, brand: 'ScentLux', description: 'Light and refreshing', stock: 80, featured: false },
    ];

    const products = [];
    for (const data of productData) {
      const product = await prisma.product.create({
        data: {
          name: data.name,
          slug: data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          description: data.description,
          price: data.price,
          category: data.category as any,
          brand: data.brand,
          stock: data.stock,
          images: JSON.stringify([`https://via.placeholder.com/600x600?text=${encodeURIComponent(data.name)}`]),
          isActive: true,
          isFeatured: data.featured
        }
      });
      products.push(product);
    }

    console.log(`✅ Created ${products.length} products\n`);

    // ============================================
    // 3. CREATE PROMOTIONS
    // ============================================
    console.log('🎟️  Creating promotions...');

    const promotions = await Promise.all([
      prisma.promotion.create({
        data: {
          code: 'WELCOME15',
          description: 'Welcome discount for new customers - 15% off first order',
          type: 'FIRST_ORDER',
          discountType: 'PERCENTAGE',
          discountValue: 15,
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          isActive: true,
          usageLimit: 10000,
          usageCount: 0
        }
      }),
      prisma.promotion.create({
        data: {
          code: 'GLOW25',
          description: '25% off on orders over $75',
          type: 'GENERAL',
          discountType: 'PERCENTAGE',
          discountValue: 25,
          minOrderValue: 75,
          startDate: new Date(),
          endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          isActive: true,
          usageLimit: 5000,
          usageCount: 0
        }
      }),
      prisma.promotion.create({
        data: {
          code: 'FLAT10',
          description: '$10 flat discount on all orders',
          type: 'GENERAL',
          discountType: 'FIXED_AMOUNT',
          discountValue: 10,
          startDate: new Date(),
          endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          isActive: true,
          usageLimit: 3000,
          usageCount: 0
        }
      })
    ]);

    console.log(`✅ Created ${promotions.length} promotions\n`);

    // ============================================
    // 4. CREATE GUIDES
    // ============================================
    console.log('📚 Creating guides...');

    const guides = await Promise.all([
      prisma.guide.create({
        data: {
          title: 'Complete Morning Skincare Routine',
          slug: 'morning-skincare-routine',
          description: 'Start your day right with this comprehensive morning skincare routine designed for all skin types',
          content: `# Morning Skincare Routine\n\nYour skin works hard overnight to repair itself. A morning routine protects and prepares your skin for the day ahead.\n\n## The Perfect Morning Routine\n\nFollow these steps in order for maximum effectiveness.`,
          excerpt: 'A simple 5-step morning routine for glowing, protected skin',
          category: 'SKINCARE_ROUTINE',
          tags: JSON.stringify(['morning', 'skincare', 'routine', 'beginner', 'daily']),
          difficulty: 'BEGINNER',
          readTime: 8,
          duration: 10,
          thumbnailUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571',
          isPublished: true,
          publishedAt: new Date('2026-01-15'),
          steps: {
            create: [
              { order: 1, title: 'Cleanse', content: 'Start with a gentle, pH-balanced cleanser...', tips: JSON.stringify(['Use lukewarm water', 'Massage gently', 'Choose cleanser for your skin type']) },
              { order: 2, title: 'Tone', content: 'Apply toner to balance pH...', tips: JSON.stringify(['Avoid alcohol-based toners', 'Pat gently', 'Choose hydrating formulas']) },
              { order: 3, title: 'Serum', content: 'Apply vitamin C serum for brightening...', tips: JSON.stringify(['Vitamin C is great for morning', 'Wait 30 seconds', 'Store away from light']) },
              { order: 4, title: 'Moisturize', content: 'Lock in hydration with lightweight moisturizer...', tips: JSON.stringify(['Use upward motions', 'Don\'t forget neck', 'Gel for oily skin']) },
              { order: 5, title: 'SPF', content: 'Apply broad-spectrum SPF 30+...', tips: JSON.stringify(['Never skip sunscreen', 'Reapply every 2 hours', 'SPF goes last']) }
            ]
          }
        }
      }),
      prisma.guide.create({
        data: {
          title: 'Evening Skincare Routine for Deep Repair',
          slug: 'evening-skincare-routine',
          description: 'Transform your skin overnight with this restorative evening routine',
          content: '# Evening Skincare\n\nYour skin repairs itself at night. Maximize this natural process with the right products.',
          excerpt: 'Wind down with this 6-step evening routine for maximum repair',
          category: 'SKINCARE_ROUTINE',
          tags: JSON.stringify(['evening', 'skincare', 'anti-aging', 'repair']),
          difficulty: 'BEGINNER',
          readTime: 10,
          duration: 15,
          thumbnailUrl: 'https://images.unsplash.com/photo-1552693673-1bf958298935',
          isPublished: true,
          publishedAt: new Date('2026-01-18')
        }
      }),
      prisma.guide.create({
        data: {
          title: 'Natural Makeup Tutorial for Beginners',
          slug: 'natural-makeup-tutorial',
          description: 'Master the no-makeup makeup look with this step-by-step tutorial',
          content: '# Natural Makeup Guide\n\nCreate a fresh, natural makeup look that enhances your features.',
          excerpt: 'Achieve the perfect natural look in just 15 minutes',
          category: 'MAKEUP_TUTORIAL',
          tags: JSON.stringify(['makeup', 'natural', 'beginner', 'everyday']),
          difficulty: 'BEGINNER',
          readTime: 12,
          thumbnailUrl: 'https://images.unsplash.com/photo-1487412912498-0447578fcca8',
          isPublished: true,
          publishedAt: new Date('2026-01-22')
        }
      })
    ]);

    console.log(`✅ Created ${guides.length} guides\n`);

    // ============================================
    // 5. CREATE SAMPLE NOTIFICATIONS
    // ============================================
    console.log('🔔 Creating sample notifications...');

    await prisma.notification.create({
      data: {
        userId: demoUser.id,
        type: 'GENERAL',
        title: 'Welcome to Glowverse!',
        message: 'Thanks for joining our beauty community. Explore our products and guides to start your journey.',
        isRead: false
      }
    });

    console.log('✅ Created sample notifications\n');

    console.log('✨ Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Users: 2 (1 admin, 1 demo)`);
    console.log(`   - Products: ${products.length}`);
    console.log(`   - Promotions: ${promotions.length}`);
    console.log(`   - Guides: ${guides.length}`);
    console.log('\n🔑 Login Credentials:');
    console.log('   Admin: admin@glowverse.com / Admin@123');
    console.log('   Demo: demo@glowverse.com / Demo@123');
    console.log('\n💰 Active Promotion Codes:');
    console.log('   WELCOME15 - 15% off first order');
    console.log('   GLOW25 - 25% off orders $75+');
    console.log('   FLAT10 - $10 flat discount\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
