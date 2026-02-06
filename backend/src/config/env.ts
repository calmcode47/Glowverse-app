import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../../.env") });

interface EnvConfig {
  nodeEnv: string;
  port: number;
  apiVersion: string;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  jwtRefreshSecret: string;
  jwtRefreshExpiresIn: string;
  cloudinary: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  };
  perfectCorp: {
    apiKey: string;
    apiSecret: string;
    baseUrl: string;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  corsOrigin: string[];
  upload: {
    maxFileSize: number;
    allowedFileTypes: string[];
  };
  logLevel: string;
  redis: {
    url: string;
    enabled: boolean;
  };
}

const validateEnv = (): EnvConfig => {
  const requiredEnvVars = [
    "PORT",
    "DATABASE_URL",
    "JWT_SECRET",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET"
  ];

  const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
  if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
  }

  return {
    nodeEnv: process.env.NODE_ENV || "development",
    port: parseInt(process.env.PORT || "5000", 10),
    apiVersion: process.env.API_VERSION || "v1",
    databaseUrl: process.env.DATABASE_URL as string,
    jwtSecret: process.env.JWT_SECRET as string,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || (process.env.JWT_SECRET as string),
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME as string,
      apiKey: process.env.CLOUDINARY_API_KEY as string,
      apiSecret: process.env.CLOUDINARY_API_SECRET as string
    },
    perfectCorp: {
      apiKey: process.env.PERFECTCORP_API_KEY || "",
      apiSecret: process.env.PERFECTCORP_API_SECRET || "",
      baseUrl: process.env.PERFECTCORP_BASE_URL || "https://api.perfectcorp.com/v1"
    },
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10)
    },
    corsOrigin: (process.env.CORS_ORIGIN?.split(",") || ["http://localhost:19006"]).map((o) => o.trim()),
    upload: {
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "10485760", 10),
      allowedFileTypes:
        process.env.ALLOWED_FILE_TYPES?.split(",").map((t) => t.trim()) ||
        ["image/jpeg", "image/png", "image/jpg"]
    },
    logLevel: process.env.LOG_LEVEL || "info",
    redis: {
      url: process.env.REDIS_URL || "redis://localhost:6379",
      enabled: process.env.REDIS_ENABLED === "true"
    }
  };
};

export const env: EnvConfig = validateEnv();
export default env;
