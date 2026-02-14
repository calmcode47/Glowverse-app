import { redis } from '../config/redis';
import logger from '../utils/logger';

export enum ReputationScore {
    TRUSTED = 100,
    GOOD = 75,
    NEUTRAL = 50,
    SUSPICIOUS = 25,
    MALICIOUS = 0,
}

export class IPReputationService {
    private static readonly REPUTATION_KEY_PREFIX = 'ip:reputation:';
    private static readonly HISTORY_KEY_PREFIX = 'ip:history:';

    /**
     * Get IP reputation score
     */
    static async getReputation(ip: string): Promise<ReputationScore> {
        const key = `${this.REPUTATION_KEY_PREFIX}${ip}`;
        const score = await redis.get(key);

        return score ? parseInt(score) : ReputationScore.NEUTRAL;
    }

    /**
     * Update IP reputation based on behavior
     */
    static async updateReputation(
        ip: string,
        event: 'good' | 'bad',
        severity: number = 1
    ) {
        const key = `${this.REPUTATION_KEY_PREFIX}${ip}`;
        const currentScore = await this.getReputation(ip);

        let newScore = currentScore;

        if (event === 'good') {
            newScore = Math.min(ReputationScore.TRUSTED, currentScore + severity * 5);
        } else {
            newScore = Math.max(ReputationScore.MALICIOUS, currentScore - severity * 10);
        }

        await redis.setex(key, 86400 * 7, newScore.toString()); // 7 days

        // Log significant changes
        if (Math.abs(newScore - currentScore) >= 20) {
            logger.info('IP reputation changed significantly', {
                ip,
                oldScore: currentScore,
                newScore,
                event,
            });
        }

        // Track history
        await this.addToHistory(ip, event, newScore);

        return newScore;
    }

    /**
     * Add event to IP history
     */
    private static async addToHistory(
        ip: string,
        event: string,
        score: number
    ) {
        const key = `${this.HISTORY_KEY_PREFIX}${ip}`;
        const entry = JSON.stringify({
            event,
            score,
            timestamp: new Date().toISOString(),
        });

        await redis.lpush(key, entry);
        await redis.ltrim(key, 0, 99); // Keep last 100 events
        await redis.expire(key, 86400 * 30); // 30 days
    }

    /**
     * Get IP history
     */
    static async getHistory(ip: string, limit: number = 10) {
        const key = `${this.HISTORY_KEY_PREFIX}${ip}`;
        const entries = await redis.lrange(key, 0, limit - 1);

        return entries.map(entry => JSON.parse(entry));
    }

    /**
     * Check if IP should be allowed based on reputation
     */
    static async shouldAllow(ip: string): Promise<boolean> {
        const score = await this.getReputation(ip);
        return score > ReputationScore.SUSPICIOUS;
    }
}
