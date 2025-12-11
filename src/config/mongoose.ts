import mongoose from "mongoose"
import { env } from "./env"
import { logger } from "./logger"

mongoose.set("strictQuery", false)

const buildMongoUri = (): string => {
  const uri = env.MONGODB_URI
  if (!uri) throw new Error("MONGODB_URI is required")

  // If the URI already contains the database name, use it as-is.
  if (env.MONGODB_NAME && uri.includes(env.MONGODB_NAME)) return uri

  // Append the database name if provided and not already present.
  if (env.MONGODB_NAME) {
    const separator = uri.endsWith("/") ? "" : "/"
    return `${uri}${separator}${env.MONGODB_NAME}`
  }

  return uri
}

export async function connectToDatabase(): Promise<void> {
  const uri = buildMongoUri()
  try {
    await mongoose.connect(uri)
    logger.info("Connected to MongoDB: %s", uri)
  } catch (error) {
    logger.error("Failed to connect to MongoDB: %O", error)
    throw error
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.disconnect()
    logger.info("Disconnected from MongoDB")
  } catch (error) {
    logger.error("Error while disconnecting MongoDB: %O", error)
    throw error
  }
}

// Optional: log important connection events
mongoose.connection.on("connected", () => logger.info("Mongoose default connection open"))
mongoose.connection.on("error", (err) => logger.error("Mongoose connection error: %O", err))
mongoose.connection.on("disconnected", () => logger.info("Mongoose default connection disconnected"))

// Graceful shutdown helper to be used by the application entrypoint
export function setupMongooseCloseOnExit(): void {
  const graceful = async (signal: string) => {
    try {
      logger.info("Received %s, closing MongoDB connection...", signal)
      await disconnectDatabase()
      process.exit(0)
    } catch (err) {
      logger.error("Error during graceful shutdown: %O", err)
      process.exit(1)
    }
  }

  process.on("SIGINT", () => graceful("SIGINT"))
  process.on("SIGTERM", () => graceful("SIGTERM"))
}
