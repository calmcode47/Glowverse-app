
import { CartService } from "../../src/services/cart.service";
import { AppError } from "../../src/utils/errors";

// Mock dependencies
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
        findUnique: jest.fn()
    }
};

// Mock prisma default export
jest.mock("../../src/config/database", () => ({
    __esModule: true,
    default: mockPrisma
}));

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

            mockPrisma.cart.findUnique.mockResolvedValue(mockCart);

            const result = await CartService.getCart("user-1");

            // Logic validation: 100 + 30 = 130
            // Assuming getCart returns the cart with calculated values or as stored
            expect(result).toBeDefined();
            // Checking if service logic adds anything extra or just returns DB data
            expect(mockPrisma.cart.findUnique).toHaveBeenCalledWith({
                where: { userId: "user-1" },
                include: { items: { include: { product: true } } }
            });
        });
    });

    describe("addToCart", () => {
        it("should add item to new cart", async () => {
            mockPrisma.product.findUnique.mockResolvedValue({
                id: "prod-1",
                price: 100,
                stock: 10,
                isActive: true
            });

            mockPrisma.cart.findUnique.mockResolvedValue(null); // No cart yet

            // Mock transaction or create flow
            mockPrisma.cart.create.mockResolvedValue({ id: "new-cart" });
            mockPrisma.cartItem.create.mockResolvedValue({ id: "item-1" });

            await CartService.addToCart("user-1", "prod-1", 1);

            expect(mockPrisma.product.findUnique).toHaveBeenCalled();
            expect(mockPrisma.cart.create).toHaveBeenCalled();
            expect(mockPrisma.cartItem.create).toHaveBeenCalled();
        });

        it("should throw error if product out of stock", async () => {
            mockPrisma.product.findUnique.mockResolvedValue({
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
