import mongoSanitize from 'express-mongo-sanitize';
// @ts-ignore - xss-clean lacks TypeScript type definitions
import xss from 'xss-clean';
// @ts-ignore - hpp module types may be incomplete
import hpp from 'hpp';
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// MongoDB injection prevention
export const preventMongoInjection = mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
        logger.warn('Potential MongoDB injection detected', {
            ip: req.ip,
            key,
            url: req.url,
            method: req.method,
        });
    },
});

// XSS prevention
export const preventXSS = xss();

// HTTP Parameter Pollution prevention
export const preventHPP = hpp({
    whitelist: ['category', 'sort', 'tags', 'filter'], // Allow these query params to have multiple values
});

// Input length limits
export function limitInputLength(req: Request, res: Response, next: NextFunction): void {
    const MAX_JSON_SIZE = 10 * 1024 * 1024; // 10MB
    const MAX_URL_LENGTH = 2048;

    // Check URL length
    if (req.url.length > MAX_URL_LENGTH) {
        logger.warn('URL too long', { url: req.url, length: req.url.length, ip: req.ip });
        res.status(414).json({
            success: false,
            error: {
                message: 'URL too long',
                statusCode: 414,
            },
        });
        return;
    }

    // Check body size (if JSON)
    if (req.is('json') && req.headers['content-length']) {
        const contentLength = parseInt(req.headers['content-length'], 10);
        if (contentLength > MAX_JSON_SIZE) {
            logger.warn('Request body too large', { contentLength, ip: req.ip });
            res.status(413).json({
                success: false,
                error: {
                    message: 'Request body too large',
                    statusCode: 413,
                },
            });
            return;
        }
    }

    next();
}

// Sanitize string inputs
export function sanitizeStrings(obj: any): any {
    if (typeof obj === 'string') {
        return obj.trim().slice(0, 10000); // Limit string length to 10k chars
    }

    if (Array.isArray(obj)) {
        return obj.map(sanitizeStrings);
    }

    if (obj && typeof obj === 'object') {
        const sanitized: any = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                sanitized[key] = sanitizeStrings(obj[key]);
            }
        }
        return sanitized;
    }

    return obj;
}

// Sanitize all inputs (body, query, params)
export function sanitizeInputs(req: Request, res: Response, next: NextFunction) {
    if (req.body) {
        req.body = sanitizeStrings(req.body);
    }
    if (req.query) {
        req.query = sanitizeStrings(req.query);
    }
    if (req.params) {
        req.params = sanitizeStrings(req.params);
    }
    next();
}
