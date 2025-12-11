/* eslint-disable @typescript-eslint/no-explicit-any */
import { DocumentModel } from "@/models/document.model"
import { DocumentQueryDTO, DocumentUpdateDTO, DocumentUploadDTO } from "@/types/document.types"
import { ResponseError } from "@/errors/ResponseError"
import fs from "fs"
import { logger } from "@/config/logger"

export const uploadDocument = async (
  file: Express.Multer.File,
  data: DocumentUploadDTO,
  userId: string
) => {

  // Save file to disk
  const fileSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
  const ext = file.originalname.substring(file.originalname.lastIndexOf("."))
  const safeName = file.originalname
    .substring(0, file.originalname.lastIndexOf("."))
    .replace(/[^a-zA-Z0-9]/g, "_")
  const fileName = `${safeName}-${fileSuffix}${ext}`
  const filePath = `public/uploads/${fileName}`
  file.path = filePath

  fs.writeFile(filePath, file.buffer, (err) => {
    if (err) {
      logger.error("Error saving uploaded file: %O", err)
      throw new ResponseError(500, "Failed to save uploaded file")
    }
    logger.info("File saved successfully: %s", file.originalname)
  })

  const tags = data.tags ? data.tags.split(",").map((t) => t.trim()).filter((t) => t) : []

  const document = await DocumentModel.create({
    title: data.title,
    description: data.description,
    originalName: file.originalname,
    storagePath: file.path,
    mimeType: file.mimetype,
    size: file.size,
    category: data.category,
    tags: tags,
    uploadedBy: userId,
  })

  return document
}

export const getDocuments = async (query: DocumentQueryDTO) => {
  const page = query.page || 1
  const limit = query.limit || 10
  const skip = (page - 1) * limit

  const filter: any = {}

  if (query.q) {
    filter.$text = { $search: query.q }
  }

  if (query.category) {
    filter.category = query.category
  }

  if (query.tags) {
    // If multiple tags are sent ?tags=tag1,tag2 or just ?tags=tag1
    // The query DTO defines it as string.
    const tagsArray = query.tags.split(",").map((t) => t.trim())
    filter.tags = { $in: tagsArray }
  }

  DocumentModel.find()

  const documents = await DocumentModel.find(filter)
    .populate("uploadedBy", "fullName email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)

  const total = await DocumentModel.countDocuments(filter)

  return {
    data: documents,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export const getDocumentById = async (id: string) => {
  const document = await DocumentModel.findById(id).populate("uploadedBy", "fullName email")
  if (!document) {
    throw new ResponseError(404, "Document not found")
  }
  return document
}

export const updateDocument = async (id: string, data: DocumentUpdateDTO) => {
  const document = await DocumentModel.findByIdAndUpdate(
    id,
    {
      ...data,
      // If tags is provided, it replaces the array.
    },
    { new: true, runValidators: true }
  ).populate("uploadedBy", "fullName email")

  if (!document) {
    throw new ResponseError(404, "Document not found")
  }
  return document
}

export const deleteDocument = async (id: string) => {
  const document = await DocumentModel.findById(id)
  if (!document) {
    throw new ResponseError(404, "Document not found")
  }

  // Delete file from storage
  if (fs.existsSync(document.storagePath)) {
    try {
      fs.unlinkSync(document.storagePath)
    } catch (err) {
      logger.error(`Failed to delete file: ${document.storagePath}. %O`, err)
      // Continue to delete record even if file deletion fails?
      // Usually yes, to keep DB clean.
    }
  }

  await document.deleteOne()
  return { message: "Document deleted successfully" }
}

export const getDocumentFile = async (id: string) => {
  const document = await DocumentModel.findById(id)
  if (!document) {
    throw new ResponseError(404, "Document not found")
  }

  if (!fs.existsSync(document.storagePath)) {
    throw new ResponseError(404, "File not found on server")
  }

  return {
    path: document.storagePath,
    name: document.originalName,
    mimeType: document.mimeType,
  }
}
