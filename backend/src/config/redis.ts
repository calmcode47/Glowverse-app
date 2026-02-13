import Redis, { RedisOptions } from 'ioredis';
import { config } from './index';
import logger from '../utils/logger';

const redisOptions: RedisOptions = {
    // Connection retry strategy
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        logger.warn(`Redis connection retry attempt ${times}`, { delay });
        return delay;
    },

    // Connection timeout
    connectTimeout: 10000,

    // Automatic pipelining for better performance
    enableAutoPipelining: true,

    // Lazy connect (connect on first command)
    lazyConnect: true,
};

// Create Redis client
export const redis = new Redis(config.redis.url, redisOptions);

// Connection event handlers
redis.on('connect', () => {
    logger.info('✓ Redis connected successfully');
});

redis.on('error', (err) => {
    logger.error('Redis connection error', { error: err.message });
});

redis.on('close', () => {
    logger.warn('Redis connection closed');
});

redis.on('reconnecting', () => {
    logger.info('Redis reconnecting...');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('Closing Redis connection...');
    await redis.quit();
});

// Connect on app start
export async function connectRedis(): Promise<void> {
    try {
        await redis.connect();
        logger.info('Redis connection established');
    } catch (error) {
        logger.error('Failed to connect to Redis', { error });
        throw error;
    }
}
