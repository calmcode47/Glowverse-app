import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redis } from '../config/redis';
import { config } from '../config';
import { Request, Response } from 'express';
import logger from '../utils/logger';

// Redis store for rate limiting (distributed across instances)
const store = new RedisStore({
    // @ts-expect-error - RedisStore types may not match ioredis perfectly
    client: redis,
    prefix: 'rl:',
});

// Custom handler for rate limit exceeded
const rateLimitHandler = (req: Request, res: Response) => {
    logger.warn('Rate limit exceeded', {
        ip: req.ip,
        url: req.url,
        method: req.method,
    });

    res.status(429).json({
        success: false,
        error: {
            message: 'Too many requests, please try again later',
            statusCode: 429,
            retryAfter: res.getHeader('Retry-After'),
        },
    });
};

// General API rate limiter
export const apiRateLimiter = rateLimit({
    store,
    windowMs: config.security.rateLimitWindowMs,
    max: config.security.rateLimitMax,
    message: 'Too many requests from this IP',
    handler: rateLimitHandler,
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false,
});

// Strict rate limiter for authentication endpoints
export const authRateLimiter = rateLimit({
    store,
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    skipSuccessfulRequests: true, // Don't count successful logins
    handler: rateLimitHandler,
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter for file uploads
export const uploadRateLimiter = rateLimit({
    store,
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 uploads per hour
    handler: rateLimitHandler,
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter for expensive operations (AR try-on, AI processing)
export const expensiveOperationRateLimiter = rateLimit({
    store,
    windowMs: 60 * 1000, // 1 minute
    max: 5, // 5 requests per minute
    handler: rateLimitHandler,
    standardHeaders: true,
    legacyHeaders: false,
});

// Custom rate limiter based on user tier
export function userTierRateLimiter(req: Request, res: Response, next: any) {
    const user = (req as any).user;

    if (!user) {
        return next();
    }

    // Premium users get higher limits
    const limit = user.role === 'PREMIUM' ? 10000 : 1000;

    const limiter = rateLimit({
        store,
        windowMs: 15 * 60 * 1000,
        max: limit,
        keyGenerator: (req) => `user:${(req as any).user?.id || 'anonymous'}`,
        handler: rateLimitHandler,
        standardHeaders: true,
        legacyHeaders: false,
    });

    return limiter(req, res, next);
}
