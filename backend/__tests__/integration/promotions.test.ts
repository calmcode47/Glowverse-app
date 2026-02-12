import request from 'supertest';
import app from '../../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Promotions API Integration Tests', () => {
    let authToken: string;
    let promoCode: string = "TESTPROMO" + Date.now();

    beforeAll(async () => {
        // Create a promo code
        try {
            await prisma.promotion.create({
                data: {
                    code: promoCode,
                    description: "Test Discount",
                    type: "SEASONAL",
                    discountType: "PERCENTAGE",
                    discountValue: 10,
                    isActive: true,
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 86400000), // tomorrow
                    applicableCategories: "[]",
                    applicableProducts: "[]"
                }
            });
        } catch (e) {
            // Might exist already
        }

        // Auth
        const email = `promo-test-${Date.now()}@example.com`;
        const registerRes = await request(app)
            .post('/api/v1/auth/register')
            .send({
                email,
                password: 'Test@1234',
                name: 'Promo Test',
            });
        authToken = registerRes.body.data.tokens.accessToken;
    });

    afterAll(async () => {
        await prisma.promotion.deleteMany({ where: { code: promoCode } });
        await prisma.$disconnect();
    });

    describe('Promotions', () => {
        it('should validate a valid promotion', async () => {
            const res = await request(app)
                .post('/api/v1/promotions/validate')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ code: promoCode, cartTotal: 100 })
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.data.isValid).toBe(true);
            expect(res.body.data.promotion.code).toBe(promoCode);
        });

        it('should fail for invalid code', async () => {
            const res = await request(app)
                .post('/api/v1/promotions/validate')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ code: 'INVALIDCODE', cartTotal: 100 })
                .expect(400); // Or 404 depending on implementation

            expect(res.body.success).toBe(false);
        });
    });
});
