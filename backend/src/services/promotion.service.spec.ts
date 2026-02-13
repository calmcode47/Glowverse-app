
import PromotionService from "../../src/services/promotion.service";
import { AppError } from "../../src/utils/errors";
import { prisma } from "../../src/config/database";

jest.mock("../../src/config/database", () => {
    const mockPrisma: any = {
        promotion: {
            findUnique: jest.fn(),
            update: jest.fn(),
            findMany: jest.fn()
        },
        promotionUsage: {
            findFirst: jest.fn(),
            create: jest.fn()
        },
        $transaction: jest.fn((callback: any) => callback(mockPrisma))
    };
    return {
        __esModule: true,
        prisma: mockPrisma
    };
});

describe("PromotionService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("validatePromotion", () => {
        it("should return discount info for valid code", async () => {
            const mockPromo = {
                id: "promo-1",
                code: "TEST10",
                type: "GENERAL",
                discountType: "PERCENTAGE",
                discountValue: 10,
                startDate: new Date("2023-01-01"),
                endDate: new Date("2099-12-31"),
                isActive: true,
                usageLimit: 100,
                usageCount: 0
            };

            (prisma.promotion.findUnique as jest.Mock).mockResolvedValue(mockPromo);
            (prisma.promotionUsage.findFirst as jest.Mock).mockResolvedValue(null); // Not used by user yet

            const result = await PromotionService.validatePromotion("TEST10", "user-1", {
                subtotal: 100,
                items: [{ productId: "p1", category: "SKINCARE" }]
            });

            expect(result.isValid).toBe(true);
            expect(result.discount).toBe(10); // 10% of 100
            expect(result.promotion.id).toBe("promo-1");
        });

        it("should return invalid for expired promo", async () => {
            const mockPromo = {
                id: "promo-1",
                code: "EXPIRED",
                isActive: true,
                startDate: new Date("2020-01-01"),
                endDate: new Date("2020-02-01"), // Expired
                usageLimit: 100,
                usageCount: 0
            };

            (prisma.promotion.findUnique as jest.Mock).mockResolvedValue(mockPromo);

            await expect(PromotionService.validatePromotion("EXPIRED", "user-1", {
                subtotal: 100,
                items: []
            })).rejects.toThrow(AppError);
        });

        it("should return invalid if usage limit reached", async () => {
            const mockPromo = {
                id: "promo-1",
                code: "FULL",
                isActive: true,
                startDate: new Date("2023-01-01"),
                endDate: new Date("2099-12-31"),
                usageLimit: 10,
                usageCount: 10 // Limit reached
            };

            (prisma.promotion.findUnique as jest.Mock).mockResolvedValue(mockPromo);

            await expect(PromotionService.validatePromotion("FULL", "user-1", {
                subtotal: 100,
                items: []
            })).rejects.toThrow(AppError);
        });
    });
});
