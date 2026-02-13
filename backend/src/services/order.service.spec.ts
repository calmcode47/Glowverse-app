
import { OrderService } from "../../src/services/order.service";
import { AppError } from "../../src/utils/errors";

import { prisma } from "../../src/config/database";
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
            findUnique: jest.fn()
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
            expect(prisma.cart.findUnique).toHaveBeenCalled();
            expect(prisma.order.create).toHaveBeenCalled();
        });

        it("should throw error if cart is empty", async () => {
            (prisma.cart.findUnique as jest.Mock).mockResolvedValue({ id: "c1", items: [] });

            await expect(OrderService.createOrder("user-1", {} as any))
                .rejects.toThrow(AppError);
        });
    });

    describe("updateStatus", () => {
        it("should update order status", async () => {
            (prisma.order.findUnique as jest.Mock).mockResolvedValue({ id: "o1", status: "PENDING" });
            (prisma.order.update as jest.Mock).mockResolvedValue({ id: "o1", status: "SHIPPED" });

            const result = await OrderService.updateOrderStatus("o1", "SHIPPED");

            expect(result.status).toBe("SHIPPED");
            expect(prisma.order.update).toHaveBeenCalledWith({
                where: { id: "o1" },
                data: { status: "SHIPPED" }
            });
        });
    });
});
