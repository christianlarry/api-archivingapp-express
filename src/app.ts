import express, { Application } from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import cookieParser from "cookie-parser"
import swaggerUi from "swagger-ui-express"
import yaml from "yamljs"
import path from "path"
import authRoutes from "./routes/auth.routes"
import documentRoutes from "./routes/document.routes"
import usersRoutes from "./routes/users.routes"
import { errorMiddleware } from "./middlewares/error.middleware"
import { env } from "./config/env"
import compression from "compression"
import { authLimiter, generalLimiter } from "./middlewares/rateLimit.middleware"

export const app: Application = express()

// Middlewares
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(compression())

// Rate Limiting
app.use(generalLimiter) // Apply to all requests

if (env.NODE_ENV === "development") {
  app.use(morgan("dev"))
}

// Swagger Documentation
const swaggerDocument = yaml.load(path.join(__dirname, "../docs/openapi.yaml"))
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// Routes
app.use("/api/v1/auth", authLimiter, authRoutes) // Stricter limit for auth
app.use("/api/v1/documents", documentRoutes)
app.use("/api/v1/users", usersRoutes)

// Health Check
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" })
})

// Error Handling
app.use(errorMiddleware)