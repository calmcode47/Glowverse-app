import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { Express } from 'express';
import { config } from './index';

export function initializeSentry(app: Express): void {
    if (!config.monitoring.sentryDsn) {
        console.warn('⚠️  Sentry DSN not configured - error tracking disabled');
        return;
    }

    Sentry.init({
        dsn: config.monitoring.sentryDsn,
        environment: config.server.env,

        // Performance Monitoring
        tracesSampleRate: config.server.isProduction ? 0.2 : 1.0,
        profilesSampleRate: config.server.isProduction ? 0.1 : 1.0,

        // Release tracking
        release: process.env.npm_package_version || 'unknown',

        integrations: [
            Sentry.httpIntegration(),
            Sentry.expressIntegration(),
            Sentry.prismaIntegration(),

            // Profiling integration
            nodeProfilingIntegration(),
        ],

        // Filter events before sending
        beforeSend(event: Sentry.ErrorEvent) {
            // Skip non-errors in development
            if (config.server.isDevelopment && event.level !== 'error') {
                return null;
            }

            // Add correlation ID
            if (event.request?.headers) {
                event.contexts = {
                    ...event.contexts,
                    correlationId: event.request.headers['x-correlation-id'] as any,
                };
            }

            // Customize transaction names
            if (event.transaction) {
                event.transaction = event.transaction.replace(/\/[0-9a-f]{24}/g, '/:id');
            }

            return event;
        },
    });

    console.log('✓ Sentry initialized successfully with Performance & Profiling');
}
