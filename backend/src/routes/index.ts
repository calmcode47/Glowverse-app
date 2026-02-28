import express, { Application } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import productRoutes from "./product.routes";
import cartRoutes from "./cart.routes";
import orderRoutes from "./order.routes";
import analysisRoutes from "./analysis.routes";
import tryonRoutes from "./tryon.routes";
import favoriteRoutes from "./favorite.routes";
import notificationRoutes from "./notification.routes";
import promotionRoutes from "./promotion.routes";
import referralRoutes from "./referral.routes";
import fitnessRoutes from "./fitness.routes";
import guideRoutes from "./guide.routes";
import perfectcorpRoutes from "./perfectcorp.routes";
import uploadRoutes from "./upload.routes";
import rateLimitRoutes from "./admin/rate-limits.routes";
import metricsRoutes from "./metrics.routes";
import webhookRoutes from "./webhook.routes";
import paymentRoutes from "./payment.routes";

export {
    authRoutes,
    userRoutes,
    productRoutes,
    cartRoutes,
    orderRoutes,
    analysisRoutes,
    tryonRoutes,
    favoriteRoutes,
    notificationRoutes,
    promotionRoutes,
    referralRoutes,
    fitnessRoutes,
    guideRoutes,
    perfectcorpRoutes,
    uploadRoutes,
    rateLimitRoutes,
    metricsRoutes,
    webhookRoutes,
    paymentRoutes
};

/**
 * Register all application routes
 * @param app Express application
 * @param apiPrefix API version prefix (e.g., '/api/v1')
 */
export const registerRoutes = (app: Application, apiPrefix: string): void => {
    // ============================================
    // AUTHENTICATION & USER MANAGEMENT
    // ============================================
    app.use(`${apiPrefix}/auth`, authRoutes);
    app.use(`${apiPrefix}/users`, userRoutes);

    // ============================================
    // E-COMMERCE & PAYMENTS
    // ============================================
    app.use(`${apiPrefix}/products`, productRoutes);
    app.use(`${apiPrefix}/cart`, cartRoutes);
    app.use(`${apiPrefix}/orders`, orderRoutes);
    app.use(`${apiPrefix}/payments`, paymentRoutes);

    // ============================================
    // CORE FEATURES
    // ============================================
    app.use(`${apiPrefix}/analysis`, analysisRoutes);
    app.use(`${apiPrefix}/tryon`, tryonRoutes);
    app.use(`${apiPrefix}/favorites`, favoriteRoutes);

    // Wishlist alias for favorites (for backward compatibility)
    app.use(`${apiPrefix}/wishlist`, favoriteRoutes);

    // ============================================
    // ENGAGEMENT & NOTIFICATIONS
    // ============================================
    app.use(`${apiPrefix}/notifications`, notificationRoutes);
    app.use(`${apiPrefix}/promotions`, promotionRoutes);
    app.use(`${apiPrefix}/referrals`, referralRoutes);

    // ============================================
    // CONTENT & FITNESS
    // ============================================
    app.use(`${apiPrefix}/fitness`, fitnessRoutes);
    app.use(`${apiPrefix}/guides`, guideRoutes);

    // ============================================
    // INTEGRATIONS & UTILITIES
    // ============================================
    app.use(`${apiPrefix}/perfectcorp`, perfectcorpRoutes);
    app.use(`${apiPrefix}/upload`, uploadRoutes);

    // ============================================
    // ADMIN & SYSTEM
    // ============================================
    app.use(`${apiPrefix}/admin/rate-limits`, rateLimitRoutes);
    app.use(`${apiPrefix}/metrics`, metricsRoutes);

    // ============================================
    // WEBHOOKS (Requires raw body for Stripe)
    // ============================================
    app.use(`${apiPrefix}/webhooks`, express.raw({ type: 'application/json' }), webhookRoutes);

    // Deprecated path alias for upload (for backward compatibility)
    app.use("/images/upload", uploadRoutes);
};

/**
 * Get all registered route paths
 * Useful for documentation and testing
 */
export const getRegisteredRoutes = (apiPrefix: string) => {
    return {
        auth: `${apiPrefix}/auth`,
        users: `${apiPrefix}/users`,
        products: `${apiPrefix}/products`,
        cart: `${apiPrefix}/cart`,
        orders: `${apiPrefix}/orders`,
        payments: `${apiPrefix}/payments`,
        analysis: `${apiPrefix}/analysis`,
        tryon: `${apiPrefix}/tryon`,
        favorites: `${apiPrefix}/favorites`,
        wishlist: `${apiPrefix}/wishlist`, // Alias
        notifications: `${apiPrefix}/notifications`,
        promotions: `${apiPrefix}/promotions`,
        referrals: `${apiPrefix}/referrals`,
        fitness: `${apiPrefix}/fitness`,
        guides: `${apiPrefix}/guides`,
        perfectcorp: `${apiPrefix}/perfectcorp`,
        upload: `${apiPrefix}/upload`,
        imagesUpload: "/images/upload" // Deprecated alias
    };
};
