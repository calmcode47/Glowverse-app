import { Request, Response, NextFunction } from 'express';
import { redis } from '../config/redis';
import logger from '../utils/logger';

interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
    costPerRequest?: number;
}

interface UserTier {
    name: string;
    limits: {
        standard: number;
        burst: number;
        expensive: number;
    };
}

const USER_TIERS: Record<string, UserTier> = {
    free: {
        name: 'Free',
        limits: {
            standard: 100,    // per 15 minutes
            burst: 20,        // per minute
            expensive: 10,    // per hour
        },
    },
    premium: {
        name: 'Premium',
        limits: {
            standard: 1000,
            burst: 100,
            expensive: 100,
        },
    },
    enterprise: {
        name: 'Enterprise',
        limits: {
            standard: 10000,
            burst: 1000,
            expensive: 1000,
        },
    },
};

export class AdaptiveRateLimiter {
    /**
     * Create tier-based rate limiter
     */
    static createTieredLimiter(endpoint: string, costMultiplier: number = 1) {
        return async (req: Request, res: Response, next: NextFunction) => {
            const user = (req as any).user;
            const ip = req.ip || 'unknown';

            // Determine tier
            const tier = user?.tier || 'free';
            const tierLimits = USER_TIERS[tier] || USER_TIERS.free;

            // Generate keys
            const userKey = user ? `rl:user:${user.id}:${endpoint}` : null;
            const ipKey = `rl:ip:${ip}:${endpoint}`;

            // Calculate cost
            const cost = Math.ceil(costMultiplier);

            try {
                // Check user limit (if authenticated)
                if (userKey) {
                    const userCount = await redis.get(userKey);
                    const userLimit = tierLimits.limits.standard;

                    if (userCount && parseInt(userCount) + cost > userLimit) {
                        res.status(429).json({
                            success: false,
                            error: {
                                message: 'Rate limit exceeded for your tier',
                                statusCode: 429,
                                retryAfter: await this.getRetryAfter(userKey),
                                tier: tierLimits.name,
                                limit: userLimit,
                                upgrade: tier === 'free' ? '/pricing' : undefined,
                            },
                        });
                        return;
                    }

                    // Increment user counter
                    const pipeline = (redis as any).pipeline();
                    pipeline.incrby(userKey, cost);
                    pipeline.expire(userKey, 900);
                    await pipeline.exec();
                }

                // Check IP limit (always)
                const ipCount = await redis.get(ipKey);
                const ipLimit = 200; // Global IP limit

                if (ipCount && parseInt(ipCount) + cost > ipLimit) {
                    logger.warn('IP rate limit exceeded', { ip, endpoint });

                    res.status(429).json({
                        success: false,
                        error: {
                            message: 'Too many requests from this IP',
                            statusCode: 429,
                            retryAfter: await this.getRetryAfter(ipKey),
                        },
                    });
                    return;
                }

                // Increment IP counter
                const pipeline = (redis as any).pipeline();
                pipeline.incrby(ipKey, cost);
                pipeline.expire(ipKey, 900);
                await pipeline.exec();

                // Add rate limit headers
                res.setHeader('X-RateLimit-Tier', tierLimits.name);
                res.setHeader('X-RateLimit-Limit', tierLimits.limits.standard);
                const remaining = tierLimits.limits.standard - parseInt((await redis.get(userKey || ipKey)) || '0');
                res.setHeader('X-RateLimit-Remaining', Math.max(0, remaining));

                next();
            } catch (error) {
                logger.error('Rate limiter error', { error });
                // Fail open - don't block requests on rate limiter errors
                next();
                return;
            }
        };
    }

    /**
     * Burst rate limiter for rapid requests
     */
    static createBurstLimiter(maxPerMinute: number = 20) {
        return async (req: Request, res: Response, next: NextFunction) => {
            const user = (req as any).user;
            const ip = req.ip || 'unknown';
            const key = user ? `rl:burst:user:${user.id}` : `rl:burst:ip:${ip}`;

            try {
                const count = await redis.incr(key);

                if (count === 1) {
                    await redis.expire(key, 60); // 1 minute window
                }

                if (count > maxPerMinute) {
                    logger.warn('Burst rate limit exceeded', { user: user?.id, ip });

                    res.status(429).json({
                        success: false,
                        error: {
                            message: 'Too many requests. Please slow down.',
                            statusCode: 429,
                            retryAfter: await redis.ttl(key),
                        },
                    });
                    return;
                }

                next();
            } catch (error) {
                logger.error('Burst limiter error', { error });
                next();
                return;
            }
        };
    }

    /**
     * Calculate retry-after time
     */
    private static async getRetryAfter(key: string): Promise<number> {
        const ttl = await redis.ttl(key);
        return ttl > 0 ? ttl : 60;
    }
}
