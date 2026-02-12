import request from 'supertest';
import app from '../../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Fitness API Integration Tests', () => {
    let authToken: string;
    let userId: string;

    beforeAll(async () => {
        const email = `fitness-test-${Date.now()}@example.com`;
        const registerRes = await request(app)
            .post('/api/v1/auth/register')
            .send({
                email,
                password: 'Test@1234',
                name: 'Fitness Test',
            });
        authToken = registerRes.body.data.tokens.accessToken;
        userId = registerRes.body.data.user.id;
    });

    afterAll(async () => {
        if (userId) {
            try {
                await prisma.fitnessActivity.deleteMany({ where: { userId } });
                await prisma.fitnessGoal.deleteMany({ where: { userId } });
                await prisma.user.delete({ where: { id: userId } });
            } catch (e) { }
        }
        await prisma.$disconnect();
    });

    describe('Fitness', () => {
        it('should log an activity', async () => {
            const res = await request(app)
                .post('/api/v1/fitness/activities')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    type: "RUNNING", // Ensure valid enum
                    duration: 30,
                    caloriesBurned: 300,
                    date: new Date().toISOString()
                })
                .expect(201);

            expect(res.body.success).toBe(true);
        });

        it('should get user activities', async () => {
            const res = await request(app)
                .get('/api/v1/fitness/activities')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.data.activities.length).toBeGreaterThan(0);
        });

        it('should create a goal', async () => {
            const res = await request(app)
                .post('/api/v1/fitness/goals')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    type: "WEEKLY_MINUTES" as any, // Cast if enum mismatch in test file vs prisma
                    targetValue: 150,
                    period: "WEEKLY" as any,
                    title: "Weekly Cardio"
                })
                .expect(201);

            expect(res.body.success).toBe(true);
        });
    });
});
