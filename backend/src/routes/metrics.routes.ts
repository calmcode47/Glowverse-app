import { Router } from 'express';
import { prisma } from '../config/database';
import os from 'os';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Secure metrics endpoint
router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/performance', async (req, res) => {
    const timestamp = new Date().toISOString();

    // Event Loop Lag (simple estimation)
    const getEventLoopLag = (): Promise<number> => {
        return new Promise((resolve) => {
            const start = Date.now();
            setImmediate(() => {
                resolve(Date.now() - start);
            });
        });
    };

    const [dbConnectionCount, eventLoopLag] = await Promise.all([
        prisma.$queryRaw`SELECT count(*)::int FROM pg_stat_activity`,
        getEventLoopLag()
    ]);

    const performanceMetrics = {
        timestamp,

        // System metrics
        system: {
            platform: os.platform(),
            cpuUsage: process.cpuUsage(),
            memoryUsage: process.memoryUsage(),
            uptime: process.uptime(),
            loadAvg: os.loadavg(),
            nodeVersion: process.version,
        },

        // Application metrics
        eventLoop: {
            lag: eventLoopLag,
        },

        // Database metrics
        database: {
            activeConnections: (dbConnectionCount as any)[0].count,
        },
    };

    res.json({
        success: true,
        data: performanceMetrics,
    });
});

export default router;
