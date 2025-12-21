import { DocumentModel } from "@/models/document.model"
import { DocumentQueryDTO, DocumentUpdateDTO, DocumentUploadDTO } from "@/types/document.types"
import { ResponseError } from "@/errors/ResponseError"
import { logger } from "@/config/logger"
import * as cache from "@/utils/cache"
import { LocalStorageService } from "./storage/local.storage"
import { IStorageService } from "@/interfaces/storage.interface"

// Initialize Storage Service (Dependency Injection could be used here in a larger app)
const storageService: IStorageService = new LocalStorageService();

export const uploadDocument = async (
  file: Express.Multer.File,
  data: DocumentUploadDTO,
  userId: string
) => {

  // Generate safe filename and path
  const fileSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
  const ext = file.originalname.substring(file.originalname.lastIndexOf("."))
  const safeName = file.originalname
    .substring(0, file.originalname.lastIndexOf("."))
    .replace(/[^a-zA-Z0-9]/g, "_")
  const fileName = `${safeName}-${fileSuffix}${ext}`
  const filePath = `public/uploads/${fileName}`
  
  // Upload file using Storage Service
  try {
    await storageService.upload(file, filePath);
    logger.info("File saved successfully: %s", file.originalname);
  } catch (err) {
    logger.error("Error saving uploaded file: %O", err);
    throw new ResponseError(500, "Failed to save uploaded file");
  }

  const tags = data.tags ? data.tags.split(",").map((t) => t.trim()).filter((t) => t) : []

  const document = await DocumentModel.create({
    title: data.title,
    description: data.description,
    originalName: file.originalname,
    storagePath: filePath, // Store the path returned/used by the service
    mimeType: file.mimetype,
    size: file.size,
    category: data.category,
    tags: tags,
    uploadedBy: userId,
  })

  // Invalidate list cache
  await cache.clearKeys("docs:list:*")

  return document
}

export const getDocuments = async (query: DocumentQueryDTO) => {
  // Generate a unique cache key based on query parameters
  const cacheKey = `docs:list:${JSON.stringify(query)}`

  return cache.getOrSet(cacheKey, async () => {
    const page = query.page || 1
    const limit = query.limit || 10
    const skip = (page - 1) * limit

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {}

    if (query.q) {
      filter.$text = { $search: query.q }
    }

    if (query.category) {
      filter.category = query.category
    }

    if (query.tags) {
      const tagsArray = query.tags.split(",").map((t) => t.trim())
      filter.tags = { $in: tagsArray }
    }

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
  }, 3600) // Cache for 1 hour
}

export const getDocumentById = async (id: string) => {
  const cacheKey = `docs:id:${id}`

  return cache.getOrSet(cacheKey, async () => {
    const document = await DocumentModel.findById(id).populate("uploadedBy", "fullName email")
    if (!document) {
      throw new ResponseError(404, "Document not found")
    }
    return document
  }, 3600) // Cache for 1 hour
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

  // Invalidate specific cache and list cache
  await cache.del(`docs:id:${id}`)
  await cache.clearKeys("docs:list:*")

  return document
}

export const deleteDocument = async (id: string) => {
  const document = await DocumentModel.findById(id)
  if (!document) {
    throw new ResponseError(404, "Document not found")
  }

  // Delete file from storage
  try {
    await storageService.delete(document.storagePath);
  } catch (err) {
    logger.error(`Failed to delete file: ${document.storagePath}. %O`, err)
    // We continue to delete the document record even if file deletion fails
    // or we might want to throw? Usually better to clean up the record.
  }

  await document.deleteOne()

  // Invalidate specific cache and list cache
  await cache.del(`docs:id:${id}`)
  await cache.clearKeys("docs:list:*")

  return { message: "Document deleted successfully" }
}

// Temp placeholder, will be replaced after checking controller
export const getDocumentFile = async (id: string) => {
  const document = await DocumentModel.findById(id)
  if (!document) {
    throw new ResponseError(404, "Document not found")
  }

  // Verify file existence via storage service (simulated by trying to get stream or just returning path for now)
  // Ideally we would update the controller to accept a stream.
  // For now, we will trust the database and return the path, 
  // allowing the controller to fail if file is missing (or handle it there).
  
  return {
    path: document.storagePath,
    name: document.originalName,
    mimeType: document.mimeType,
  }
}
