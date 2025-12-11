import { z } from "zod"

export const documentUploadSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category: z.string().optional(),
  tags: z.string().optional(), // Will be parsed manually or via transform if possible, but keep simple here
})

export const documentUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
})
