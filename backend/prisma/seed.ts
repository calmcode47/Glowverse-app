import { PrismaClient, UserRole, Gender } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  if (process.env.NODE_ENV === "development") {
    await prisma.apiUsage.deleteMany();
    await prisma.productRecommendation.deleteMany();
    await prisma.favorite.deleteMany();
    await prisma.virtualTryOn.deleteMany();
    await prisma.analysis.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.userProfile.deleteMany();
    await prisma.user.deleteMany();
  }

  const hashedPassword = await bcrypt.hash("Admin@123", 10);
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@perfectcorp.com",
      password: hashedPassword,
      name: "Admin User",
      role: UserRole.ADMIN,
      isVerified: true,
      profile: {
        create: {
          gender: Gender.OTHER,
          skinType: "combination",
          skinTone: "medium"
        }
      }
    },
    include: {
      profile: true
    }
  });

  console.log("✅ Admin user created:", adminUser.email);

  const testUserPassword = await bcrypt.hash("Test@123", 10);
  const testUser = await prisma.user.create({
    data: {
      email: "test@example.com",
      password: testUserPassword,
      name: "Test User",
      role: UserRole.USER,
      isVerified: true,
      profile: {
        create: {
          gender: Gender.FEMALE,
          skinType: "oily",
          skinTone: "fair"
        }
      }
    },
    include: {
      profile: true
    }
  });

  console.log("✅ Test user created:", testUser.email);

  const products = [
    {
      productId: "PROD001",
      name: "Hydrating Face Serum",
      brand: "BeautyBrand",
      category: "skincare",
      description: "Deep hydration for all skin types",
      price: 45.99,
      imageUrl: "https://example.com/serum.jpg",
      rating: 4.5,
      suitableForSkinTypes: ["dry", "combination", "normal"],
      suitableForSkinTones: ["fair", "medium", "dark"],
      concerns: ["hydration", "fine_lines"]
    },
    {
      productId: "PROD002",
      name: "Matte Finish Lipstick",
      brand: "MakeupCo",
      category: "makeup",
      description: "Long-lasting matte lipstick",
      price: 24.99,
      imageUrl: "https://example.com/lipstick.jpg",
      rating: 4.8,
      suitableForSkinTypes: ["all"],
      suitableForSkinTones: ["fair", "medium", "dark"],
      concerns: []
    }
  ];

  for (const product of products) {
    await prisma.productRecommendation.create({
      data: product
    });
  }

  console.log(`✅ ${products.length} products seeded`);
  console.log("🎉 Database seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
