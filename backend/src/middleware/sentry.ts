import * as Sentry from '@sentry/node';
import { Request, Response, NextFunction } from 'express';

// Request handler - captures request data for Sentry
export function sentryRequestHandler(req: Request, res: Response, next: NextFunction) {
    Sentry.setContext('request', {
        method: req.method,
        url: req.url,
        ip: req.ip,
    });
    next();
}

// Tracing handler - no-op if tracing not configured via Sentry v10 auto-instrumentation
export function sentryTracingHandler(req: Request, _res: Response, next: NextFunction) {
    // Sentry v10 uses auto-instrumentation; this is a compatibility shim
    next();
}

// Error handler (should be after all routes)
export function sentryErrorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    Sentry.captureException(err);
    next(err);
}

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
