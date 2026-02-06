import { log } from "@utils/logger";

export function measureRenderTime(componentName: string) {
  const start = Date.now();
  return () => {
    const duration = Date.now() - start;
    log("debug", `${componentName} render ${duration}ms`);
    return duration;
  };
}

export function trackAPICall(endpoint: string, duration: number) {
  log("info", `API ${endpoint} ${duration}ms`);
}

export function memoryUsageMonitor(intervalMs = 5000) {
  const timer = setInterval(() => {
    const anyPerf = (globalThis as any).performance;
    const mem = anyPerf && anyPerf.memory ? anyPerf.memory : null;
    if (mem) {
      log("debug", `Memory used ${Math.round(mem.usedJSHeapSize / 1024 / 1024)}MB`);
    }
  }, intervalMs);
  return () => clearInterval(timer);
}
