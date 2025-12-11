import multer from "multer"
import path from "path"
import fs from "fs"
import { ResponseError } from "@/errors/ResponseError"
import { Request } from "express"

const uploadDir = path.join(process.cwd(), "public/uploads/")

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.memoryStorage()

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
    "application/msword", // doc
    "application/vnd.ms-excel", // xls
    "image/jpeg",
    "image/png",
    "image/webp",
  ]

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new ResponseError(400, "Invalid file type. Allowed: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, WEBP"))
  }
}

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: fileFilter,
})
