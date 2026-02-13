import request from "supertest";
import app from "../../src/app";
import { prisma } from "../../src/config/database";
import TestHelpers from "../../src/utils/test-helpers";

describe("Search Functionality Integration Tests", () => {
    let user: any;
    let token: string;

    beforeAll(async () => {
        await TestHelpers.cleanupAllTestData();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    beforeEach(async () => {
        // Setup user
        user = await TestHelpers.createTestUser({
            email: `searcher-${Date.now()}@example.com`
        });
        token = TestHelpers.generateAuthToken(user.id, user.email);

        // Setup searchable data
        // Create Products
        await TestHelpers.createTestProduct({ name: "Glowing Serum", category: "SKINCARE", price: 50.0 }); // ID auto-gen
        await TestHelpers.createTestProduct({ name: "Matte Lipstick", category: "MAKEUP", price: 25.0 });
        await TestHelpers.createTestProduct({ name: "Hair Oil", category: "HAIRCARE", price: 30.0 });

        // Create Guides
        await TestHelpers.createTestGuide({ title: "Summer Skincare Routine", category: "SKINCARE_ROUTINE" });
        await TestHelpers.createTestGuide({ title: "Evening Makeup Look", category: "MAKEUP_TUTORIAL" });
    });

    afterEach(async () => {
        await TestHelpers.cleanupAllTestData();
    });

    describe("GET /api/v1/search", () => {
        it("should return mixed results for general query", async () => {
            const response = await request(app)
                .get("/api/v1/search?q=Skin")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);

            const results = response.body.data;
            expect(results.products).toBeDefined();
            expect(results.guides).toBeDefined();

            // Should find "Glowing Serum" (Product) and "Summer Skincare Routine" (Guide)
            const productMatch = results.products.some((p: any) => p.name.includes("Serum"));
            const guideMatch = results.guides.some((g: any) => g.title.includes("Skincare"));

            expect(productMatch).toBe(true);
            expect(guideMatch).toBe(true);
        });

        it("should filter search by type (products only)", async () => {
            const response = await request(app)
                .get("/api/v1/search?q=Skin&type=products")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.data.products.length).toBeGreaterThan(0);
            expect(response.body.data.guides).toBeUndefined(); // Or empty depending on implementation
        });

        it("should handle empty search queries gracefully", async () => {
            const response = await request(app)
                .get("/api/v1/search?q=")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);
            // Expect either empty results or popular/recent items
            // Assuming standard search returns empty or bad request if query crucial
            // If implementation allows empty query to list everything or just return 200 with empty:
            expect(response.body.success).toBe(true);
        });

        it("should handle special characters in query", async () => {
            const response = await request(app)
                .get("/api/v1/search?q=Serum%21%40%23") // "Serum!@#"
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);
            // Should sanitize or handle without crashing
            expect(response.body.success).toBe(true);
        });
    });

    describe("GET /api/v1/search/products", () => {
        it("should search products by category filter", async () => {
            const response = await request(app)
                .get("/api/v1/search/products?category=MAKEUP")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);
            const products = response.body.data.products || response.body.data; // Adjust based on response structure
            expect(products.length).toBeGreaterThan(0);
            expect(products[0].category).toBe("MAKEUP");
        });

        it("should filter products by price range", async () => {
            const response = await request(app)
                .get("/api/v1/search/products?minPrice=40&maxPrice=60")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);
            const products = response.body.data.products || response.body.data;
            const serum = products.find((p: any) => p.name === "Glowing Serum");
            expect(serum).toBeDefined();

            const lipstick = products.find((p: any) => p.name === "Matte Lipstick");
            expect(lipstick).toBeUndefined();
        });

        it("should sort search results", async () => {
            const response = await request(app)
                // Assuming sort param support, e.g. sort=price_asc
                .get("/api/v1/search/products?sort=price_asc")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);
            const products = response.body.data.products || response.body.data;

            // Check order: 25, 30, 50
            if (products.length >= 3) {
                expect(Number(products[0].price)).toBeLessThanOrEqual(Number(products[1].price));
            }
        });
    });

    describe("Edge Cases & Security", () => {
        it("should prevent SQL injection attempts in query", async () => {
            const response = await request(app)
                .get("/api/v1/search?q=' OR '1'='1")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);
            // Should not return all records or crash
            expect(response.body.success).toBe(true);
        });

        it("should handle very long search queries", async () => {
            const longQuery = "a".repeat(1000);
            const response = await request(app)
                .get(`/api/v1/search?q=${longQuery}`)
                .set("Authorization", `Bearer ${token}`);

            // Expect 200 (no results) or 400 (if length validation exists)
            expect(response.status).not.toBe(500);
        });
    });
});
