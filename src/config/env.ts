import {z} from "zod"
import dotenv from "dotenv"

dotenv.config()

const envValidationSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.string().transform((val) => parseInt(val, 10)),
  MONGODB_URI: z.string().min(1, "MongoDB URI is required"),
  MONGODB_NAME: z.string().min(1, "MongoDB database name is required"),
  JWT_SECRET: z.string().min(1, "JWT secret is required"),
  JWT_ACCESS_EXPIRATION_MINUTE: z.string().transform((val) => parseInt(val, 10)),
})

const envValidation = envValidationSchema.safeParse(process.env)

if (!envValidation.success) {
  console.error("❌ Invalid environment variables:", z.treeifyError(envValidation.error))
  throw new Error("Invalid environment variables")
}

export const env = envValidation.data