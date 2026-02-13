import prisma from "@config/database";
import { AuthService } from "@services/auth.service";
import bcrypt from "bcryptjs";

/**
 * Test Helpers
 * Utilities for creating test data and managing test environment
 */
export class TestHelpers {
    /**
     * Create test user
     */
    static async createTestUser(data?: {
        email?: string;
        password?: string;
        name?: string;
        role?: string;
    }) {
        const hashedPassword = await bcrypt.hash(data?.password || "Test@123", 10);

        const user = await prisma.user.create({
            data: {
                email: data?.email || `test-${Date.now()}@example.com`,
                password: hashedPassword,
                name: data?.name || "Test User",
                role: data?.role || "USER",
                isVerified: true,
                isActive: true
            }
        });

        return user;
    }

    /**
     * Create test product
     */
    static async createTestProduct(data?: {
        name?: string;
        category?: string;
        price?: number;
        stock?: number;
    }) {
        const product = await prisma.product.create({
            data: {
                name: data?.name || `Test Product ${Date.now()}`,
                slug: `test-product-${Date.now()}`,
                description: "Test product description",
                price: data?.price || 29.99,
                category: (data?.category as any) || "SKINCARE",
                brand: "Test Brand",
                stock: data?.stock || 100,
                images: JSON.stringify(["https://via.placeholder.com/300"]),
                thumbnailUrl: "https://via.placeholder.com/150",
                tags: JSON.stringify(["test"]),
                benefits: JSON.stringify(["Great for testing"]),
                isActive: true,
                isFeatured: false
            }
        });

        return product;
    }

    /**
     * Create test cart with items
     */
    static async createTestCart(userId: string, productIds?: string[]) {
        // Create products if not provided
        let products = [];
        if (productIds && productIds.length > 0) {
            products = await prisma.product.findMany({
                where: { id: { in: productIds } }
            });
        } else {
            const product1 = await this.createTestProduct();
            const product2 = await this.createTestProduct();
            products = [product1, product2];
        }

        // Add items to cart
        const cartItems = await Promise.all(
            products.map((product) =>
                prisma.cartItem.create({
                    data: {
                        cart: {
                            connectOrCreate: {
                                where: { userId },
                                create: { userId }
                            }
                        },
                        product: { connect: { id: product.id } },
                        quantity: 2,
                        price: product.price,
                        subtotal: Number(product.price) * 2
                    }
                })
            )
        );

        return { cartItems, products };
    }

    /**
     * Create test order
     */
    static async createTestOrder(userId: string) {
        // Create cart first
        const { products } = await this.createTestCart(userId);

        const order = await prisma.order.create({
            data: {
                userId,
                orderNumber: `ORD-${Date.now()}`,
                status: "PENDING",
                paymentStatus: "PENDING",
                paymentMethod: "CREDIT_CARD",
                subtotal: products.reduce((sum, p) => sum + Number(p.price) * 2, 0),
                tax: 10.0,
                shippingCost: 5.0,
                total: products.reduce((sum, p) => sum + Number(p.price) * 2, 0) + 15.0,
                shippingAddress: JSON.stringify({
                    street: "123 Test St",
                    city: "Test City",
                    state: "TS",
                    country: "Test Country",
                    zipCode: "12345"
                }),
                items: {
                    create: products.map((product) => ({
                        product: { connect: { id: product.id } },
                        productName: product.name,
                        productImage: "https://via.placeholder.com/300",
                        price: product.price,
                        quantity: 2,
                        subtotal: Number(product.price) * 2,
                        total: Number(product.price) * 2
                    }))
                }
            },
            include: {
                items: true
            }
        });

        return order;
    }

    /**
     * Create test guide
     */
    static async createTestGuide(data?: {
        title?: string;
        category?: string;
        isPublished?: boolean;
    }) {
        const guide = await prisma.guide.create({
            data: {
                title: data?.title || `Test Guide ${Date.now()}`,
                slug: `test-guide-${Date.now()}`,
                description: "Test guide description",
                content: "# Test Guide Content",
                excerpt: "Test excerpt",
                category: (data?.category as any) || "SKINCARE_ROUTINE",
                tags: JSON.stringify(["test", "guide"]),
                isPublished: data?.isPublished !== undefined ? data.isPublished : true,
                publishedAt: new Date(),
                readTime: 5
            }
        });

        return guide;
    }

    /**
     * Create test fitness activity
     */
    static async createTestActivity(userId: string) {
        const activity = await prisma.fitnessActivity.create({
            data: {
                userId,
                type: "RUNNING",
                durationMinutes: 30,
                intensity: "MODERATE",
                caloriesBurned: 300,
                activityDate: new Date()
            }
        });

        return activity;
    }

    /**
     * Create test promotion
     */
    static async createTestPromotion(data?: {
        code?: string;
        discountType?: string;
        discountValue?: number;
    }) {
        const promotion = await prisma.promotion.create({
            data: {
                code: data?.code || `TEST${Date.now()}`,
                description: "Test promotion",
                type: "GENERAL",
                discountType: (data?.discountType as any) || "PERCENTAGE",
                discountValue: data?.discountValue || 10,
                startDate: new Date(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                isActive: true,
                usageLimit: 100,
                usageCount: 0
            }
        });

        return promotion;
    }

    /**
     * Generate auth token for testing
     */
    static generateAuthToken(userId: string, email: string, role: string = "USER"): string {
        return AuthService.generateAccessToken({ userId, email, role });
    }

    /**
     * Cleanup specific test data
     */
    static async cleanupUser(userId: string): Promise<void> {
        await prisma.user.delete({ where: { id: userId } }).catch(() => { });
    }

    static async cleanupProduct(productId: string): Promise<void> {
        await prisma.product.delete({ where: { id: productId } }).catch(() => { });
    }

    static async cleanupOrder(orderId: string): Promise<void> {
        await prisma.order.delete({ where: { id: orderId } }).catch(() => { });
    }

    /**
     * Cleanup all test data (use with caution!)
     */
    static async cleanupAllTestData(): Promise<void> {
        // Delete in correct order to respect foreign key constraints
        await prisma.orderItem.deleteMany();
        await prisma.order.deleteMany();
        await prisma.cartItem.deleteMany();
        await prisma.guideBookmark.deleteMany();
        await prisma.guideLike.deleteMany();
        await prisma.guideStep.deleteMany();
        await prisma.guide.deleteMany();
        await prisma.fitnessActivity.deleteMany();
        await prisma.fitnessGoal.deleteMany();
        await prisma.notification.deleteMany();
        await prisma.promotionUsage.deleteMany();
        await prisma.promotion.deleteMany();
        await prisma.referral.deleteMany();
        await prisma.product.deleteMany();
        await prisma.user.deleteMany({ where: { email: { contains: "test" } } });
    }

    /**
     * Create test referral code
     */
    static async createTestReferralCode(data?: {
        userId?: string;
        code?: string;
    }) {
        // Create user if not provided
        let userId = data?.userId;
        if (!userId) {
            const user = await this.createTestUser({
                email: `referrer-${Date.now()}@example.com`
            });
            userId = user.id;
        }

        const referral = await prisma.referralCode.create({
            data: {
                userId: userId!,
                code: data?.code || `REF${Date.now()}`,
                usageCount: 0,
                isActive: true
            }
        });

        return referral;
    }

    /**
     * Wait for async operations
     */
    static async wait(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

export default TestHelpers;
