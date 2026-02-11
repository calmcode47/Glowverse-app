import prisma from "@config/database";
// No utility errors needed in this service

/**
 * Promotion Type Enum
 */
export enum PromotionType {
    GENERAL = 'GENERAL',
    FIRST_ORDER = 'FIRST_ORDER',
    SEASONAL = 'SEASONAL',
    FLASH_SALE = 'FLASH_SALE',
    REFERRAL = 'REFERRAL',
    LOYALTY = 'LOYALTY'
}

/**
 * Discount Type Enum
 */
export enum DiscountType {
    PERCENTAGE = 'PERCENTAGE',
    FIXED_AMOUNT = 'FIXED_AMOUNT'
}

/**
 * Promotion Service
 * Handles promotional codes, validation, and discount calculation
 */
class PromotionService {
    /**
     * Get all active promotions
     */
    async getActivePromotions(): Promise<any[]> {
        const now = new Date();

        const promotions = await prisma.promotion.findMany({
            where: {
                isActive: true,
                startDate: { lte: now },
                endDate: { gte: now }
            },
            orderBy: {
                endDate: 'asc'
            }
        });

        // Filter out promotions that have exceeded their usage limit (Prisma can't compare two columns)
        const available = promotions.filter(p =>
            p.usageLimit === null || p.usageCount < p.usageLimit
        );

        return available.map(p => this.formatPromotion(p));
    }

    /**
     * Get promotion by code
     */
    async getPromotionByCode(code: string): Promise<any | null> {
        const promotion = await prisma.promotion.findUnique({
            where: { code: code.toUpperCase() }
        });

        if (!promotion || !promotion.isActive) {
            return null;
        }

        return this.formatPromotion(promotion);
    }

    /**
     * Validate promotion for user and order
     */
    async validatePromotion(
        code: string,
        userId: string,
        orderData: {
            subtotal: number;
            items: { productId: string; category: string }[];
        }
    ): Promise<{
        isValid: boolean;
        error?: string;
        discount?: number;
        promotion?: any;
    }> {
        // 1. Get promotion by code
        const promotion = await prisma.promotion.findUnique({
            where: { code: code.toUpperCase() }
        });

        if (!promotion) {
            return { isValid: false, error: "Invalid promotion code" };
        }

        // 2. Check if active
        if (!promotion.isActive) {
            return { isValid: false, error: "This promotion is no longer active" };
        }

        // 3. Check date range
        const now = new Date();
        if (now < promotion.startDate) {
            return { isValid: false, error: "This promotion has not started yet" };
        }
        if (now > promotion.endDate) {
            return { isValid: false, error: "This promotion has expired" };
        }

        // 4. Check total usage limit
        if (promotion.usageLimit !== null && promotion.usageCount >= promotion.usageLimit) {
            return { isValid: false, error: "This promotion has reached its usage limit" };
        }

        // 5. Check per-user usage limit (max 1 use per user by default)
        const userUsageCount = await prisma.promotionUsage.count({
            where: {
                promotionId: promotion.id,
                userId
            }
        });

        const maxPerUser = 1; // Default: 1 use per user
        if (userUsageCount >= maxPerUser) {
            return {
                isValid: false,
                error: `You have already used this promotion`
            };
        }

        // 6. Check minimum purchase amount
        if (promotion.minOrderValue !== null && orderData.subtotal < promotion.minOrderValue) {
            return {
                isValid: false,
                error: `Minimum purchase amount of $${promotion.minOrderValue.toFixed(2)} required`
            };
        }

        // 7. Check applicable categories
        const applicableCategories = this.safeJsonParse<string[]>(promotion.applicableCategories, []);
        if (applicableCategories.length > 0) {
            const hasApplicableCategory = orderData.items.some(item =>
                applicableCategories.includes(item.category)
            );
            if (!hasApplicableCategory) {
                return {
                    isValid: false,
                    error: "This promotion is not applicable to items in your cart"
                };
            }
        }

        // 8. Check applicable products
        const applicableProducts = this.safeJsonParse<string[]>(promotion.applicableProducts, []);
        if (applicableProducts.length > 0) {
            const hasApplicableProduct = orderData.items.some(item =>
                applicableProducts.includes(item.productId)
            );
            if (!hasApplicableProduct) {
                return {
                    isValid: false,
                    error: "This promotion is not applicable to items in your cart"
                };
            }
        }

        // 9. Calculate discount
        const discount = this.calculateDiscount(promotion, orderData.subtotal);

        return {
            isValid: true,
            discount,
            promotion: this.formatPromotion(promotion)
        };
    }

    /**
     * Apply promotion to order
     */
    async applyPromotion(
        promotionId: string,
        userId: string,
        orderId: string,
        discountAmount: number
    ): Promise<any> {
        // Create usage record
        const usage = await prisma.promotionUsage.create({
            data: {
                promotionId,
                userId,
                orderId,
                discountAmount
            }
        });

        // Increment promotion usage count
        await prisma.promotion.update({
            where: { id: promotionId },
            data: {
                usageCount: {
                    increment: 1
                }
            }
        });

        return usage;
    }

    /**
     * Get user's promotion history
     */
    async getUserPromotionHistory(
        userId: string,
        page: number = 1,
        limit: number = 20
    ): Promise<{
        usages: any[];
        total: number;
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
        };
    }> {
        const skip = (page - 1) * limit;

        const [usages, total] = await Promise.all([
            prisma.promotionUsage.findMany({
                where: { userId },
                include: {
                    promotion: true,
                    order: {
                        select: {
                            id: true,
                            orderNumber: true,
                            total: true,
                            createdAt: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: limit
            }),
            prisma.promotionUsage.count({ where: { userId } })
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            usages,
            total,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        };
    }

    /**
     * Calculate discount amount
     */
    calculateDiscount(promotion: any, subtotal: number): number {
        if (promotion.discountType === DiscountType.PERCENTAGE) {
            const discount = subtotal * (promotion.discountValue / 100);
            // Cap at maxDiscount if set
            if (promotion.maxDiscount !== null) {
                return Math.min(discount, promotion.maxDiscount);
            }
            return discount;
        } else {
            // FIXED_AMOUNT
            return Math.min(promotion.discountValue, subtotal);
        }
    }

    /**
     * Format promotion response (parse JSON fields)
     */
    private formatPromotion(promotion: any) {
        return {
            ...promotion,
            applicableCategories: this.safeJsonParse(promotion.applicableCategories, []),
            applicableProducts: this.safeJsonParse(promotion.applicableProducts, [])
        };
    }

    /**
     * Safely parse JSON string
     */
    private safeJsonParse<T>(jsonString: string, defaultValue: T): T {
        try {
            return JSON.parse(jsonString) as T;
        } catch {
            return defaultValue;
        }
    }
}

export default new PromotionService();
