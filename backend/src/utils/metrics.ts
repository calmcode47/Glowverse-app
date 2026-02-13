
import { metrics } from '@opentelemetry/api';

const meter = metrics.getMeter('glowverse-backend-metrics');

// Business Metrics
export const orderCounter = meter.createCounter('orders_total', {
    description: 'Total number of orders created',
});

export const userRegistrationCounter = meter.createCounter('users_registered_total', {
    description: 'Total number of users registered',
});

export const tryOnCounter = meter.createCounter('ar_try_on_total', {
    description: 'Total number of AR try-on attempts',
});

export const paymentRequestCounter = meter.createCounter('payment_requests_total', {
    description: 'Total number of payment requests processed',
});

// Performance/Error Metrics
export const apiErrorCounter = meter.createCounter('api_errors_total', {
    description: 'Total number of API errors (5xx)',
});

export const activeUsersGauge = meter.createUpDownCounter('active_users_current', {
    description: 'Number of currently active users (websocket/session)',
});

/**
 * Metric Helper Class
 */
export class MetricsService {
    static incrementOrder() {
        orderCounter.add(1);
    }

    static incrementRegistration() {
        userRegistrationCounter.add(1);
    }

    static incrementTryOn(status: 'success' | 'failure') {
        tryOnCounter.add(1, { status });
    }

    static incrementApiError(route: string, code: number) {
        apiErrorCounter.add(1, { route, code });
    }
}
