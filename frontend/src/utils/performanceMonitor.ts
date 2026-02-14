import { analytics } from "../services/analytics.service";

export function measureScreenLoad(screenName: string) {
  const start = Date.now();
  return () => {
    const ms = Date.now() - start;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Sentry = require("@sentry/react-native");
      Sentry.addBreadcrumb({
        category: "screen-load",
        message: `${screenName} loaded in ${ms}ms`,
        level: "info",
        data: { screenName, loadTime: ms }
      });
    } catch {}
    // eslint-disable-next-line no-console
    console.log(`Screen load: ${screenName} - ${ms}ms`);
  };
}

export function measureRenderTime(componentName: string) {
  const startTime = (globalThis.performance?.now?.() as number) || Date.now();
  return () => {
    const endTime = (globalThis.performance?.now?.() as number) || Date.now();
    const renderTime = endTime - startTime;
    if (renderTime > 16) {
      // eslint-disable-next-line no-console
      console.warn(`Slow render: ${componentName} took ${Math.round(renderTime)}ms`);
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
