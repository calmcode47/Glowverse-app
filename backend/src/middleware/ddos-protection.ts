import { Request, Response, NextFunction } from 'express';
import { redis } from '../config/redis';
import logger from '../utils/logger';

interface SuspiciousPatternDetector {
    threshold: number;
    windowSeconds: number;
    blockDurationSeconds: number;
}

const SUSPICIOUS_PATTERNS: Record<string, SuspiciousPatternDetector> = {
    rapidRequests: {
        threshold: 100,        // 100 requests
        windowSeconds: 10,     // in 10 seconds
        blockDurationSeconds: 300, // block for 5 minutes
    },
    failedAuth: {
        threshold: 5,
        windowSeconds: 60,
        blockDurationSeconds: 900, // 15 minutes
    },
    invalidRequests: {
        threshold: 20,
        windowSeconds: 60,
        blockDurationSeconds: 600,
    },
};

export class DDoSProtection {
    /**
     * Detect and block suspicious IPs
     */
    static async detectSuspiciousActivity(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        const ip = req.ip || 'unknown';
        const blockedKey = `ddos:blocked:${ip}`;

        try {
            // Check if IP is blocked
            const isBlocked = await redis.get(blockedKey);
            if (isBlocked) {
                logger.warn('Blocked IP attempted access', { ip });

                res.status(403).json({
                    success: false,
                    error: {
                        message: 'Access denied due to suspicious activity',
                        statusCode: 403,
                    },
                });
                return;
            }

            // Track request pattern
            await DDoSProtection.trackRequestPattern(ip, 'rapidRequests');

            next();
        } catch (error) {
            logger.error('DDoS protection error', { error });
            next();
            return;
        }
    }

    /**
     * Track failed authentication attempts
     */
    static async trackFailedAuth(ip: string, userId?: string) {
        const key = userId ? `ddos:failed:user:${userId}` : `ddos:failed:ip:${ip}`;

        try {
            const count = await redis.incr(key);

            if (count === 1) {
                await redis.expire(key, SUSPICIOUS_PATTERNS.failedAuth.windowSeconds);
            }

            // Block if threshold exceeded
            if (count >= SUSPICIOUS_PATTERNS.failedAuth.threshold) {
                await DDoSProtection.blockIP(ip, SUSPICIOUS_PATTERNS.failedAuth.blockDurationSeconds);

                logger.error('IP blocked due to failed auth attempts', {
                    ip,
                    userId,
                    attempts: count,
                });
            }
        } catch (error) {
            logger.error('Failed auth tracking error', { error });
        }
    }

    /**
     * Track request pattern
     */
    private static async trackRequestPattern(
        ip: string,
        pattern: keyof typeof SUSPICIOUS_PATTERNS
    ) {
        const config = SUSPICIOUS_PATTERNS[pattern];
        const key = `ddos:pattern:${pattern}:${ip}`;

        try {
            const count = await redis.incr(key);

            if (count === 1) {
                await redis.expire(key, config.windowSeconds);
            }

            if (count >= config.threshold) {
                await DDoSProtection.blockIP(ip, config.blockDurationSeconds);

                logger.error('IP blocked due to suspicious pattern', {
                    ip,
                    pattern,
                    count,
                });
            }
        } catch (error) {
            logger.error('Pattern tracking error', { error });
        }
    }

    /**
     * Block an IP address
     */
    private static async blockIP(ip: string, durationSeconds: number) {
        const key = `ddos:blocked:${ip}`;
        await redis.setex(key, durationSeconds, '1');

        // Notify security monitoring
        logger.error('IP blocked', {
            ip,
            duration: durationSeconds,
            timestamp: new Date().toISOString(),
        });
    }

    /**
     * Check if request looks like a bot
     */
    static detectBot(req: Request, res: Response, next: NextFunction) {
        const userAgent = req.get('user-agent') || '';

        // Common bot patterns
        const botPatterns = [
            /bot/i,
            /crawler/i,
            /spider/i,
            /scraper/i,
        ];

        const isBot = botPatterns.some(pattern => pattern.test(userAgent));

        if (isBot && !DDoSProtection.isWhitelistedBot(userAgent)) {
            logger.warn('Suspicious bot detected', {
                ip: req.ip,
                userAgent,
                path: req.path,
            });

            // Apply stricter rate limiting for bots
            (req as any).isBot = true;
        }

        return next();
    }

    /**
     * Check if bot is whitelisted (Google, Bing, etc.)
     */
    private static isWhitelistedBot(userAgent: string): boolean {
        const whitelisted = [
            /googlebot/i,
            /bingbot/i,
            /slackbot/i,
        ];

        return whitelisted.some(pattern => pattern.test(userAgent));
    }
}
