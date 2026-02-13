import csrf from 'csurf';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

// Configure CSRF protection
export const csrfProtection = csrf({
    cookie: {
        httpOnly: true,
        secure: config.server.isProduction,
        sameSite: 'strict',
    },
});

// Middleware to attach CSRF token to response locals
export function attachCsrfToken(req: Request, res: Response, next: NextFunction) {
    res.locals.csrfToken = req.csrfToken();
    next();
}

// Endpoint to get CSRF token
export function csrfTokenEndpoint(req: Request, res: Response) {
    res.json({
        success: true,
        data: {
            csrfToken: req.csrfToken(),
        },
    });
}
