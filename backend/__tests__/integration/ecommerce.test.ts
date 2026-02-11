import request from "supertest";
import app from "@/app";
import TestHelpers from "@utils/test-helpers";
import prisma from "@config/database";

describe("E-Commerce API Integration Tests", () => {
    let authToken: string;
    let userId: string;
    let productId: string;
    let cartItemId: string;
    let orderId: string;

    beforeAll(async () => {
        // Create test user and get token
        const user = await TestHelpers.createTestUser({
            email: "ecommerce-test@example.com",
            password: "Test@123"
        });
        userId = user.id;
        authToken = TestHelpers.generateAuthToken(user.id, user.email, user.role);

        // Create test product
        const product = await TestHelpers.createTestProduct({
            name: "Test Moisturizer",
            category: "SKINCARE",
            price: 29.99,
            stock: 100
        });
        productId = product.id;
    });

    afterAll(async () => {
        // Cleanup
        await TestHelpers.cleanupUser(userId);
        await TestHelpers.cleanupProduct(productId);
        await prisma.$disconnect();
    });

    describe("Products API", () => {
        test("GET /api/v1/products - should return product list", async () => {
            const response = await request(app)
                .get("/api/v1/products")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.products).toBeInstanceOf(Array);
            expect(response.body.pagination).toBeDefined();
        });

        test("GET /api/v1/products/:id - should return single product", async () => {
            const response = await request(app)
                .get(`/api/v1/products/${productId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.product.id).toBe(productId);
            expect(response.body.product.name).toBe("Test Moisturizer");
        });

        test("GET /api/v1/products/search - should search products", async () => {
            const response = await request(app)
                .get("/api/v1/products/search?q=moisturizer")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.products).toBeInstanceOf(Array);
        });

        test("GET /api/v1/products/featured - should return featured products", async () => {
            const response = await request(app)
                .get("/api/v1/products/featured")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.products).toBeInstanceOf(Array);
        });
    });

    describe("Cart API", () => {
        test("POST /api/v1/cart/items - should add item to cart", async () => {
            const response = await request(app)
                .post("/api/v1/cart/items")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    productId,
                    quantity: 2
                })
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.item.quantity).toBe(2);
            cartItemId = response.body.item.id;
        });

        test("GET /api/v1/cart - should get user cart", async () => {
            const response = await request(app)
                .get("/api/v1/cart")
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.cart.items).toBeInstanceOf(Array);
            expect(response.body.cart.items.length).toBeGreaterThan(0);
        });

        test("PATCH /api/v1/cart/items/:id - should update cart item quantity", async () => {
            const response = await request(app)
                .patch(`/api/v1/cart/items/${cartItemId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({ quantity: 3 })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.item.quantity).toBe(3);
        });

        test("GET /api/v1/cart/total - should calculate cart total", async () => {
            const response = await request(app)
                .get("/api/v1/cart/total")
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.total).toBeDefined();
            expect(response.body.total.subtotal).toBeGreaterThan(0);
        });
    });

    describe("Orders API", () => {
        test("POST /api/v1/orders - should create order", async () => {
            const response = await request(app)
                .post("/api/v1/orders")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    shippingAddress: {
                        street: "123 Test St",
                        city: "Test City",
                        state: "TS",
                        country: "Test Country",
                        zipCode: "12345"
                    }
                })
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.order.status).toBe("PENDING");
            orderId = response.body.order.id;
        });

        test("GET /api/v1/orders - should get user orders", async () => {
            const response = await request(app)
                .get("/api/v1/orders")
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.orders).toBeInstanceOf(Array);
            expect(response.body.orders.length).toBeGreaterThan(0);
        });

        test("GET /api/v1/orders/:id - should get order details", async () => {
            const response = await request(app)
                .get(`/api/v1/orders/${orderId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.order.id).toBe(orderId);
            expect(response.body.order.items).toBeInstanceOf(Array);
        });

        test("POST /api/v1/orders/:id/cancel - should cancel order", async () => {
            const response = await request(app)
                .post(`/api/v1/orders/${orderId}/cancel`)
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.order.status).toBe("CANCELLED");
        });

        test("DELETE /api/v1/cart/items/:id - should remove item from cart after order", async () => {
            // Add item back for cleanup test
            const addResponse = await request(app)
                .post("/api/v1/cart/items")
                .set("Authorization", `Bearer ${authToken}`)
                .send({ productId, quantity: 1 });

            const newItemId = addResponse.body.item.id;

            const response = await request(app)
                .delete(`/api/v1/cart/items/${newItemId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
        });
    });
});
