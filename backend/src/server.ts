import app from "./app";
import env from "@config/env";
import prisma from "@config/database";
import logger from "@utils/logger";

const PORT = env.port;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT} in ${env.nodeEnv} mode`);
  logger.info(`📡 API: http://localhost:${PORT}/api/${env.apiVersion}`);
  logger.info(`🏥 Health: http://localhost:${PORT}/health`);
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
