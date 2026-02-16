import { z } from 'zod';

export const envSchema = z.object({
    // Server Configuration
    NODE_ENV: z.enum(['development', 'test', 'staging', 'production']),
    PORT: z.coerce.number().default(5000),
    HOST: z.string().default('0.0.0.0'),

    // Database
    DATABASE_URL: z.string().startsWith('postgresql://'),
    DATABASE_POOL_SIZE: z.coerce.number().default(10),

    // Redis Cache
    REDIS_URL: z.string().startsWith('redis://'),
    REDIS_TTL: z.coerce.number().default(3600),

    // JWT Authentication
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

    // Cloudinary Storage
    CLOUDINARY_CLOUD_NAME: z.string().min(1),
    CLOUDINARY_API_KEY: z.string().min(1),
    CLOUDINARY_API_SECRET: z.string().min(1),

    // Perfect Corp AR
    PERFECTCORP_API_KEY: z.string().min(1),
    PERFECTCORP_API_URL: z.string().url().default('https://api.perfectcorp.com'),

    // Stripe Payment
    STRIPE_SECRET_KEY: z.string().min(1),
    STRIPE_PUBLISHABLE_KEY: z.string().min(1),
    STRIPE_WEBHOOK_SECRET: z.string().min(1),
    STRIPE_WEBHOOK_TOLERANCE: z.coerce.number().default(300),

    // SendGrid
    SENDGRID_API_KEY: z.string().min(1),
    SENDGRID_FROM_EMAIL: z.string().email(),
    SENDGRID_FROM_NAME: z.string().default('Glowverse'),
    SENDGRID_ENABLED: z.string().transform((val: string) => val === 'true').default('true'),
    SENDGRID_TEMPLATE_ORDER_CONFIRMATION: z.string().optional(),
    SENDGRID_TEMPLATE_ORDER_SHIPPED: z.string().optional(),
    SENDGRID_TEMPLATE_PASSWORD_RESET: z.string().optional(),
    SENDGRID_TEMPLATE_WELCOME: z.string().optional(),
    SENDGRID_TEMPLATE_PROMOTION: z.string().optional(),

    // Push Notifications
    EXPO_ACCESS_TOKEN: z.string().optional(),
    PUSH_NOTIFICATIONS_ENABLED: z.string().transform((val: string) => val === 'true').default('false'),

    // Email Service (Future)
    EMAIL_SERVICE: z.enum(['sendgrid', 'ses', 'smtp']).optional(),
    EMAIL_FROM: z.string().email().optional(),

    // Monitoring & Observability
    SENTRY_DSN: z.string().url().optional(),
    OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().optional(),

    // Security
    RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000), // 15 minutes
    RATE_LIMIT_MAX: z.coerce.number().default(100),
    CORS_ORIGIN: z.string().default('*'),

    // Session & Cookies
    SESSION_SECRET: z.string().min(32).optional(),
    COOKIE_DOMAIN: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;
