import { z } from "zod"
import dotenv from "dotenv"

dotenv.config()

const envValidationSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.string().transform((val) => parseInt(val, 10)),
  MONGODB_URI: z.string().min(1, "MongoDB URI is required"),
  MONGODB_NAME: z.string().min(1, "MongoDB database name is required"),
  JWT_SECRET: z.string().min(1, "JWT secret is required"),
  JWT_ACCESS_EXPIRATION_MINUTE: z.string().transform((val) => parseInt(val, 10)),
  JWT_REFRESH_SECRET: z.string().min(1, "JWT refresh secret is required"),
  JWT_REFRESH_EXPIRATION_DAYS: z.string().transform((val) => parseInt(val, 10)),
})

const envValidation = envValidationSchema.safeParse(process.env)

if (!envValidation.success) {
  console.error("❌ Invalid environment variables:", z.treeifyError(envValidation.error))
  throw new Error("Invalid environment variables")
} else {
  console.log("✅ Environment variables loaded and validated successfully.")
}

export const env = envValidation.data