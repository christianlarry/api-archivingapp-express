import { app } from "@/app";
import { env } from "@/config/env";
import { logger } from "@/config/logger";
import { connectToDatabase, disconnectDatabase } from "./config/mongoose";
import { disconnectRedis } from "./config/redis";

const PORT: number = env.PORT || 3000;

// Connect to Database
connectToDatabase();

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server is running on http://localhost:${PORT}`);
  logger.info(`Environment: ${env.NODE_ENV}`);
});

// Graceful Shutdown Logic
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  // 1. Stop accepting new requests
  server.close(async (err) => {
    if (err) {
      logger.error("Error closing HTTP server:", err);
      process.exit(1);
    }
    logger.info("HTTP server closed.");

    try {
      // 2. Close Database Connections
      // We do this in parallel to speed up shutdown
      await Promise.all([
        disconnectDatabase(),
        disconnectRedis()
      ]);

      logger.info("All connections closed. Exiting process.");
      process.exit(0);
    } catch (error) {
      logger.error("Error during resource cleanup:", error);
      process.exit(1);
    }
  });

  // Force exit if shutdown takes too long (e.g., 10 seconds)
  setTimeout(() => {
    logger.error("Could not close connections in time, forcefully shutting down");
    process.exit(1);
  }, 10000);
};

// Listen for termination signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));