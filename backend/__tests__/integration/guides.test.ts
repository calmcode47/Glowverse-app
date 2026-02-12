import request from 'supertest';
import app from '../../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Guides API Integration Tests', () => {
    let authToken: string;
    let guideId: string;
    let userId: string;

    beforeAll(async () => {
        // Ensure at least one guide exists
        const guide = await prisma.guide.findFirst();
        if (guide) {
            guideId = guide.id;
        } else {
            const newGuide = await prisma.guide.create({
                data: {
                    title: "Test Guide " + Date.now(),
                    slug: "test-guide-" + Date.now(),
                    description: "Test Desc",
                    content: "Test Content",
                    category: "SKINCARE_ROUTINE",
                    difficulty: "BEGINNER",
                    readTime: 5,
                    isPublished: true,
                }
            });
            guideId = newGuide.id;
        }

        // Auth
        const email = `guides-test-${Date.now()}@example.com`;
        const registerRes = await request(app)
            .post('/api/v1/auth/register')
            .send({
                email,
                password: 'Test@1234',
                name: 'Guides Test',
            });
        authToken = registerRes.body.data.tokens.accessToken;
        userId = registerRes.body.data.user.id;
    });

    afterAll(async () => {
        if (userId) {
            try {
                await prisma.guideLike.deleteMany({ where: { userId } });
                await prisma.guideBookmark.deleteMany({ where: { userId } });
                await prisma.guideComment.deleteMany({ where: { userId } });
                await prisma.user.delete({ where: { id: userId } });
                // Don't delete guide as it might be shared or seeded
            } catch (e) { }
        }
        await prisma.$disconnect();
    });

    describe('Guides', () => {
        it('should list guides', async () => {
            const res = await request(app)
                .get('/api/v1/guides')
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.data.guides).toBeInstanceOf(Array);
        });

        it('should get guide detail', async () => {
            const res = await request(app)
                .get(`/api/v1/guides/${guideId}`)
                .set('Authorization', `Bearer ${authToken}`) // Optional but good for coverage
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.data.id).toBe(guideId);
        });

        it('should like a guide', async () => {
            const res = await request(app)
                .post(`/api/v1/guides/${guideId}/like`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(res.body.success).toBe(true);
        });

        it('should unlike a guide', async () => {
            const res = await request(app)
                .delete(`/api/v1/guides/${guideId}/like`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(res.body.success).toBe(true);
        });

        it('should bookmark a guide', async () => {
            const res = await request(app)
                .post(`/api/v1/guides/${guideId}/bookmark`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(res.body.success).toBe(true);
        });
    });
});
