import path from "path";
import { getConfig } from "./env.validator";

// Use a Proxy so config properties are read lazily on first access,
// after validateEnv() has stored global.config. This avoids the ESM
// import-hoisting race where this module loads before server.ts can call
// validateEnv().
const env = new Proxy({} as ReturnType<typeof buildEnv>, {
  get(_target, prop: string) {
    return buildEnv()[prop as keyof ReturnType<typeof buildEnv>];
  },
});

function buildEnv() {
  const cfg = getConfig();
  return {
    nodeEnv: cfg.NODE_ENV,
    port: cfg.PORT,
    host: cfg.HOST,
    jwtSecret: cfg.JWT_SECRET,
    jwtExpiresIn: cfg.JWT_EXPIRES_IN,
    jwtRefreshSecret: cfg.JWT_REFRESH_SECRET,
    jwtRefreshExpiresIn: cfg.JWT_REFRESH_EXPIRES_IN,
    cloudinary: {
      cloudName: cfg.CLOUDINARY_CLOUD_NAME,
      apiKey: cfg.CLOUDINARY_API_KEY,
      apiSecret: cfg.CLOUDINARY_API_SECRET,
    },
    perfectCorp: {
      apiKey: cfg.PERFECTCORP_API_KEY,
      baseUrl: cfg.PERFECTCORP_API_URL,
    },
    rateLimit: {
      windowMs: cfg.RATE_LIMIT_WINDOW_MS,
      maxRequests: cfg.RATE_LIMIT_MAX,
    },
    upload: {
      allowedFileTypes: ["image/jpeg", "image/png", "image/webp", "image/jpg"],
      maxFileSize: 10 * 1024 * 1024,
    },
    localDataDir: path.join(process.cwd(), "data"),
  };
}

export default env;
