import request from "supertest";
import app from "../../src/app";
import { prisma } from "../../src/config/database";
import TestHelpers from "../../src/utils/test-helpers";
import path from "path";

// Mock Cloudinary
jest.mock("cloudinary", () => require("../../src/utils/cloudinary-mock"));

describe("File Upload Integration Tests", () => {
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
            email: `uploader-${Date.now()}@example.com`
        });
        token = TestHelpers.generateAuthToken(user.id, user.email);
    });

    afterEach(async () => {
        await TestHelpers.cleanupUser(user.id);
    });

    describe("POST /api/v1/upload", () => {
        it("should upload a valid image successfully", async () => {
            // Note: In a real environment we'd attach a real file
            // Here we simulate it or rely on supertest attaching buffer
            const buffer = Buffer.from("fake-image-content");

            const response = await request(app)
                .post("/api/v1/upload")
                .set("Authorization", `Bearer ${token}`)
                .attach("file", buffer, "test-image.jpg");

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.url).toBeDefined();
            expect(response.body.data.url).toContain("cloudinary");
        });

        it("should reject invalid file format", async () => {
            const buffer = Buffer.from("fake-text-content");

            const response = await request(app)
                .post("/api/v1/upload")
                .set("Authorization", `Bearer ${token}`)
                .attach("file", buffer, "test.txt");

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toMatch(/invalid.*format/i);
        });

        it("should reject unauthorized upload", async () => {
            const buffer = Buffer.from("fake-image-content");

            const response = await request(app)
                .post("/api/v1/upload")
                .attach("file", buffer, "test.jpg");

            expect(response.status).toBe(401);
        });

        it("should handle upload errors gracefully", async () => {
            // Use the mock's failure trigger
            const buffer = Buffer.from("fake-image-content");

            const response = await request(app)
                .post("/api/v1/upload")
                .set("Authorization", `Bearer ${token}`)
                .attach("file", buffer, "fail-test.jpg");

            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
        });
    });
});
