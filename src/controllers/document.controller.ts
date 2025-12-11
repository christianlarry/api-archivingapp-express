import { Request, Response, NextFunction } from "express"
import * as documentService from "@/services/document.service"
import { validate } from "@/validations/validate"
import { documentUpdateSchema, documentUploadSchema } from "@/validations/document.validation"
import { DocumentQueryDTO, DocumentUpdateDTO, DocumentUploadDTO } from "@/types/document.types"
import { ResponseError } from "@/errors/ResponseError"
import { responseOk } from "@/utils/response"
import { AuthRequest } from "@/middlewares/auth.middleware"
import { logger } from "@/config/logger"

export const upload = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new ResponseError(400, "File is required")
    }

    const body = req.body
    // Validate request body
    const payload = validate<DocumentUploadDTO>(documentUploadSchema, body)

    const user = req.user
    if (!user) throw new ResponseError(401, "Unauthorized")

    const result = await documentService.uploadDocument(req.file, payload, user._id)

    responseOk(res, 201, result)
  } catch (error) {
    next(error)
  }
}

export const index = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query: DocumentQueryDTO = {
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
      q: req.query.q as string,
      category: req.query.category as string,
      tags: req.query.tags as string
    }

    logger.info("Document query params: %O", query)

    const result = await documentService.getDocuments(query)

    responseOk(res, 200, result.data, {
      current: result.pagination.page,
      size: result.pagination.limit,
      total: result.pagination.total,
      totalPages: result.pagination.totalPages
    })
  } catch (error) {
    next(error)
  }
}

export const show = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    if (!id) {
      throw new ResponseError(400, "Document ID is required")
    }

    const result = await documentService.getDocumentById(id)
    responseOk(res, 200, result)
  } catch (error) {
    next(error)
  }
}

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    if (!id) {
      throw new ResponseError(400, "Document ID is required")
    }

    const payload = validate<DocumentUpdateDTO>(documentUpdateSchema, req.body)

    const result = await documentService.updateDocument(id, payload)
    responseOk(res, 200, result)
  } catch (error) {
    next(error)
  }
}

export const destroy = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    if (!id) {
      throw new ResponseError(400, "Document ID is required")
    }

    const result = await documentService.deleteDocument(id)
    responseOk(res, 200, result)
  } catch (error) {
    next(error)
  }
}

export const download = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    if (!id) {
      throw new ResponseError(400, "Document ID is required")
    }

    const { path: filePath, name } = await documentService.getDocumentFile(id)

    res.download(filePath, name)
  } catch (error) {
    next(error)
  }
}
