import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

// Validate environment BEFORE importing anything else
import { validateEnv } from './config/env.validator';
validateEnv();

// Now safe to import app and config
import app from "./app";
import { config } from './config';
import prisma from "@config/database";
import logger from "@utils/logger";
import { startTokenCleanupScheduler } from "./jobs/cleanup-tokens.job";

const PORT = config.server.port;
const HOST = config.server.host;

const server = app.listen(PORT, HOST, () => {
  logger.info(`🚀 Server running in ${config.server.env} mode`);
  logger.info(`📡 API: http://${HOST}:${PORT}/api/v1`);
  logger.info(`🏥 Health: http://${HOST}:${PORT}/health`);

  // Start background jobs
  startTokenCleanupScheduler();
});

const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received, closing server gracefully...`);

  server.close(async () => {
    logger.info("HTTP server closed");
    await prisma.$disconnect();
    logger.info("Database connection closed");
    process.exit(0);
  });

  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("unhandledRejection", (reason: any) => {
  logger.error("Unhandled Rejection:", reason);
  void gracefulShutdown("UNHANDLED_REJECTION");
});

process.on("uncaughtException", (error: Error) => {
  logger.error("Uncaught Exception:", error);
  void gracefulShutdown("UNCAUGHT_EXCEPTION");
});

export default server;

