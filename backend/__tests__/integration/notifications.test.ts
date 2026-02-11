import request from "supertest";
import app from "@/app";
import TestHelpers from "@utils/test-helpers";
import prisma from "@config/database";

describe("Notifications API Integration Tests", () => {
    let authToken: string;
    let userId: string;
    let notificationId: string;

    beforeAll(async () => {
        // Create test user and get token
        const user = await TestHelpers.createTestUser({
            email: "notify-test@example.com"
        });
        userId = user.id;
        authToken = TestHelpers.generateAuthToken(user.id, user.email, user.role);

        // Create test notification
        const notification = await prisma.notification.create({
            data: {
                userId,
                type: "GENERAL",
                title: "Test Notification",
                message: "This is a test notification",
                isRead: false
            }
        });
        notificationId = notification.id;
    });

    afterAll(async () => {
        await TestHelpers.cleanupUser(userId);
        await prisma.$disconnect();
    });

    describe("Notifications Retrieval", () => {
        test("GET /api/v1/notifications - should get user notifications", async () => {
            const response = await request(app)
                .get("/api/v1/notifications")
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.notifications).toBeInstanceOf(Array);
            expect(response.body.notifications.length).toBeGreaterThan(0);
        });

        test("GET /api/v1/notifications/unread-count - should get unread count", async () => {
            const response = await request(app)
                .get("/api/v1/notifications/unread-count")
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.count).toBeGreaterThan(0);
        });
    });

    describe("Notifications Management", () => {
        test("PATCH /api/v1/notifications/:id/read - should mark notification as read", async () => {
            const response = await request(app)
                .patch(`/api/v1/notifications/${notificationId}/read`)
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.notification.isRead).toBe(true);
        });

        test("PATCH /api/v1/notifications/mark-all-read - should mark all as read", async () => {
            const response = await request(app)
                .patch("/api/v1/notifications/mark-all-read")
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.count).toBeGreaterThan(0);
        });

        test("DELETE /api/v1/notifications/:id - should delete notification", async () => {
            const response = await request(app)
                .delete(`/api/v1/notifications/${notificationId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
        });

        test("DELETE /api/v1/notifications/read - should delete all read notifications", async () => {
            // Create and mark as read
            const newNotification = await prisma.notification.create({
                data: {
                    userId,
                    type: "GENERAL",
                    title: "Delete Test",
                    message: "Will be deleted",
                    isRead: true
                }
            });

            const response = await request(app)
                .delete("/api/v1/notifications/read")
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
        });
    });
});
