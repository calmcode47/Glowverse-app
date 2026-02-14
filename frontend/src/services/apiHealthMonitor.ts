import { client } from "./api/client";
import { analytics } from "./analytics.service";

type EndpointHealth =
  | { status: "healthy"; latency: number; lastChecked: Date }
  | { status: "unhealthy"; error: string; lastChecked: Date };

class APIHealthMonitor {
  private healthStatus: Map<string, EndpointHealth> = new Map();
  private checkInterval: any = null;

  start(): void {
    if (this.checkInterval) return;
    this.checkInterval = setInterval(() => {
      this.checkHealth().catch(() => {});
    }, 30000);
  }

  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  private async checkHealth(): Promise<void> {
    const started = Date.now();
    try {
      await client.get("/health");
      const latency = Date.now() - started;
      this.healthStatus.set("api", { status: "healthy", latency, lastChecked: new Date() });
      analytics.logEvent({ name: "api_health_check", properties: { status: "healthy", latency } });
    } catch (error: any) {
      this.healthStatus.set("api", { status: "unhealthy", error: error?.message || "unknown", lastChecked: new Date() });
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const Sentry = require("@sentry/react-native");
        Sentry.captureMessage("API Health Check Failed", { level: "warning", extra: { error } });
      } catch {}
    }
  }

  getStatus(endpoint: string = "api"): EndpointHealth | undefined {
    return this.healthStatus.get(endpoint);
  }

  isHealthy(endpoint: string = "api"): boolean {
    const health = this.healthStatus.get(endpoint);
    return health?.status === "healthy";
  }
}

export const apiHealthMonitor = new APIHealthMonitor();
