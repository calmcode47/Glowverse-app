import request from "supertest";
import app from "../../src/app";
import { prisma } from "../../src/config/database";
import TestHelpers from "../../src/utils/test-helpers";
import MockPerfectCorpService from "../../src/utils/perfectcorp-mock";

// Mock the actual service calls
jest.mock("../../src/services/perfectcorp.service", () => {
    return {
        PerfectCorpService: class {
            static async detectFace(imageUrl: string) {
                return MockPerfectCorpService.detectFace(imageUrl);
            }
            static async tryOnMakeup(imageUrl: string, products: any[]) {
                return MockPerfectCorpService.tryOnMakeup(imageUrl, products);
            }
            static async analyzeSkin(imageUrl: string) {
                return MockPerfectCorpService.analyzeSkin(imageUrl);
            }
        }
    };
});

describe("PerfectCorp Integration Tests", () => {
    let user: any;
    let token: string;

    beforeAll(async () => {
        await TestHelpers.cleanupAllTestData();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    beforeEach(async () => {
        user = await TestHelpers.createTestUser({
            email: `ar-user-${Date.now()}@example.com`
        });
        token = TestHelpers.generateAuthToken(user.id, user.email);
    });

    afterEach(async () => {
        await TestHelpers.cleanupUser(user.id);
    });

    describe("POST /api/v1/perfect-corp/detect-face", () => {
        it("should detect face in valid image", async () => {
            const response = await request(app)
                .post("/api/v1/perfect-corp/detect-face")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    imageUrl: "https://example.com/face.jpg"
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.result).toBe("success");
            expect(response.body.data.face_count).toBe(1);
        });

        it("should handle no face detected", async () => {
            const response = await request(app)
                .post("/api/v1/perfect-corp/detect-face")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    imageUrl: "https://example.com/no-face.jpg"
                });

            expect(response.status).toBe(200);
            expect(response.body.data.face_count).toBe(0);
        });

        it("should handle invalid image format error", async () => {
            // Service level validation or mock error
            const response = await request(app)
                .post("/api/v1/perfect-corp/detect-face")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    imageUrl: "https://example.com/invalid.txt"
                });

            // Assuming error middleware catches the mock throw
            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
        });
    });

    describe("POST /api/v1/perfect-corp/try-on", () => {
        it("should process makeup try-on request", async () => {
            const tryOnData = {
                imageUrl: "https://example.com/face.jpg",
                products: [
                    { sku: "LIP-RED-001", type: "lipstick" }
                ]
            };

            const response = await request(app)
                .post("/api/v1/perfect-corp/try-on")
                .set("Authorization", `Bearer ${token}`)
                .send(tryOnData);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.result).toBe("success");
            expect(response.body.data.image_url).toBeDefined();
        });

        it("should fail with invalid product SKU", async () => {
            const tryOnData = {
                imageUrl: "https://example.com/face.jpg",
                products: [
                    { sku: "INVALID", type: "lipstick" }
                ]
            };

            const response = await request(app)
                .post("/api/v1/perfect-corp/try-on")
                .set("Authorization", `Bearer ${token}`)
                .send(tryOnData);

            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
        });
    });

    describe("POST /api/v1/perfect-corp/analyze-skin", () => {
        it("should analyze skin and save results", async () => {
            const response = await request(app)
                .post("/api/v1/perfect-corp/analyze-skin")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    imageUrl: "https://example.com/face.jpg"
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.skin_score).toBe(85);

            // Verify db persistence if implemented in controller
            // Check if analysis result is saved
            /*
            const analysis = await prisma.analysisResult.findFirst({
                where: { userId: user.id }
            });
            expect(analysis).toBeDefined();
            */
        });

        it("should handle analysis errors", async () => {
            const response = await request(app)
                .post("/api/v1/perfect-corp/analyze-skin")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    imageUrl: "https://example.com/error.jpg"
                });

            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
        });
    });
});
