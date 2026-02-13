
import { OrderService } from "../../src/services/order.service";
import { AppError } from "../../src/utils/errors";

// Mock dependencies
const mockPrisma = {
    order: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn()
    },
    cart: {
        findUnique: jest.fn()
    },
    $transaction: jest.fn((callback) => callback(mockPrisma))
};

jest.mock("../../src/config/database", () => ({
    __esModule: true,
    default: mockPrisma
}));

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

            mockPrisma.cart.findUnique.mockResolvedValue(mockCart);
            mockPrisma.order.create.mockResolvedValue({
                id: "order-1",
                total: 115, // 100 + 10 tax + 5 shipping
                status: "PENDING"
            });

            const result = await OrderService.createOrder("user-1", {
                shippingAddress: { street: "123 St" },
                paymentMethod: "CREDIT_CARD"
            });

            expect(result).toBeDefined();
            expect(result.id).toBe("order-1");
            expect(mockPrisma.cart.findUnique).toHaveBeenCalled();
            expect(mockPrisma.order.create).toHaveBeenCalled();
        });

        it("should throw error if cart is empty", async () => {
            mockPrisma.cart.findUnique.mockResolvedValue({ id: "c1", items: [] });

            await expect(OrderService.createOrder("user-1", {} as any))
                .rejects.toThrow(AppError);
        });
    });

    describe("updateStatus", () => {
        it("should update order status", async () => {
            mockPrisma.order.findUnique.mockResolvedValue({ id: "o1", status: "PENDING" });
            mockPrisma.order.update.mockResolvedValue({ id: "o1", status: "SHIPPED" });

            const result = await OrderService.updateOrderStatus("o1", "SHIPPED");

            expect(result.status).toBe("SHIPPED");
            expect(mockPrisma.order.update).toHaveBeenCalledWith({
                where: { id: "o1" },
                data: { status: "SHIPPED" }
            });
        });
    });
});
