import prisma from "@config/database";
import { NotFoundError, ConflictError } from "@utils/errors";

/**
 * Guide Category Enum
 */
export enum GuideCategory {
    SKINCARE_ROUTINE = 'SKINCARE_ROUTINE',
    HAIRCARE = 'HAIRCARE',
    GROOMING_TIPS = 'GROOMING_TIPS',
    MAKEUP_TUTORIAL = 'MAKEUP_TUTORIAL',
    PRODUCT_USAGE = 'PRODUCT_USAGE',
    WELLNESS = 'WELLNESS',
    NUTRITION = 'NUTRITION',
    LIFESTYLE = 'LIFESTYLE',
    GENERAL = 'GENERAL'
}

/**
 * Difficulty Level Enum
 */
export enum DifficultyLevel {
    BEGINNER = 'BEGINNER',
    INTERMEDIATE = 'INTERMEDIATE',
    ADVANCED = 'ADVANCED'
}

/**
 * Guide Service
 * Handles grooming guides and educational content
 */
class GuideService {
    /**
     * Get all published guides with filters
     */
    async getGuides(filters: {
        category?: GuideCategory;
        tags?: string[];
        difficulty?: DifficultyLevel;
        search?: string;
        page?: number;
        limit?: number;
    } = {}): Promise<{
        guides: any[];
        total: number;
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
        };
    }> {
        const { category, tags, difficulty, search, page = 1, limit = 20 } = filters;
        const skip = (page - 1) * limit;

        const where: any = { isPublished: true };

        if (category) {
            where.category = category;
        }

        if (difficulty) {
            where.difficulty = difficulty;
        }

        if (tags && tags.length > 0) {
            // tags is stored as JSON string, use contains to search
            const tagConditions = tags.map((tag: string) => ({ tags: { contains: tag, mode: 'insensitive' as const } }));
            where.AND = [...(where.AND || []), { OR: tagConditions }];
        }

        if (search) {
            where.AND = [
                ...(where.AND || []),
                {
                    OR: [
                        { title: { contains: search, mode: 'insensitive' } },
                        { description: { contains: search, mode: 'insensitive' } },
                        { content: { contains: search, mode: 'insensitive' } }
                    ]
                }
            ];
        }

        const [guides, total] = await Promise.all([
            prisma.guide.findMany({
                where,
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    description: true,
                    excerpt: true,
                    thumbnailUrl: true,
                    category: true,
                    tags: true,
                    difficulty: true,
                    readTime: true,
                    duration: true,
                    viewCount: true,
                    likeCount: true,
                    isPublished: true,
                    publishedAt: true,
                    createdAt: true,
                    updatedAt: true,
                    author: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true
                        }
                    }
                },
                orderBy: {
                    publishedAt: 'desc'
                },
                skip,
                take: limit
            }),
            prisma.guide.count({ where })
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            guides,
            total,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        };
    }

    /**
     * Get guide by ID or slug
     */
    async getGuide(
        identifier: string,
        userId?: string
    ): Promise<any> {
        const guide = await prisma.guide.findFirst({
            where: {
                OR: [
                    { id: identifier },
                    { slug: identifier }
                ],
                isPublished: true
            },
            include: {
                steps: {
                    orderBy: {
                        order: 'asc'
                    }
                },
                author: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                }
            }
        });

        if (!guide) {
            throw new NotFoundError("Guide not found");
        }

        // Increment view count
        await prisma.guide.update({
            where: { id: guide.id },
            data: {
                viewCount: { increment: 1 }
            }
        });

        // Check if user liked/bookmarked
        let isLiked = false;
        let isBookmarked = false;

        if (userId) {
            const [like, bookmark] = await Promise.all([
                prisma.guideLike.findUnique({
                    where: {
                        guideId_userId: {
                            guideId: guide.id,
                            userId
                        }
                    }
                }),
                prisma.guideBookmark.findUnique({
                    where: {
                        guideId_userId: {
                            guideId: guide.id,
                            userId
                        }
                    }
                })
            ]);

            isLiked = !!like;
            isBookmarked = !!bookmark;
        }

        return {
            ...guide,
            isLiked,
            isBookmarked
        };
    }

    /**
     * Get guides by category
     */
    async getGuidesByCategory(
        category: GuideCategory,
        limit: number = 20
    ): Promise<any[]> {
        const guides = await prisma.guide.findMany({
            where: {
                category,
                isPublished: true
            },
            select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                excerpt: true,
                thumbnailUrl: true,
                category: true,
                tags: true,
                difficulty: true,
                readTime: true,
                viewCount: true,
                likeCount: true,
                publishedAt: true
            },
            orderBy: {
                publishedAt: 'desc'
            },
            take: limit
        });

        return guides;
    }

    /**
     * Search guides
     */
    async searchGuides(
        query: string,
        limit: number = 20
    ): Promise<any[]> {
        const guides = await prisma.guide.findMany({
            where: {
                isPublished: true,
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                    { content: { contains: query, mode: 'insensitive' } },
                    { tags: { contains: query, mode: 'insensitive' } }
                ]
            },
            select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                excerpt: true,
                thumbnailUrl: true,
                category: true,
                tags: true,
                difficulty: true,
                readTime: true,
                viewCount: true,
                likeCount: true,
                publishedAt: true
            },
            orderBy: {
                viewCount: 'desc'
            },
            take: limit
        });

        return guides;
    }

    /**
     * Get trending guides
     */
    async getTrendingGuides(limit: number = 10): Promise<any[]> {
        // Get guides from last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const guides = await prisma.guide.findMany({
            where: {
                isPublished: true,
                publishedAt: {
                    gte: thirtyDaysAgo
                }
            },
            select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                excerpt: true,
                thumbnailUrl: true,
                category: true,
                tags: true,
                difficulty: true,
                readTime: true,
                viewCount: true,
                likeCount: true,
                publishedAt: true
            },
            orderBy: [
                { viewCount: 'desc' },
                { likeCount: 'desc' }
            ],
            take: limit
        });

        return guides;
    }

    /**
     * Get featured guides
     */
    async getFeaturedGuides(limit: number = 5): Promise<any[]> {
        // Get guides with highest engagement
        const guides = await prisma.guide.findMany({
            where: {
                isPublished: true
            },
            select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                excerpt: true,
                thumbnailUrl: true,
                category: true,
                tags: true,
                difficulty: true,
                readTime: true,
                viewCount: true,
                likeCount: true,
                publishedAt: true
            },
            orderBy: [
                { likeCount: 'desc' },
                { viewCount: 'desc' }
            ],
            take: limit
        });

        return guides;
    }

    /**
     * Like guide
     */
    async likeGuide(userId: string, guideId: string): Promise<void> {
        // Check if already liked
        const existingLike = await prisma.guideLike.findUnique({
            where: {
                guideId_userId: {
                    guideId,
                    userId
                }
            }
        });

        if (existingLike) {
            throw new ConflictError("Guide already liked");
        }

        // Create like and increment count
        await prisma.$transaction([
            prisma.guideLike.create({
                data: {
                    guideId,
                    userId
                }
            }),
            prisma.guide.update({
                where: { id: guideId },
                data: {
                    likeCount: { increment: 1 }
                }
            })
        ]);
    }

    /**
     * Unlike guide
     */
    async unlikeGuide(userId: string, guideId: string): Promise<void> {
        const like = await prisma.guideLike.findUnique({
            where: {
                guideId_userId: {
                    guideId,
                    userId
                }
            }
        });

        if (!like) {
            throw new NotFoundError("Like not found");
        }

        // Delete like and decrement count
        await prisma.$transaction([
            prisma.guideLike.delete({
                where: {
                    guideId_userId: {
                        guideId,
                        userId
                    }
                }
            }),
            prisma.guide.update({
                where: { id: guideId },
                data: {
                    likeCount: { decrement: 1 }
                }
            })
        ]);
    }

    /**
     * Bookmark guide
     */
    async bookmarkGuide(userId: string, guideId: string): Promise<void> {
        // Check if already bookmarked
        const existingBookmark = await prisma.guideBookmark.findUnique({
            where: {
                guideId_userId: {
                    guideId,
                    userId
                }
            }
        });

        if (existingBookmark) {
            throw new ConflictError("Guide already bookmarked");
        }

        await prisma.guideBookmark.create({
            data: {
                guideId,
                userId
            }
        });
    }

    /**
     * Remove bookmark
     */
    async removeBookmark(userId: string, guideId: string): Promise<void> {
        const bookmark = await prisma.guideBookmark.findUnique({
            where: {
                guideId_userId: {
                    guideId,
                    userId
                }
            }
        });

        if (!bookmark) {
            throw new NotFoundError("Bookmark not found");
        }

        await prisma.guideBookmark.delete({
            where: {
                guideId_userId: {
                    guideId,
                    userId
                }
            }
        });
    }

    /**
     * Get user's bookmarked guides
     */
    async getUserBookmarks(
        userId: string,
        page: number = 1,
        limit: number = 20
    ): Promise<{
        guides: any[];
        total: number;
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
        };
    }> {
        const skip = (page - 1) * limit;

        const [bookmarks, total] = await Promise.all([
            prisma.guideBookmark.findMany({
                where: { userId },
                include: {
                    guide: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            description: true,
                            excerpt: true,
                            thumbnailUrl: true,
                            category: true,
                            tags: true,
                            difficulty: true,
                            readTime: true,
                            viewCount: true,
                            likeCount: true,
                            publishedAt: true,
                            author: {
                                select: {
                                    id: true,
                                    name: true,
                                    avatar: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: limit
            }),
            prisma.guideBookmark.count({ where: { userId } })
        ]);

        const guides = bookmarks.map(b => b.guide);
        const totalPages = Math.ceil(total / limit);

        return {
            guides,
            total,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        };
    }

    /**
     * Get related guides
     */
    async getRelatedGuides(
        guideId: string,
        limit: number = 6
    ): Promise<any[]> {
        // Get current guide
        const currentGuide = await prisma.guide.findUnique({
            where: { id: guideId },
            select: {
                category: true,
                tags: true
            }
        });

        if (!currentGuide) {
            return [];
        }

        // Find guides with same category or overlapping tags
        const guides = await prisma.guide.findMany({
            where: {
                id: { not: guideId },
                isPublished: true,
                OR: [
                    // tags is a JSON string; find guides with same category
                    { category: currentGuide.category }
                ]
            },
            select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                excerpt: true,
                thumbnailUrl: true,
                category: true,
                tags: true,
                difficulty: true,
                readTime: true,
                viewCount: true,
                likeCount: true,
                publishedAt: true
            },
            orderBy: {
                viewCount: 'desc'
            },
            take: limit
        });

        return guides;
    }

    /**
     * Get guide statistics
     */
    async getGuideStatistics(guideId: string): Promise<{
        viewCount: number;
        likeCount: number;
        bookmarkCount: number;
    }> {
        const [guide, bookmarkCount] = await Promise.all([
            prisma.guide.findUnique({
                where: { id: guideId },
                select: {
                    viewCount: true,
                    likeCount: true
                }
            }),
            prisma.guideBookmark.count({
                where: { guideId }
            })
        ]);

        if (!guide) {
            throw new NotFoundError("Guide not found");
        }

        return {
            viewCount: guide.viewCount,
            likeCount: guide.likeCount,
            bookmarkCount
        };
    }
}

export default new GuideService();
