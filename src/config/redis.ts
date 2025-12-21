import Redis from "ioredis";
import { env } from "./env";
import { logger } from "./logger";

const redisClient = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || "",
  lazyConnect: true, // Don't connect immediately
  retryStrategy: (times) => {
    // Retry connection logic
    // Exponential backoff capped at 2 seconds
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redisClient.on("connect", () => {
  logger.info("🔥 Redis client connected");
});

redisClient.on("error", (err) => {
  logger.error("Redis client error:", err);
});

// Connect explicitly
redisClient.connect().catch((err) => {
  logger.error("Failed to connect to Redis on startup:", err);
});

// handle redis disconnection on app termination
const gracefulShutdown = async (signal: string) => {
  try {
    logger.info("Received %s, closing Redis connection...", signal);
    await redisClient.quit();
    process.exit(0);
  } catch (err) {
    logger.error("Error during Redis graceful shutdown: %O", err);
    process.exit(1);
  }
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

export default redisClient;
