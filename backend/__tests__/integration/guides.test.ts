import request from "supertest";
import app from "@/app";
import TestHelpers from "@utils/test-helpers";
import prisma from "@config/database";

describe("Guides API Integration Tests", () => {
    let authToken: string;
    let userId: string;
    let guideId: string;
    let guideSlug: string;

    beforeAll(async () => {
        // Create test user and get token
        const user = await TestHelpers.createTestUser({
            email: "guides-test@example.com"
        });
        userId = user.id;
        authToken = TestHelpers.generateAuthToken(user.id, user.email, user.role);

        // Create test guide
        const guide = await TestHelpers.createTestGuide({
            title: "Test Skincare Guide",
            category: "SKINCARE_ROUTINE"
        });
        guideId = guide.id;
        guideSlug = guide.slug;
    });

    afterAll(async () => {
        await TestHelpers.cleanupUser(userId);
        await prisma.guide.delete({ where: { id: guideId } }).catch(() => { });
        await prisma.$disconnect();
    });

    describe("Guide Discovery", () => {
        test("GET /api/v1/guides - should return guide list", async () => {
            const response = await request(app)
                .get("/api/v1/guides")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.guides).toBeInstanceOf(Array);
            expect(response.body.pagination).toBeDefined();
        });

        test("GET /api/v1/guides?category=SKINCARE_ROUTINE - should filter by category", async () => {
            const response = await request(app)
                .get("/api/v1/guides?category=SKINCARE_ROUTINE")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.guides).toBeInstanceOf(Array);
        });

        test("GET /api/v1/guides/trending - should return trending guides", async () => {
            const response = await request(app)
                .get("/api/v1/guides/trending")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.guides).toBeInstanceOf(Array);
        });

        test("GET /api/v1/guides/featured - should return featured guides", async () => {
            const response = await request(app)
                .get("/api/v1/guides/featured")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.guides).toBeInstanceOf(Array);
        });

        test("GET /api/v1/guides/search?q=skincare - should search guides", async () => {
            const response = await request(app)
                .get("/api/v1/guides/search?q=skincare")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.guides).toBeInstanceOf(Array);
        });
    });

    describe("Single Guide", () => {
        test("GET /api/v1/guides/:slug - should get guide by slug", async () => {
            const response = await request(app)
                .get(`/api/v1/guides/${guideSlug}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.guide.slug).toBe(guideSlug);
            expect(response.body.guide.isLiked).toBe(false);
            expect(response.body.guide.isBookmarked).toBe(false);
        });

        test("GET /api/v1/guides/:id - should get guide by ID", async () => {
            const response = await request(app)
                .get(`/api/v1/guides/${guideId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.guide.id).toBe(guideId);
        });

        test("GET /api/v1/guides/:id/related - should get related guides", async () => {
            const response = await request(app)
                .get(`/api/v1/guides/${guideId}/related`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.guides).toBeInstanceOf(Array);
        });

        test("GET /api/v1/guides/:id/stats - should get guide stats", async () => {
            const response = await request(app)
                .get(`/api/v1/guides/${guideId}/stats`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.stats).toBeDefined();
            expect(response.body.stats.viewCount).toBeGreaterThan(0);
        });
    });

    describe("Guide Engagement (Authenticated)", () => {
        test("POST /api/v1/guides/:id/like - should like guide", async () => {
            const response = await request(app)
                .post(`/api/v1/guides/${guideId}/like`)
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain("liked");
        });

        test("POST /api/v1/guides/:id/like - should not allow duplicate like", async () => {
            await request(app)
                .post(`/api/v1/guides/${guideId}/like`)
                .set("Authorization", `Bearer ${authToken}`)
                .expect(409); // Conflict
        });

        test("POST /api/v1/guides/:id/bookmark - should bookmark guide", async () => {
            const response = await request(app)
                .post(`/api/v1/guides/${guideId}/bookmark`)
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain("bookmarked");
        });

        test("GET /api/v1/guides/user/bookmarks - should get user bookmarks", async () => {
            const response = await request(app)
                .get("/api/v1/guides/user/bookmarks")
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.guides).toBeInstanceOf(Array);
            expect(response.body.guides.length).toBeGreaterThan(0);
        });

        test("DELETE /api/v1/guides/:id/bookmark - should remove bookmark", async () => {
            const response = await request(app)
                .delete(`/api/v1/guides/${guideId}/bookmark`)
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain("removed");
        });

        test("DELETE /api/v1/guides/:id/like - should unlike guide", async () => {
            const response = await request(app)
                .delete(`/api/v1/guides/${guideId}/like`)
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain("unliked");
        });
    });
});
