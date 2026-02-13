import * as Sentry from '@sentry/node';
import { Request, Response, NextFunction } from 'express';

// Request handler (must be first middleware)
export const sentryRequestHandler = Sentry.Handlers.requestHandler();

// Tracing handler
export const sentryTracingHandler = Sentry.Handlers.tracingHandler();

// Error handler (must be after all routes)
export const sentryErrorHandler = Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
        return true; // Capture all errors
    },
});

// Custom context middleware
export function sentryContextMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    // Set user context if authenticated
    if ((req as any).user) {
        Sentry.setUser({
            id: (req as any).user.id,
            email: (req as any).user.email,
            username: (req as any).user.name,
        });
    }

    // Set request context
    Sentry.setContext('request', {
        correlationId: (req as any).correlationId,
        method: req.method,
        url: req.url,
        ip: req.ip,
    });

    next();
}
