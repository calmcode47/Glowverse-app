import prisma from "@config/database";
import { NotFoundError, AppError } from "@utils/errors";
import NotificationService from "./notification.service";

/**
 * Referral Status Enum
 */
export enum ReferralStatus {
    PENDING = 'PENDING',
    REGISTERED = 'REGISTERED',
    COMPLETED = 'COMPLETED',
    EXPIRED = 'EXPIRED'
}

/**
 * Referral Service
 * Handles referral code generation, tracking, and rewards
 */
class ReferralService {
    // Reward amounts (can be configured)
    private readonly REFERRER_REWARD = 10.0;
    private readonly REFEREE_REWARD = 5.0;

    /**
     * Generate unique referral code
     * Format: USER-XXXX (8 characters)
     */
    private generateReferralCode(): string {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars
        let code = 'USER-';
        for (let i = 0; i < 4; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    /**
     * Create unique referral code with retry for uniqueness
     */
    private async createUniqueReferralCode(): Promise<string> {
        let attempts = 0;
        const maxAttempts = 10;

        while (attempts < maxAttempts) {
            const code = this.generateReferralCode();

            // Check if code already exists
            const existing = await prisma.referral.findUnique({
                where: { code }
            });

            if (!existing) {
                return code;
            }

            attempts++;
        }

        // Fallback: use timestamp-based code
        return `USER-${Date.now().toString(36).toUpperCase().slice(-4)}`;
    }

    /**
     * Get or create user's referral code
     */
    async getUserReferralCode(userId: string): Promise<string> {
        // Check if user already has a referral code
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { referralCode: true }
        });

        if (user?.referralCode) {
            return user.referralCode;
        }

        // Generate new code
        const code = await this.createUniqueReferralCode();

        // Create referral record
        await prisma.referral.create({
            data: {
                code,
                referrerId: userId,
                status: ReferralStatus.PENDING
            }
        });

        // Update user with referral code
        await prisma.user.update({
            where: { id: userId },
            data: { referralCode: code }
        });

        return code;
    }

    /**
     * Get referral statistics for user
     */
    async getReferralStats(userId: string): Promise<{
        code: string;
        totalReferrals: number;
        completedReferrals: number;
        pendingReferrals: number;
        registeredReferrals: number;
        totalEarnings: number;
        paidEarnings: number;
        pendingEarnings: number;
        recentReferrals: any[];
    }> {
        // Get user's referral code
        const code = await this.getUserReferralCode(userId);

        // Get all referrals
        const referrals = await prisma.referral.findMany({
            where: { referrerId: userId },
            include: {
                referee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        createdAt: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Calculate statistics
        const totalReferrals = referrals.length;
        const completedReferrals = referrals.filter(r => r.status === ReferralStatus.COMPLETED).length;
        const pendingReferrals = referrals.filter(r => r.status === ReferralStatus.PENDING).length;
        const registeredReferrals = referrals.filter(r => r.status === ReferralStatus.REGISTERED).length;

        // Calculate earnings
        const totalEarnings = referrals.reduce((sum, r) => sum + r.referrerReward, 0);
        const paidEarnings = referrals.filter(r => r.referrerPaid).reduce((sum, r) => sum + r.referrerReward, 0);
        const pendingEarnings = totalEarnings - paidEarnings;

        // Get recent referrals (last 10)
        const recentReferrals = referrals.slice(0, 10).map(r => ({
            id: r.id,
            code: r.code,
            status: r.status,
            refereeEmail: r.refereeEmail,
            refereeName: r.referee?.name,
            reward: r.referrerReward,
            paid: r.referrerPaid,
            createdAt: r.createdAt,
            completedAt: r.completedAt
        }));

        return {
            code,
            totalReferrals,
            completedReferrals,
            pendingReferrals,
            registeredReferrals,
            totalEarnings,
            paidEarnings,
            pendingEarnings,
            recentReferrals
        };
    }

    /**
     * Apply referral code during signup
     */
    async applyReferralCode(refereeEmail: string, code: string): Promise<any> {
        // Find referral by code
        const referral = await prisma.referral.findUnique({
            where: { code: code.toUpperCase() }
        });

        if (!referral) {
            throw new NotFoundError("Invalid referral code");
        }

        // Verify referral is PENDING (not already used)
        if (referral.status !== ReferralStatus.PENDING) {
            throw new AppError("This referral code has already been used", 400);
        }

        // Update referral with referee email
        const updated = await prisma.referral.update({
            where: { id: referral.id },
            data: {
                refereeEmail,
                status: ReferralStatus.PENDING // Keep pending until user registers
            }
        });

        return updated;
    }

    /**
     * Register referee after signup
     */
    async registerReferee(refereeId: string, email: string): Promise<void> {
        // Find pending referral by referee email
        const referral = await prisma.referral.findFirst({
            where: {
                refereeEmail: email,
                status: ReferralStatus.PENDING
            }
        });

        if (!referral) {
            return; // No referral code was used
        }

        // Update referral with refereeId and status
        await prisma.referral.update({
            where: { id: referral.id },
            data: {
                refereeId,
                status: ReferralStatus.REGISTERED
            }
        });

        // Send notification to referrer
        await NotificationService.createNotification({
            userId: referral.referrerId,
            type: 'SYSTEM' as any,
            title: 'Referral Registered',
            message: 'Someone signed up using your referral code! They will earn you rewards when they make their first purchase.',
            data: { referralId: referral.id }
        });
    }

    /**
     * Complete referral after first purchase
     */
    async completeReferral(userId: string, orderId: string): Promise<void> {
        // Find REGISTERED referral where referee is the user
        const referral = await prisma.referral.findFirst({
            where: {
                refereeId: userId,
                status: ReferralStatus.REGISTERED
            }
        });

        if (!referral) {
            return; // User was not referred or already completed
        }

        // Calculate rewards
        const referrerReward = this.REFERRER_REWARD;
        const refereeReward = this.REFEREE_REWARD;

        // Update referral status and rewards
        await prisma.referral.update({
            where: { id: referral.id },
            data: {
                status: ReferralStatus.COMPLETED,
                completedAt: new Date(),
                referrerReward,
                refereeReward
            }
        });

        // Update user earnings
        await prisma.user.update({
            where: { id: referral.referrerId },
            data: {
                referralEarnings: {
                    increment: referrerReward
                }
            }
        });

        await prisma.user.update({
            where: { id: userId },
            data: {
                referralEarnings: {
                    increment: refereeReward
                }
            }
        });

        // Send notifications
        await NotificationService.createNotification({
            userId: referral.referrerId,
            type: 'SYSTEM' as any,
            title: 'Referral Completed! 🎉',
            message: `Congratulations! You earned $${referrerReward.toFixed(2)} from a successful referral.`,
            data: { referralId: referral.id, amount: referrerReward }
        });

        await NotificationService.createNotification({
            userId,
            type: 'SYSTEM' as any,
            title: 'Referral Reward Earned! 🎉',
            message: `You earned $${refereeReward.toFixed(2)} for signing up with a referral code!`,
            data: { referralId: referral.id, amount: refereeReward }
        });
    }

    /**
     * Get user's referral list
     */
    async getUserReferrals(
        userId: string,
        filters: {
            status?: ReferralStatus;
            page?: number;
            limit?: number;
        } = {}
    ): Promise<{
        referrals: any[];
        total: number;
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
        };
    }> {
        const { status, page = 1, limit = 20 } = filters;
        const skip = (page - 1) * limit;

        const where: any = { referrerId: userId };
        if (status) {
            where.status = status;
        }

        const [referrals, total] = await Promise.all([
            prisma.referral.findMany({
                where,
                include: {
                    referee: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            createdAt: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: limit
            }),
            prisma.referral.count({ where })
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            referrals,
            total,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        };
    }
}

export default new ReferralService();
