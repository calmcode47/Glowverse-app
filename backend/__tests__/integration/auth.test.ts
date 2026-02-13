import request from "supertest";
import app from "../../src/app";
import { prisma } from "../../src/config/database";
import TestHelpers from "../../src/utils/test-helpers";

describe("Authentication Integration Tests", () => {
    beforeAll(async () => {
        await TestHelpers.cleanupAllTestData();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    afterEach(async () => {
        await prisma.user.deleteMany({ where: { email: { contains: "test-auth" } } });
    });

    describe("POST /api/v1/auth/register", () => {
        const validUser = {
            email: "test-auth-register@example.com",
            password: "Password123!",
            name: "Test User"
        };

        it("should register a new user successfully", async () => {
            const response = await request(app)
                .post("/api/v1/auth/register")
                .send(validUser);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.user).toBeDefined();
            expect(response.body.data.user.email).toBe(validUser.email);
            expect(response.body.data.tokens).toBeDefined();
        });

        it("should fail when registering with duplicate email", async () => {
            await TestHelpers.createTestUser({ email: validUser.email });

            const response = await request(app)
                .post("/api/v1/auth/register")
                .send(validUser);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain("already exists");
        });

        it("should fail when registering with invalid email", async () => {
            const invalidUser = { ...validUser, email: "invalid-email" };

            const response = await request(app)
                .post("/api/v1/auth/register")
                .send(invalidUser);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it("should fail when registering with weak password", async () => {
            const weekPasswordUser = { ...validUser, password: "123" };

            const response = await request(app)
                .post("/api/v1/auth/register")
                .send(weekPasswordUser);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe("POST /api/v1/auth/login", () => {
        const loginUser = {
            email: "test-auth-login@example.com",
            password: "Password123!",
            name: "Login User"
        };

        beforeEach(async () => {
            await TestHelpers.createTestUser(loginUser);
        });

        it("should login successfully with valid credentials", async () => {
            const response = await request(app)
                .post("/api/v1/auth/login")
                .send({
                    email: loginUser.email,
                    password: loginUser.password
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.tokens).toBeDefined();
        });

        it("should fail login with invalid password", async () => {
            const response = await request(app)
                .post("/api/v1/auth/login")
                .send({
                    email: loginUser.email,
                    password: "WrongPassword123!"
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it("should fail login with non-existent email", async () => {
            const response = await request(app)
                .post("/api/v1/auth/login")
                .send({
                    email: "non-existent@example.com",
                    password: "Password123!"
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });

    describe("Token Management", () => {
        let user: any;
        let tokens: any;

        beforeEach(async () => {
            const userData = {
                email: "test-auth-tokens@example.com",
                password: "Password123!"
            };
            user = await TestHelpers.createTestUser(userData);

            const loginResponse = await request(app)
                .post("/api/v1/auth/login")
                .send(userData);
            tokens = loginResponse.body.data.tokens;
        });

        it("should refresh access token with valid refresh token", async () => {
            const response = await request(app)
                .post("/api/v1/auth/refresh")
                .send({ refreshToken: tokens.refreshToken });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.accessToken).toBeDefined();
        });

        it("should fail when refreshing with invalid token", async () => {
            const response = await request(app)
                .post("/api/v1/auth/refresh")
                .send({ refreshToken: "invalid-token" });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it("should allow logout (invalidate refresh token)", async () => {
            const response = await request(app)
                .post("/api/v1/auth/logout")
                .send({ refreshToken: tokens.refreshToken });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });
});
