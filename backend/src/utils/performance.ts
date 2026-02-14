import * as Sentry from '@sentry/node';
import logger from './logger';

export class PerformanceMonitor {
    /**
     * Measure function execution time
     */
    static async measure<T>(
        name: string,
        fn: () => Promise<T>,
        tags?: Record<string, string>
    ): Promise<T> {
        return await Sentry.startSpan(
            {
                op: 'function',
                name,
                attributes: tags,
            },
            async (span: Sentry.Span) => {
                const start = Date.now();

                try {
                    const result = await fn();
                    const duration = Date.now() - start;

                    span.setStatus({ code: 1 }); // OK status

                    // Log slow operations
                    if (duration > 1000) {
                        logger.warn('Slow operation detected', {
                            operation: name,
                            duration: `${duration}ms`,
                            tags,
                        });
                    }

                    return result;
                } catch (error) {
                    span.setStatus({ code: 2 }); // ERROR status
                    throw error;
                }
            }
        );
    }

    /**
     * Create a span for detailed tracing
     */
    static createSpan(
        operation: string,
        description?: string
    ) {
        return Sentry.startInactiveSpan({
            op: operation,
            name: description || operation,
        });
    }

    /**
     * Track custom metric
     */
    static trackMetric(
        name: string,
        value: number,
        unit: string = 'none',
        _tags?: Record<string, string> // Keep for API compatibility but don't use
    ) {
        // Sentry v10 metrics API - simplified without tags
        Sentry.metrics.distribution(name, value, {
            unit: unit as any,
        });
    }
}
