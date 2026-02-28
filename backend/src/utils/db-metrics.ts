import { prisma } from '../config/database';
import { register, Histogram, Counter } from 'prom-client';

// Database metrics
export const dbQueryDuration = new Histogram({
    name: 'db_query_duration_ms',
    help: 'Database query duration in milliseconds',
    labelNames: ['operation', 'model'],
    buckets: [1, 5, 10, 25, 50, 100, 250, 500, 1000, 5000],
    registers: [register],
});

export const dbQueryTotal = new Counter({
    name: 'db_query_total',
    help: 'Total database queries',
    labelNames: ['operation', 'model'],
    registers: [register],
});

/**
 * Initialize database metrics monitoring
 * Uses Prisma middleware to track query performance
 */
export const initDbMetrics = () => {
    // Prisma $use is deprecated and removed in v6.
    // Tracking query duration requires using Prisma Client Extensions ($extends) 
    // which should be configured directly during PrismaClient instantiation.
    const logger = require('./logger').default;
    logger.warn('DbMetrics initialization skipped. Prisma $use is unsupported in Prisma v6.');
};
