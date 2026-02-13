import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import { Express } from 'express';
import { config } from './index';
import prisma from './database';

export function initializeSentry(app: Express): void {
    if (!config.monitoring.sentryDsn) {
        console.warn('⚠️  Sentry DSN not configured - error tracking disabled');
        return;
    }

    Sentry.init({
        dsn: config.monitoring.sentryDsn,
        environment: config.server.env,

        // Performance Monitoring
        tracesSampleRate: config.server.isProduction ? 0.1 : 1.0,

        // Release tracking
        release: process.env.npm_package_version || 'unknown',

        // Integrations
        integrations: [
            new Sentry.Integrations.Http({ tracing: true }),
            new Tracing.Integrations.Express({ app }),
            new Tracing.Integrations.Prisma({ client: prisma }),
            new Sentry.Integrations.Console(),
        ],

        // Filter events before sending
        beforeSend(event, hint) {
            // Skip non-errors in development
            if (config.server.isDevelopment && event.level !== 'error') {
                return null;
            }

            // Add correlation ID
            if (event.request?.headers) {
                event.contexts = {
                    ...event.contexts,
                    correlationId: event.request.headers['x-correlation-id'],
                };
            }

            return event;
        },
    });

    console.log('✓ Sentry initialized successfully');
}
