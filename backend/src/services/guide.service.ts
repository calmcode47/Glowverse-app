import { PrismaClient, Guide, GuideCategory, DifficultyLevel, Prisma } from '@prisma/client';
import { AppError } from '../utils/errors';

const prisma = new PrismaClient();

export class GuideService {
    /**
     * Get all guides with pagination and filtering
     */
    static async getGuides(filters: {
        category?: GuideCategory;
        isFeatured?: boolean;
        page?: number;
        limit?: number;
        search?: string;
    }) {
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const skip = (page - 1) * limit;

        const where: Prisma.GuideWhereInput = {
            isPublished: true,
        };

        if (filters.category) where.category = filters.category;
        if (filters.isFeatured !== undefined) where.isFeatured = filters.isFeatured;
        if (filters.search) {
            where.OR = [
                { title: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
                { tags: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        const [guides, total] = await Promise.all([
            prisma.guide.findMany({
                where,
                orderBy: { publishedAt: 'desc' },
                skip,
                take: limit,
                include: {
                    author: {
                        select: { id: true, name: true, avatar: true },
                    },
                },
            }),
            prisma.guide.count({ where }),
        ]);

        return { guides, total, page, limit, pages: Math.ceil(total / limit) };
    }

    /**
     * Get a single guide by ID or Slug
     */
    static async getGuide(idOrSlug: string, userId?: string) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

        const where: Prisma.GuideWhereInput = isUuid
            ? { id: idOrSlug }
            : { slug: idOrSlug };

        const guide = await prisma.guide.findFirst({
            where: {
                ...where,
                isPublished: true,
            },
            include: {
                author: {
                    select: { id: true, name: true, avatar: true },
                },
                steps: {
                    orderBy: { order: 'asc' },
                },
                comments: {
                    include: {
                        user: { select: { id: true, name: true, avatar: true } },
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                },
            },
        });

        if (!guide) {
            throw new AppError('Guide not found', 404);
        }

        // Check engagement if user is logged in
        let isLiked = false;
        let isBookmarked = false;

        if (userId) {
            const [like, bookmark] = await Promise.all([
                prisma.guideLike.findUnique({
                    where: { guideId_userId: { guideId: guide.id, userId } },
                }),
                prisma.guideBookmark.findUnique({
                    where: { guideId_userId: { guideId: guide.id, userId } },
                }),
            ]);
            isLiked = !!like;
            isBookmarked = !!bookmark;
        }

        // Async increment view count
        this.incrementViewCount(guide.id);

        return { ...guide, isLiked, isBookmarked };
    }

    /**
     * Search guides
     */
    static async searchGuides(query: string, limit: number = 20): Promise<Guide[]> {
        if (!query) return [];

        return prisma.guide.findMany({
            where: {
                isPublished: true,
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                    { content: { contains: query, mode: 'insensitive' } },
                    { tags: { contains: query, mode: 'insensitive' } },
                ],
            },
            take: limit,
            orderBy: [
                { likeCount: 'desc' },
                { viewCount: 'desc' },
            ],
            include: {
                author: { select: { name: true } },
            },
        });
    }

    /**
     * Get related guides
     */
    static async getRelatedGuides(guideId: string, limit: number = 6): Promise<Guide[]> {
        const guide = await prisma.guide.findUnique({
            where: { id: guideId },
        });

        if (!guide) return [];

        // Simple implementation: same category, excluding current
        // Could accept tags parsing if they were actually JSON arrays in DB, but simple string contains is safer for now if stored as stringified JSON
        return prisma.guide.findMany({
            where: {
                id: { not: guideId },
                isPublished: true,
                category: guide.category,
            },
            take: limit,
            orderBy: { publishedAt: 'desc' },
        });
    }

    /**
     * Get featured guides
     */
    static async getFeaturedGuides(): Promise<Guide[]> {
        return prisma.guide.findMany({
            where: { isPublished: true, isFeatured: true },
            orderBy: { publishedAt: 'desc' },
            take: 5,
        });
    }

    /**
     * Get trending guides (most likes/views in last 30 days - simplified to all time high engagement for now)
     */
    static async getTrendingGuides(): Promise<Guide[]> {
        return prisma.guide.findMany({
            where: { isPublished: true },
            orderBy: [
                { likeCount: 'desc' },
                { viewCount: 'desc' },
            ],
            take: 10,
        });
    }

    /**
     * Get new guides
     */
    static async getNewGuides(): Promise<Guide[]> {
        return prisma.guide.findMany({
            where: { isPublished: true },
            orderBy: { publishedAt: 'desc' },
            take: 10,
        });
    }

    /**
     * Like a guide
     */
    static async likeGuide(userId: string, guideId: string) {
        const existing = await prisma.guideLike.findUnique({
            where: { guideId_userId: { guideId, userId } },
        });

        if (existing) return;

        await prisma.$transaction([
            prisma.guideLike.create({
                data: { guideId, userId },
            }),
            prisma.guide.update({
                where: { id: guideId },
                data: { likeCount: { increment: 1 } },
            }),
        ]);
    }

    /**
     * Unlike a guide
     */
    static async unlikeGuide(userId: string, guideId: string) {
        const existing = await prisma.guideLike.findUnique({
            where: { guideId_userId: { guideId, userId } },
        });

        if (!existing) return;

        await prisma.$transaction([
            prisma.guideLike.delete({
                where: { guideId_userId: { guideId, userId } },
            }),
            prisma.guide.update({
                where: { id: guideId },
                data: { likeCount: { decrement: 1 } },
            }),
        ]);
    }

    /**
     * Bookmark a guide
     */
    static async bookmarkGuide(userId: string, guideId: string) {
        const existing = await prisma.guideBookmark.findUnique({
            where: { guideId_userId: { guideId, userId } },
        });

        if (existing) return;

        await prisma.$transaction([
            prisma.guideBookmark.create({
                data: { guideId, userId },
            }),
            prisma.guide.update({
                where: { id: guideId },
                data: { bookmarkCount: { increment: 1 } },
            }),
        ]);
    }

    /**
     * Remove bookmark
     */
    static async removeBookmark(userId: string, guideId: string) {
        const existing = await prisma.guideBookmark.findUnique({
            where: { guideId_userId: { guideId, userId } },
        });

        if (!existing) return;

        await prisma.$transaction([
            prisma.guideBookmark.delete({
                where: { guideId_userId: { guideId, userId } },
            }),
            prisma.guide.update({
                where: { id: guideId },
                data: { bookmarkCount: { decrement: 1 } },
            }),
        ]);
    }

    /**
     * Get user bookmarks
     */
    static async getUserBookmarks(userId: string) {
        const bookmarks = await prisma.guideBookmark.findMany({
            where: { userId },
            include: {
                guide: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return bookmarks.map(b => b.guide);
    }

    /**
     * Comment on guide
     */
    static async commentOnGuide(userId: string, guideId: string, content: string, rating?: number) {
        return prisma.guideComment.create({
            data: {
                userId,
                guideId,
                content,
                rating,
                isApproved: true, // Auto-approve for now
            },
            include: {
                user: { select: { id: true, name: true, avatar: true } },
            },
        });
    }

    /**
     * Track share
     */
    static async trackShare(guideId: string) {
        return prisma.guide.update({
            where: { id: guideId },
            data: { shareCount: { increment: 1 } },
        });
    }

    /**
     * Increment view count
     */
    static async incrementViewCount(guideId: string) {
        try {
            await prisma.guide.update({
                where: { id: guideId },
                data: { viewCount: { increment: 1 } },
            });
        } catch (e) {
            // Ignore errors for analytics
        }
    }

    /**
     * Get guides by category helper
     */
    static async getGuidesByCategory(category: GuideCategory) {
        return this.getGuides({ category });
    }
}

export default GuideService;
