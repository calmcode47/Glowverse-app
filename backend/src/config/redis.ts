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

// Lazy singleton to avoid eager config access
let redisClient: Redis | null = null;

const getRedisClient = () => {
    if (!redisClient) {
        // Only access config when client is actually requested
        const { config } = require('./index');
        redisClient = new Redis(config.redis.url, redisOptions);

        // Attach event handlers to the new instance
        redisClient.on('connect', () => {
            const logger = require('../utils/logger').default;
            logger.info('✓ Redis connected successfully');
        });

        redisClient.on('error', (err) => {
            const logger = require('../utils/logger').default;
            logger.error('Redis connection error', { error: err.message });
        });

        redisClient.on('close', () => {
            const logger = require('../utils/logger').default;
            logger.warn('Redis connection closed');
        });

        redisClient.on('reconnecting', () => {
            const logger = require('../utils/logger').default;
            logger.info('Redis reconnecting...');
        });
    }
    return redisClient;
};

// Export a Proxy that forwards all operations to the lazy client
export const redis = new Proxy({} as Redis, {
    get(_target, prop) {
        const client = getRedisClient();
        // Bind methods to the client instance
        const value = client[prop as keyof Redis];
        return typeof value === 'function' ? value.bind(client) : value;
    }
});


// Graceful shutdown
process.on('SIGTERM', async () => {
    const logger = require('../utils/logger').default;
    logger.info('Closing Redis connection...');
    if (redisClient) {
        await redisClient.quit();
    }
});

// Connect on app start
export async function connectRedis(): Promise<void> {
    try {
        const client = getRedisClient();
        await client.connect();
        const logger = require('../utils/logger').default;
        logger.info('Redis connection established');
    } catch (error) {
        const logger = require('../utils/logger').default;
        logger.error('Failed to connect to Redis', { error });
        throw error;
    }
}
