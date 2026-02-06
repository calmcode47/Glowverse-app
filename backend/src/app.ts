import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import env from "@config/env";
import { errorHandler, notFoundHandler } from "@middleware/errorHandler";
import { apiLimiter } from "@middleware/rateLimiter";
import authRoutes from "@routes/auth.routes";
import userRoutes from "@routes/user.routes";
import analysisRoutes from "@routes/analysis.routes";
import tryonRoutes from "@routes/tryon.routes";
import favoriteRoutes from "@routes/favorite.routes";
import uploadRoutes from "@routes/upload.routes";
import perfectcorpRoutes from "@routes/perfectcorp.routes";
import productRoutes from "@routes/product.routes";

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

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/analysis`, analysisRoutes);
app.use(`${API_PREFIX}/tryon`, tryonRoutes);
app.use(`${API_PREFIX}/favorites`, favoriteRoutes);
app.use(`${API_PREFIX}/upload`, uploadRoutes);
app.use(`${API_PREFIX}/perfectcorp`, perfectcorpRoutes);
app.use(`${API_PREFIX}/products`, productRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
