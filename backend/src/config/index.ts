import { getConfig } from './env.validator';

export const config = {
    get server() {
        const cfg = getConfig();
        return {
            port: cfg.PORT,
            host: cfg.HOST,
            env: cfg.NODE_ENV,
            isDevelopment: cfg.NODE_ENV === 'development',
            isProduction: cfg.NODE_ENV === 'production',
            isTest: cfg.NODE_ENV === 'test',
            isStaging: cfg.NODE_ENV === 'staging',
        };
    },

    get database() {
        const cfg = getConfig();
        return {
            url: cfg.DATABASE_URL,
            poolSize: cfg.DATABASE_POOL_SIZE,
        };
    },

    get redis() {
        const cfg = getConfig();
        return {
            url: cfg.REDIS_URL,
            ttl: cfg.REDIS_TTL,
        };
    },

    get jwt() {
        const cfg = getConfig();
        return {
            secret: cfg.JWT_SECRET,
            expiresIn: cfg.JWT_EXPIRES_IN,
            refreshSecret: cfg.JWT_REFRESH_SECRET,
            refreshExpiresIn: cfg.JWT_REFRESH_EXPIRES_IN,
        };
    },

    get cloudinary() {
        const cfg = getConfig();
        return {
            cloudName: cfg.CLOUDINARY_CLOUD_NAME,
            apiKey: cfg.CLOUDINARY_API_KEY,
            apiSecret: cfg.CLOUDINARY_API_SECRET,
        };
    },

    get perfectCorp() {
        const cfg = getConfig();
        return {
            apiKey: cfg.PERFECTCORP_API_KEY,
            apiUrl: cfg.PERFECTCORP_API_URL,
        };
    },

    get email() {
        const cfg = getConfig();
        return {
            service: cfg.EMAIL_SERVICE,
            from: cfg.EMAIL_FROM,
            sendgridApiKey: cfg.SENDGRID_API_KEY,
        };
    },

    get monitoring() {
        const cfg = getConfig();
        return {
            sentryDsn: cfg.SENTRY_DSN,
            otelEndpoint: cfg.OTEL_EXPORTER_OTLP_ENDPOINT,
        };
    },

    get security() {
        const cfg = getConfig();
        return {
            rateLimitWindowMs: cfg.RATE_LIMIT_WINDOW_MS,
            rateLimitMax: cfg.RATE_LIMIT_MAX,
            corsOrigin: cfg.CORS_ORIGIN,
            sessionSecret: cfg.SESSION_SECRET,
            cookieDomain: cfg.COOKIE_DOMAIN,
        };
    },
};
