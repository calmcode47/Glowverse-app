import { redis } from '../config/redis';
import logger from '../utils/logger';
import { config } from '../config';

export class CacheService {
    private static get DEFAULT_TTL() {
        return config.redis.ttl;
    }
    private static readonly NAMESPACE = 'glowverse';

    /**
     * Generate cache key with namespace
     */
    private static getKey(key: string): string {
        return `${this.NAMESPACE}:${key}`;
    }

    /**
     * Get value from cache
     */
    static async get<T>(key: string): Promise<T | null> {
        try {
            const fullKey = this.getKey(key);
            const value = await redis.get(fullKey);

            if (!value) {
                logger.debug('Cache miss', { key: fullKey });
                return null;
            }

            logger.debug('Cache hit', { key: fullKey });
            return JSON.parse(value) as T;
        } catch (error) {
            logger.error('Cache get error', { key, error });
            return null; // Fail gracefully
        }
    }

    /**
     * Set value in cache with TTL
     */
    static async set(key: string, value: any, ttl: number = this.DEFAULT_TTL): Promise<void> {
        try {
            const fullKey = this.getKey(key);
            const serialized = JSON.stringify(value);

            await redis.setex(fullKey, ttl, serialized);
            logger.debug('Cache set', { key: fullKey, ttl });
        } catch (error) {
            logger.error('Cache set error', { key, error });
        }
    }

    /**
     * Delete key from cache
     */
    static async delete(key: string): Promise<void> {
        try {
            const fullKey = this.getKey(key);
            await redis.del(fullKey);
            logger.debug('Cache deleted', { key: fullKey });
        } catch (error) {
            logger.error('Cache delete error', { key, error });
        }
    }

    /**
     * Delete multiple keys matching pattern
     */
    static async deletePattern(pattern: string): Promise<void> {
        try {
            const fullPattern = this.getKey(pattern);
            const keys = await redis.keys(fullPattern);

            if (keys.length > 0) {
                await redis.del(...keys);
                logger.debug('Cache pattern deleted', { pattern: fullPattern, count: keys.length });
            }
        } catch (error) {
            logger.error('Cache delete pattern error', { pattern, error });
        }
    }

    /**
     * Flush all cache
     */
    static async flush(): Promise<void> {
        try {
            await redis.flushdb();
            logger.info('Cache flushed');
        } catch (error) {
            logger.error('Cache flush error', { error });
        }
    }

    /**
     * Get or set pattern (cache-aside)
     */
    static async getOrSet<T>(
        key: string,
        fetcher: () => Promise<T>,
        ttl: number = this.DEFAULT_TTL
    ): Promise<T> {
        // Try to get from cache
        const cached = await this.get<T>(key);
        if (cached !== null) {
            return cached;
        }

        // Fetch from source
        const value = await fetcher();

        // Store in cache
        await this.set(key, value, ttl);

        return value;
    }

    /**
     * Increment counter
     */
    static async increment(key: string, by: number = 1): Promise<number> {
        try {
            const fullKey = this.getKey(key);
            return await redis.incrby(fullKey, by);
        } catch (error) {
            logger.error('Cache increment error', { key, error });
            return 0;
        }
    }

    /**
     * Check if key exists
     */
    static async exists(key: string): Promise<boolean> {
        try {
            const fullKey = this.getKey(key);
            const result = await redis.exists(fullKey);
            return result === 1;
        } catch (error) {
            logger.error('Cache exists error', { key, error });
            return false;
        }
    }

    /**
     * Get TTL of key
     */
    static async ttl(key: string): Promise<number> {
        try {
            const fullKey = this.getKey(key);
            return await redis.ttl(fullKey);
        } catch (error) {
            logger.error('Cache TTL error', { key, error });
            return -1;
        }
    }
}
