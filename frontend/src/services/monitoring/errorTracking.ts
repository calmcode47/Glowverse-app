import { analytics } from "../../services/analytics.service";
let Sentry: any = null;
try {
  const name: any = "@sentry/react-native";
  Sentry = (require as any)(name);
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
