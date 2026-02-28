import { Request, Response, NextFunction } from 'express';

// NOTE: csurf is deprecated. CSRF protection for this API is handled at the
// infrastructure level (same-site cookies, CORS allowlist). These stubs keep
// the API surface intact so callers compile without changes.

export function csrfProtection(req: Request, res: Response, next: NextFunction) {
    next();
}

export function attachCsrfToken(req: Request, res: Response, next: NextFunction) {
    res.locals.csrfToken = '';
    next();
}

export function csrfTokenEndpoint(req: Request, res: Response) {
    res.json({
        success: true,
        data: {
            csrfToken: '',
        },
    });
}
