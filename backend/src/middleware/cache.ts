import { Request, Response, NextFunction } from 'express';
import { CacheService } from '../services/cache.service';
import { createHash } from 'crypto';

interface CacheOptions {
    ttl?: number;
    keyPrefix?: string;
    skip?: (req: Request) => boolean;
}

/**
 * HTTP response caching middleware
 * Caches GET requests based on URL and query parameters
 */
export function cacheMiddleware(options: CacheOptions = {}) {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Skip caching for non-GET requests
        if (req.method !== 'GET') {
            return next();
        }

        // Skip if custom condition met
        if (options.skip && options.skip(req)) {
            return next();
        }

        // Generate cache key from URL and query params
        const keyData = `${req.originalUrl}:${JSON.stringify(req.query)}`;
        const cacheKey = `http:${options.keyPrefix || ''}:${createHash('md5').update(keyData).digest('hex')}`;

        // Try to get from cache
        const cached = await CacheService.get(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        // Intercept res.json to cache response
        const originalJson = res.json.bind(res);
        res.json = function (body: any) {
            // Cache successful responses only
            if (res.statusCode >= 200 && res.statusCode < 300) {
                CacheService.set(cacheKey, body, options.ttl);
            }
            return originalJson(body);
        };

        next();
    };
}
