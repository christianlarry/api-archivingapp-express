import { logger } from "@/config/logger"
import { ResponseError } from "@/errors/ResponseError"
import { ValidationError } from "@/errors/ValidationError"
import { responseErr } from "@/utils/response"
import { NextFunction, Request, Response } from "express"

export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (!err) {
    next()
    return
  }

  if (err instanceof ValidationError) {
    logger.warn("Validation error: %O", err.issues)

    // Pastikan format response konsisten
    responseErr(res, err.status, {
      message: err.message,
      issues: err.issues
    })
  } else if (err instanceof ResponseError) {
    logger.warn("Response error: %s", err.message)

    responseErr(res, err.status, { message: err.message })
  } else {
    logger.error("Unexpected error: %O", err)

    responseErr(res, 500, { message: err.message })
  }
}