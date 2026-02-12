import { PrismaClient } from '@prisma/client';
import { seedProducts } from './seed-products';
import { seedGuides } from './seed-guides';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // 1. Create admin and test users
  console.log('👤 Creating users...');

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@glowverse.com' },
    update: {},
    create: {
      email: 'admin@glowverse.com',
      password: await hashPassword('Admin@123'),
      name: 'Admin User',
      role: 'ADMIN',
      isVerified: true,
    },
  });

  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      password: await hashPassword('Test@123'),
      name: 'Test User',
      role: 'USER',
      isVerified: true,
    },
  });

  console.log('✅ Users created\n');

  // 2. Seed products
  console.log('🛍️  Seeding products...');
  await seedProducts();
  console.log('✅ Products seeded\n');

  // 3. Seed guides
  console.log('📚 Seeding guides...');
  await seedGuides();
  console.log('✅ Guides seeded\n');

  // 4. Seed promotions
  console.log('🎁 Seeding promotions...');
  await seedPromotions();
  console.log('✅ Promotions seeded\n');

  // 5. Generate referral codes for users
  console.log('🔗 Generating referral codes...');
  await generateReferralCodes();
  console.log('✅ Referral codes generated\n');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// Helper functions
async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

async function seedPromotions() {
  const promotions = [
    {
      code: 'WELCOME10',
      title: 'Welcome Offer',
      description: 'Get 10% off your first order',
      type: 'FIRST_ORDER', // Ensure this enum value exists in your schema or use appropriate one
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrderValue: 0,
      usageLimit: null,
      usagePerUser: 1,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2026-12-31'),
      isActive: true,
      applicableCategories: "[]",
      applicableProducts: "[]",
    },
    {
      code: 'SUMMER25',
      title: 'Summer Sale',
      description: '$25 off orders over $100',
      type: 'SEASONAL', // Ensure this enum value exists in your schema or use appropriate one
      discountType: 'FIXED_AMOUNT',
      discountValue: 25,
      minOrderValue: 100,
      usageLimit: 1000,
      usagePerUser: 3,
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-08-31'),
      isActive: true,
      applicableCategories: "[]",
      applicableProducts: "[]",
    },
  ];

  for (const promo of promotions) {
    const exists = await prisma.promotion.findUnique({ where: { code: promo.code } });
    if (!exists) {
      // Cast type to any if enum mismatch occurs during development, but ideally should use specific Enum
      await prisma.promotion.create({ data: promo as any });
    }
  }
}

async function generateReferralCodes() {
  const users = await prisma.user.findMany();

  for (const user of users) {
    if (!user.referralCode) {
      const code = `GLOW-${generateRandomString(6).toUpperCase()}`;
      await prisma.user.update({
        where: { id: user.id },
        data: { referralCode: code },
      });
    }
  }
}

function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
