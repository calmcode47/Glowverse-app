import { Router } from 'express';
import { redis } from '../../config/redis';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();

// Admin only
router.use(authenticate);
router.use(authorize('ADMIN'));

// Get blocked IPs
router.get('/blocked-ips', async (req, res) => {
    const keys = await redis.keys('ddos:blocked:*');
    const blocked = [];

    for (const key of keys) {
        const ip = key.replace('ddos:blocked:', '');
        const ttl = await redis.ttl(key);

        blocked.push({
            ip,
            expiresIn: ttl,
        });
    }

    res.json({
        success: true,
        data: {
            blocked,
            total: blocked.length,
        },
    });
});

// Unblock an IP
router.delete('/blocked-ips/:ip', async (req, res) => {
    const { ip } = req.params;
    await redis.del(`ddos:blocked:${ip}`);

    res.json({
        success: true,
        message: `IP ${ip} unblocked`,
    });
});

// Get rate limit stats
router.get('/stats', async (req, res) => {
    const keys = await redis.keys('rl:*');

    const stats = {
        totalKeys: keys.length,
        userLimits: keys.filter(k => k.includes('rl:user:')).length,
        ipLimits: keys.filter(k => k.includes('rl:ip:')).length,
        burstLimits: keys.filter(k => k.includes('rl:burst:')).length,
    };

    res.json({
        success: true,
        data: stats,
    });
});

export default router;
