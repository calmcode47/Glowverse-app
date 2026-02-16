import { analytics } from "../services/analytics.service";
import { ENABLE_VERBOSE_LOGS } from "./debugFlags";
import { logger } from "./logger";

export function measureScreenLoad(screenName: string) {
  const start = Date.now();
  return () => {
    const ms = Date.now() - start;
    try {
      const name: any = "@sentry/react-native";
      const Sentry = (require as any)(name);
      Sentry.addBreadcrumb({
        category: "screen-load",
        message: `${screenName} loaded in ${ms}ms`,
        level: "info",
        data: { screenName, loadTime: ms }
      });
    } catch {}
    if (ENABLE_VERBOSE_LOGS && __DEV__) {
      logger.debug(`Screen load: ${screenName} - ${ms}ms`);
    }
  };
}

export function measureRenderTime(componentName: string) {
  const startTime = (globalThis.performance?.now?.() as number) || Date.now();
  return () => {
    const endTime = (globalThis.performance?.now?.() as number) || Date.now();
    const renderTime = endTime - startTime;
    if (renderTime > 16) {
      if (ENABLE_VERBOSE_LOGS && __DEV__) {
        logger.warn(`Slow render: ${componentName} took ${Math.round(renderTime)}ms`);
      }
      analytics.logEvent({
        name: "performance_issue",
        properties: {
          component: componentName,
          render_time: Math.round(renderTime),
          threshold: 16
        }
      });
    }
  };
}
