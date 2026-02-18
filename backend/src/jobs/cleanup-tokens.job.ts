import AuthService from "../services/auth.service";
import logger from "../utils/logger";

const CLEANUP_INTERVAL_MS = 3600000; // 1 hour

/**
 * Cleanup expired password reset tokens.
 * Runs once on startup and then every hour.
 */
export async function cleanupExpiredTokensJob(): Promise<void> {
    try {
        const count = await AuthService.cleanupExpiredTokens();
        if (count > 0) {
            logger.info("Token cleanup job completed", { tokensRemoved: count });
        }
    } catch (error) {
        logger.error("Token cleanup job failed", { error });
    }
}

/**
 * Start the periodic cleanup scheduler.
 */
export function startTokenCleanupScheduler(): void {
    // Run once immediately
    cleanupExpiredTokensJob();

    // Then schedule hourly
    setInterval(cleanupExpiredTokensJob, CLEANUP_INTERVAL_MS);
    logger.info("Token cleanup scheduler started (every 1 hour)");
}
