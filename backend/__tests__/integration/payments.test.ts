import request from 'supertest';
import app from '../../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Payment API Integration Tests', () => {
    let authToken: string;
    let userId: string;

    beforeAll(async () => {
        // Clean up before starting
        try {
            await prisma.user.delete({ where: { email: 'payment-test@example.com' } });
        } catch (e) { }

        // Register
        const registerRes = await request(app)
            .post('/api/v1/auth/register')
            .send({
                email: 'payment-test@example.com',
                password: 'Test@1234',
                name: 'Payment Test',
            });

        if (registerRes.status === 400 || registerRes.status === 409) {
            const loginRes = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'payment-test@example.com',
                    password: 'Test@1234',
                });
            authToken = loginRes.body.data.tokens.accessToken;
            userId = loginRes.body.data.user.id;
        } else {
            authToken = registerRes.body.data.tokens.accessToken;
            userId = registerRes.body.data.user.id;
        }
    });

    afterAll(async () => {
        if (userId) {
            try {
                await prisma.user.delete({ where: { id: userId } });
            } catch (e) {
                console.error("Cleanup failed", e);
            }
        }
        await prisma.$disconnect();
    });

    describe('Payment Intents', () => {
        it('should create a payment intent', async () => {
            const res = await request(app)
                .post('/api/v1/payments/create-intent')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    amount: 5000, // $50.00
                    currency: 'usd',
                    metadata: { cartId: 'test_cart' }
                })
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.clientSecret).toBeDefined();
            expect(res.body.clientSecret).toContain('pi_');
        });

        it('should confirm a payment method', async () => {
            const res = await request(app)
                .post('/api/v1/payments/confirm')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    paymentIntentId: 'pi_test_123',
                    paymentMethodId: 'pm_test_123'
                })
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.message).toContain('recorded');
        });
    });

    describe('Saved Methods', () => {
        it('should get saved payment methods', async () => {
            const res = await request(app)
                .get('/api/v1/payments/methods')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('should save a payment method', async () => {
            const res = await request(app)
                .post('/api/v1/payments/methods')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ paymentMethodId: 'pm_test_456' })
                .expect(200);

            expect(res.body.success).toBe(true);
        });

        it('should delete a payment method', async () => {
            const res = await request(app)
                .delete('/api/v1/payments/methods/pm_test_456')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(res.body.success).toBe(true);
        });
    });
});
