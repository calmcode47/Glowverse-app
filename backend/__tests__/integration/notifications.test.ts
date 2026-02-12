import request from 'supertest';
import app from '../../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Notifications API Integration Tests', () => {
    let authToken: string;
    let userId: string;
    let notificationId: string;

    beforeAll(async () => {
        // Register and login test user
        const email = `notify-test-${Date.now()}@example.com`;
        const registerRes = await request(app)
            .post('/api/v1/auth/register')
            .send({
                email,
                password: 'Test@1234',
                name: 'Notification Test',
            });

        authToken = registerRes.body.data.tokens.accessToken;
        userId = registerRes.body.data.user.id;

        // Create a dummy notification
        const notification = await prisma.notification.create({
            data: {
                userId,
                title: "Test Notification",
                message: "This is a test notification",
                type: "SYSTEM",
                priority: "HIGH" // Ensure this matches enum
            }
        });
        notificationId = notification.id;
    });

    afterAll(async () => {
        // Cleanup
        if (userId) {
            try {
                await prisma.notification.deleteMany({ where: { userId } });
                await prisma.user.delete({ where: { id: userId } });
            } catch (e) { }
        }
        await prisma.$disconnect();
    });

    describe('Notifications', () => {
        it('should get all notifications', async () => {
            const res = await request(app)
                .get('/api/v1/notifications')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.data.notifications).toBeInstanceOf(Array);
            expect(res.body.data.notifications.length).toBeGreaterThan(0);
        });

        it('should get unread count', async () => {
            const res = await request(app)
                .get('/api/v1/notifications/unread-count')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.data.count).toBeGreaterThan(0);
        });

        it('should mark notification as read', async () => {
            const res = await request(app)
                .patch(`/api/v1/notifications/${notificationId}/read`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(res.body.success).toBe(true);

            const check = await prisma.notification.findUnique({ where: { id: notificationId } });
            expect(check?.isRead).toBe(true);
        });

        it('should mark all as read', async () => {
            // Create another unread one
            await prisma.notification.create({
                data: {
                    userId,
                    title: "Another Notification",
                    message: "Test",
                    type: "SYSTEM"
                }
            });

            const res = await request(app)
                .post('/api/v1/notifications/mark-all-read')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(res.body.success).toBe(true);

            const unreadCount = await prisma.notification.count({ where: { userId, isRead: false } });
            expect(unreadCount).toBe(0);
        });

        it('should delete a notification', async () => {
            const res = await request(app)
                .delete(`/api/v1/notifications/${notificationId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(res.body.success).toBe(true);

            const check = await prisma.notification.findUnique({ where: { id: notificationId } });
            expect(check).toBeNull();
        });
    });
});
