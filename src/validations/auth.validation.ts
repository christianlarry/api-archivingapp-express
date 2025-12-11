import { z } from "zod"

export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  fullName: z.string().min(1),
})

export const loginSchema = z.object({
  email: z.email(),
  password: z.string(),
})

export const updateProfileSchema = z.object({
  fullName: z.string().optional(),
  email: z.string().optional(),
})

export const changePasswordSchema = z.object({
  oldPassword: z.string(),
  newPassword: z.string().min(8),
})
