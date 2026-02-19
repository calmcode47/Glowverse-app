
import { OrderService } from "../../src/services/order.service";
import { AppError } from "../../src/utils/errors";

// Mock CartService
jest.mock("../../src/services/cart.service", () => ({
    CartService: {
        validateCart: jest.fn(),
        getOrCreateCart: jest.fn()
    }
}));

// Mock dependencies
import { prisma } from "../../src/config/database";
import { CartService } from "../../src/services/cart.service";
const mockPrisma = prisma as any;

// Mock dependencies
jest.mock("../../src/config/database", () => {
    const mockPrisma: any = {
        order: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            findMany: jest.fn()
        },
        cart: {
            findUnique: jest.fn(),
            update: jest.fn(),
            deleteMany: jest.fn()
        },
        cartItem: {
            deleteMany: jest.fn()
        },
        product: {
            update: jest.fn(),
            findUnique: jest.fn()
        },
        notification: {
            create: jest.fn()
        },
        $transaction: jest.fn((callback: any) => callback(mockPrisma))
    };
    return {
        __esModule: true,
        prisma: mockPrisma
    };
});

describe("OrderService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("createOrder", () => {
        it("should create order from cart", async () => {
            // Mock CartService methods
            (CartService.validateCart as jest.Mock).mockResolvedValue({
                valid: true,
                issues: []
            });

            const mockCart = {
                id: "cart-1",
                userId: "user-1",
                items: [
                    {
                        id: "item-1",
                        quantity: 1,
                        price: 100,
                        subtotal: 100,
                        product: { id: "p1", name: "P1", price: 100, stock: 10 }
                    }
                ]
            };
            (CartService.getOrCreateCart as jest.Mock).mockResolvedValue(mockCart);

            (prisma.cart.findUnique as jest.Mock).mockResolvedValue(mockCart);
            (prisma.order.create as jest.Mock).mockResolvedValue({
                id: "order-1",
                total: 115, // 100 + 10 tax + 5 shipping
                status: "PENDING"
            });

            const result = await OrderService.createOrder("user-1", {
                shippingAddress: { street: "123 St" } as any,
                paymentMethod: "CREDIT_CARD"
            });

            expect(result).toBeDefined();
            expect(result.id).toBe("order-1");
            expect(CartService.validateCart).toHaveBeenCalled();
            expect(CartService.getOrCreateCart).toHaveBeenCalled();
            expect(prisma.order.create).toHaveBeenCalled();
        });

        it("should throw error if cart is empty", async () => {
            (CartService.validateCart as jest.Mock).mockResolvedValue({
                valid: true,
                issues: []
            });
            (CartService.getOrCreateCart as jest.Mock).mockResolvedValue({ id: "c1", items: [] });

            await expect(OrderService.createOrder("user-1", {} as any))
                .rejects.toThrow(AppError);
        });
    });

    describe("updateStatus", () => {
        it("should update order status", async () => {
            (prisma.order.findUnique as jest.Mock).mockResolvedValue({ 
                id: "o1", 
                status: "PENDING",
                items: []
            });
            (prisma.order.update as jest.Mock).mockResolvedValue({ 
                id: "o1", 
                status: "SHIPPED",
                items: []
            });

            const result = await OrderService.updateOrderStatus("o1", "SHIPPED");

            expect(result.status).toBe("SHIPPED");
            expect(prisma.order.update).toHaveBeenCalledWith({
                where: { id: "o1" },
                data: { status: "SHIPPED" },
                include: { items: true }
            });
        });
    });
});
