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
