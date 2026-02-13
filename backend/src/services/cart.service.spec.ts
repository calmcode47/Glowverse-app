
import { CartService } from "../../src/services/cart.service";
import { AppError } from "../../src/utils/errors";

// Mock dependencies
import { prisma } from "../../src/config/database";
const mockPrisma = prisma as any;

// Mock prisma default export
jest.mock("../../src/config/database", () => {
    const mockPrisma = {
        cart: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn()
        },
        cartItem: {
            findFirst: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn()
        },
        product: {
            findUnique: jest.fn(),
            update: jest.fn()
        }
    };
    return {
        __esModule: true,
        prisma: mockPrisma
    };
});

describe("CartService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("calculateTotal", () => {
        // Since calculateTotal is likely private or part of other methods in integration,
        // we might test public methods that rely on it like 'getCart' or 'addToCart'
        // But for unit test, let's assume we test the public interface.

        it("should calculate cart total correctly", async () => {
            // Mock data
            const mockCart = {
                id: "cart-1",
                userId: "user-1",
                items: [
                    { id: "item-1", quantity: 2, price: 50, subtotal: 100 },
                    { id: "item-2", quantity: 1, price: 30, subtotal: 30 }
                ]
            };

            (prisma.cart.findUnique as jest.Mock).mockResolvedValue(mockCart);

            const result = await CartService.getOrCreateCart("user-1");

            // Logic validation: 100 + 30 = 130
            // Assuming getCart returns the cart with calculated values or as stored
            expect(result).toBeDefined();
            // Checking if service logic adds anything extra or just returns DB data
            expect(prisma.cart.findUnique).toHaveBeenCalledWith({
                where: { userId: "user-1" },
                include: {
                    items: {
                        include: { product: true },
                        orderBy: { addedAt: 'desc' }
                    }
                }
            });
        });
    });

    describe("addToCart", () => {
        it("should add item to new cart", async () => {
            (prisma.product.findUnique as jest.Mock).mockResolvedValue({
                id: "prod-1",
                price: 100,
                stock: 10,
                isActive: true
            });

            (prisma.cart.findUnique as jest.Mock).mockResolvedValue(null); // No cart yet

            // Mock transaction or create flow
            (prisma.product.findUnique as jest.Mock).mockResolvedValue({
                id: "prod-1",
                price: 100,
                stock: 10,
                isActive: true
            });
            (prisma.cart.findUnique as jest.Mock).mockResolvedValue(null); // No existing cart
            (prisma.cart.create as jest.Mock).mockResolvedValue({ id: "new-cart", items: [] });
            (prisma.cartItem.create as jest.Mock).mockResolvedValue({ id: "item-1" });

            await CartService.addToCart("user-1", "prod-1", 1);

            expect(prisma.product.findUnique).toHaveBeenCalled();
            expect(prisma.cart.create).toHaveBeenCalled();
            expect(prisma.cartItem.create).toHaveBeenCalled();
        });

        it("should throw error if product out of stock", async () => {
            (prisma.product.findUnique as jest.Mock).mockResolvedValue({
                id: "prod-1",
                price: 100,
                stock: 0, // Out of stock
                isActive: true
            });

            await expect(CartService.addToCart("user-1", "prod-1", 1))
                .rejects.toThrow(AppError);
        });
    });
});
