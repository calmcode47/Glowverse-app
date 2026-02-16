type LogLevel = "debug" | "info" | "warn" | "error";

class Logger {
  private isDev = typeof __DEV__ !== "undefined" ? __DEV__ : true;

  debug(message: string, ...args: unknown[]): void {
    if (this.isDev) {
      // eslint-disable-next-line no-console
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }
  info(message: string, ...args: unknown[]): void {
    // eslint-disable-next-line no-console
    console.info(`[INFO] ${message}`, ...args);
  }
  warn(message: string, ...args: unknown[]): void {
    // eslint-disable-next-line no-console
    console.warn(`[WARN] ${message}`, ...args);
  }
  error(message: string, error?: unknown): void {
    // eslint-disable-next-line no-console
    console.error(`[ERROR] ${message}`, error);
    try {
      const Sentry = (require as any)("@sentry/react-native");
      if (Sentry?.captureException && !this.isDev && error instanceof Error) {
        Sentry.captureException(error);
      }
    } catch {}
  }
}

export const logger = new Logger();

export function log(level: "debug" | "info" | "warn" | "error", message: string, ...args: unknown[]) {
  if (level === "debug") return logger.debug(message, ...args);
  if (level === "info") return logger.info(message, ...args);
  if (level === "warn") return logger.warn(message, ...args);
  return logger.error(message, args[0] instanceof Error ? (args[0] as Error) : undefined);
}
