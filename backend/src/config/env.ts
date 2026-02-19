import path from "path";
import { getConfig } from "./env.validator";

const cfg = getConfig();

const env = {
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
    apiSecret: cfg.CLOUDINARY_API_SECRET
  },
  perfectCorp: {
    apiKey: cfg.PERFECTCORP_API_KEY,
    baseUrl: cfg.PERFECTCORP_API_URL
  },
  rateLimit: {
    windowMs: cfg.RATE_LIMIT_WINDOW_MS,
    maxRequests: cfg.RATE_LIMIT_MAX
  },
  upload: {
    allowedFileTypes: ["image/jpeg", "image/png", "image/webp", "image/jpg"],
    maxFileSize: 10 * 1024 * 1024
  },
  localDataDir: path.join(process.cwd(), "data")
};

export default env;
