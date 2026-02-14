import { analytics } from "../../services/analytics.service";
let Sentry: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Sentry = require("@sentry/react-native");
} catch {}

export function trackApiError(error: any, context: { endpoint: string; method: string; statusCode: number }): void {
  try {
    Sentry?.captureException?.(error, {
      tags: { error_type: "api_error", endpoint: context.endpoint, method: context.method, status: String(context.statusCode) }
    });
  } catch {}
  try {
    analytics.trackEvent("api_error" as any, {
      endpoint: context.endpoint,
      method: context.method,
      status_code: context.statusCode
    } as any);
  } catch {}
}

