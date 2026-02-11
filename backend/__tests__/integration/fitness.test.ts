import request from "supertest";
import app from "@/app";
import TestHelpers from "@utils/test-helpers";
import prisma from "@config/database";

describe("Fitness API Integration Tests", () => {
    let authToken: string;
    let userId: string;
    let activityId: string;
    let goalId: string;

    beforeAll(async () => {
        // Create test user and get token
        const user = await TestHelpers.createTestUser({
            email: "fitness-test@example.com"
        });
        userId = user.id;
        authToken = TestHelpers.generateAuthToken(user.id, user.email, user.role);
    });

    afterAll(async () => {
        await TestHelpers.cleanupUser(userId);
        await prisma.$disconnect();
    });

    describe("Fitness Activities", () => {
        test("POST /api/v1/fitness/activities - should log activity", async () => {
            const response = await request(app)
                .post("/api/v1/fitness/activities")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    type: "RUNNING",
                    durationMinutes: 30,
                    intensity: "MODERATE",
                    caloriesBurned: 300,
                    distance: 5.0,
                    activityDate: new Date().toISOString()
                })
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.activity.type).toBe("RUNNING");
            expect(response.body.activity.durationMinutes).toBe(30);
            activityId = response.body.activity.id;
        });

        test("GET /api/v1/fitness/activities - should get user activities", async () => {
            const response = await request(app)
                .get("/api/v1/fitness/activities")
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.activities).toBeInstanceOf(Array);
            expect(response.body.activities.length).toBeGreaterThan(0);
        });

        test("GET /api/v1/fitness/activities/:id - should get specific activity", async () => {
            const response = await request(app)
                .get(`/api/v1/fitness/activities/${activityId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.activity.id).toBe(activityId);
        });

        test("PATCH /api/v1/fitness/activities/:id - should update activity", async () => {
            const response = await request(app)
                .patch(`/api/v1/fitness/activities/${activityId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({ durationMinutes: 35 })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.activity.durationMinutes).toBe(35);
        });
    });

    describe("Fitness Statistics", () => {
        test("GET /api/v1/fitness/stats?period=week - should get weekly stats", async () => {
            const response = await request(app)
                .get("/api/v1/fitness/stats?period=week")
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.stats).toBeDefined();
            expect(response.body.stats.totalActivities).toBeGreaterThan(0);
        });

        test("GET /api/v1/fitness/stats?period=month - should get monthly stats", async () => {
            const response = await request(app)
                .get("/api/v1/fitness/stats?period=month")
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.stats).toBeDefined();
        });
    });

    describe("Fitness Goals", () => {
        test("POST /api/v1/fitness/goals - should create goal", async () => {
            const response = await request(app)
                .post("/api/v1/fitness/goals")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    type: "WEEKLY_MINUTES",
                    target: 150,
                    unit: "minutes",
                    period: "WEEKLY"
                })
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.goal.type).toBe("WEEKLY_MINUTES");
            expect(response.body.goal.target).toBe(150);
            goalId = response.body.goal.id;
        });

        test("GET /api/v1/fitness/goals - should get active goals", async () => {
            const response = await request(app)
                .get("/api/v1/fitness/goals")
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.goals).toBeInstanceOf(Array);
            expect(response.body.goals.length).toBeGreaterThan(0);
        });

        test("GET /api/v1/fitness/goals/history - should get goal history", async () => {
            const response = await request(app)
                .get("/api/v1/fitness/goals/history")
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.goals).toBeInstanceOf(Array);
        });

        test("DELETE /api/v1/fitness/goals/:id - should delete goal", async () => {
            const response = await request(app)
                .delete(`/api/v1/fitness/goals/${goalId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
        });

        test("DELETE /api/v1/fitness/activities/:id - should delete activity", async () => {
            const response = await request(app)
                .delete(`/api/v1/fitness/activities/${activityId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
        });
    });
});
