import { PrismaClient } from '@prisma/client';

/**
 * Calculate optimal connection pool size based on environment
 * Formula: Conservative approach for cloud environments
 * 
 * Production: Larger pool for high concurrency
 * Staging: Moderate pool for testing
 * Development: Small pool to avoid resource exhaustion
 */
const calculatePoolSize = (): number => {
  // Lazy load config to ensure environment is validated first
  const { config } = require('./index');
  if (config.server.isProduction) {
    return 20;
  } else if (config.server.env === 'staging') {
    return 10;
  } else {
    return 5;
  }
};

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Lazy load config to ensure environment is validated first
const getPrismaClientOptions = () => {
  return {
    datasources: {
      db: {
        // Use process.env directly — dotenv is loaded before any imports resolve
        url: process.env.DATABASE_URL,
      },
    },
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'info' },
      { emit: 'event', level: 'warn' },
    ] as { emit: 'event' | 'stdout'; level: 'query' | 'info' | 'warn' | 'error' }[],
    errorFormat: 'pretty' as const,
  };
};

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient(getPrismaClientOptions());

// Log slow queries
// @ts-ignore - types for $on are tricky with event-based logging
prisma.$on('query', (e: any) => {
  const duration = e.duration;

  if (duration > 100) {
    // Lazy load logger to avoid circular dependency
    const logger = require('../utils/logger').default;
    logger.warn('Slow query detected', {
      query: e.query,
      duration: `${duration}ms`,
      params: e.params,
      target: e.target,
    });
  }
});

// Log errors
// @ts-ignore
prisma.$on('error', (e: any) => {
  // Lazy load logger to avoid circular dependency
  const logger = require('../utils/logger').default;
  logger.error('Database error', {
    message: e.message,
    target: e.target,
  });
});

// Lazy load config for environment check
const getConfig = () => require('./index').config;

// Defer environment check until after all imports have settled (ESM hoisting fix)
setImmediate(() => {
  if (getConfig().server.env !== 'production') {
    globalForPrisma.prisma = prisma;
  }
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  // Lazy load logger to avoid circular dependency
  const logger = require('../utils/logger').default;
  logger.info('Database connection closed');
});

// Defer logger initialization until after ESM imports and validateEnv() have run
setImmediate(() => {
  const logger = require('../utils/logger').default;
  const config = getConfig();
  logger.info('Database connection initialized', {
    environment: config.server.env,
    recommendedPoolSize: calculatePoolSize(),
  });
});

export default prisma;
