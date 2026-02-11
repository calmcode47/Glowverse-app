import request from "supertest";
import app from "@/app";
import TestHelpers from "@utils/test-helpers";
import prisma from "@config/database";

describe("Promotions & Referrals API Integration Tests", () => {
    let authToken: string;
    let userId: string;
    let promotionCode: string;
    let referralCode: string;

    beforeAll(async () => {
        // Create test user and get token
        const user = await TestHelpers.createTestUser({
            email: "promo-test@example.com"
        });
        userId = user.id;
        authToken = TestHelpers.generateAuthToken(user.id, user.email, user.role);

        // Create test promotion
        const promotion = await TestHelpers.createTestPromotion({
            code: "TESTDISCOUNT20",
            discountType: "PERCENTAGE",
            discountValue: 20
        });
        promotionCode = promotion.code;
    });

    afterAll(async () => {
        await TestHelpers.cleanupUser(userId);
        await prisma.promotion.delete({ where: { code: promotionCode } }).catch(() => { });
        await prisma.$disconnect();
    });

    describe("Promotions API", () => {
        test("GET /api/v1/promotions/active - should get active promotions", async () => {
            const response = await request(app)
                .get("/api/v1/promotions/active")
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.promotions).toBeInstanceOf(Array);
        });

        test("POST /api/v1/promotions/validate - should validate promotion code", async () => {
            const response = await request(app)
                .post("/api/v1/promotions/validate")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    code: promotionCode,
                    cartItems: [
                        { productId: "test-id", quantity: 2, price: 50 }
                    ]
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.promotion.code).toBe(promotionCode);
            expect(response.body.discountAmount).toBeGreaterThan(0);
        });

        test("POST /api/v1/promotions/validate - should reject invalid code", async () => {
            await request(app)
                .post("/api/v1/promotions/validate")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    code: "INVALIDCODE",
                    cartItems: [
                        { productId: "test-id", quantity: 2, price: 50 }
                    ]
                })
                .expect(404);
        });

        test("GET /api/v1/promotions/history - should get promotion usage history", async () => {
            const response = await request(app)
                .get("/api/v1/promotions/history")
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.history).toBeInstanceOf(Array);
        });
    });

    describe("Referrals API", () => {
        test("GET /api/v1/referrals/code - should get user referral code", async () => {
            const response = await request(app)
                .get("/api/v1/referrals/code")
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.code).toBeDefined();
            referralCode = response.body.code;
        });

        test("GET /api/v1/referrals/stats - should get referral stats", async () => {
            const response = await request(app)
                .get("/api/v1/referrals/stats")
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.stats).toBeDefined();
            expect(response.body.stats.totalReferrals).toBeDefined();
        });

        test("GET /api/v1/referrals - should get referral list", async () => {
            const response = await request(app)
                .get("/api/v1/referrals")
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.referrals).toBeInstanceOf(Array);
        });

        test("POST /api/v1/referrals/apply - should apply referral code", async () => {
            // Create another user to apply the referral
            const newUser = await TestHelpers.createTestUser({
                email: "referred-user@example.com"
            });
            const newAuthToken = TestHelpers.generateAuthToken(newUser.id, newUser.email, newUser.role);

            const response = await request(app)
                .post("/api/v1/referrals/apply")
                .set("Authorization", `Bearer ${newAuthToken}`)
                .send({ code: referralCode })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain("applied");

            // Cleanup
            await TestHelpers.cleanupUser(newUser.id);
        });
    });
});
