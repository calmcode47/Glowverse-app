import { PrismaClient } from '@prisma/client';
import { config } from './index';
import logger from '../utils/logger';

/**
 * Calculate optimal connection pool size based on environment
 * Formula: Conservative approach for cloud environments
 * 
 * Production: Larger pool for high concurrency
 * Staging: Moderate pool for testing
 * Development: Small pool to avoid resource exhaustion
 */
const calculatePoolSize = (): number => {
  if (config.server.isProduction) {
    return 20;
  } else if (config.server.env === 'staging') {
    return 10;
  } else {
    return 5;
  }
};

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prismaClientOptions = {
  datasources: {
    db: {
      url: config.database.url,
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

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient(prismaClientOptions);

// Log slow queries
// @ts-ignore - types for $on are tricky with event-based logging
prisma.$on('query', (e: any) => {
  const duration = e.duration;

  if (duration > 100) {
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
  logger.error('Database error', {
    message: e.message,
    target: e.target,
  });
});

if (config.server.env !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  logger.info('Database connection closed');
});

logger.info('Database connection initialized', {
  environment: config.server.env,
  recommendedPoolSize: calculatePoolSize(),
});

export default prisma;
