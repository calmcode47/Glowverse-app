import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import env from "@config/env";
import { errorHandler, notFoundHandler } from "@middleware/errorHandler";
import { apiLimiter } from "@middleware/rateLimiter";
import { registerRoutes } from "@routes/index";

const app: Application = express();

app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

if (env.nodeEnv === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

app.get("/health", (req, res) => {
  void req;
  return res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: env.nodeEnv,
    version: env.apiVersion
  });
});

const API_PREFIX = `/api/${env.apiVersion}`;
app.use(API_PREFIX, apiLimiter);

// Register all routes
registerRoutes(app, API_PREFIX);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
