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
    // @ts-ignore - Prisma middleware types can be tricky
    prisma.$use(async (params, next) => {
        const start = Date.now();

        try {
            const result = await next(params);
            const duration = Date.now() - start;

            dbQueryDuration.observe(
                { operation: params.action, model: params.model || 'unknown' },
                duration
            );

            dbQueryTotal.inc({
                operation: params.action,
                model: params.model || 'unknown',
            });

            return result;
        } catch (error) {
            // Still record the query attempt and fail duration
            const duration = Date.now() - start;
            dbQueryDuration.observe(
                { operation: params.action, model: params.model || 'unknown' },
                duration
            );
            dbQueryTotal.inc({
                operation: params.action,
                model: params.model || 'unknown',
            });
            throw error;
        }
    });
};
