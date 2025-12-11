import express, { Application } from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import authRoutes from "./routes/auth.routes"
import { errorMiddleware } from "./middlewares/error.middleware"
import { env } from "./config/env"
import compression from "compression"

export const app: Application = express()

// Middlewares
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(compression())

if (env.NODE_ENV === "development") {
  app.use(morgan("dev"))
}

// Routes
app.use("/api/v1/auth", authRoutes)

// Health Check
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" })
})

// Error Handling
app.use(errorMiddleware)