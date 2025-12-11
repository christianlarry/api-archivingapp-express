import { ValidationErrorItem } from "@/errors/ValidationError"
import { Pagination } from "@/types/global.types"
import { Response } from "express"

const responseOk = <T>(res: Response, status: number, data: T, page?: Pagination) => {
  if (!page) {
    return res.status(status).json({
      data
    }).end()
  }
  return res.status(status).json({
    data,
    page: {
      size: page.size,
      total: page.total,
      totalPages: page.totalPages,
      current: page.current
    }
  }).end()
}

const responseErr = (res: Response, status: number, error: { message: string, issues?: ValidationErrorItem[] }) => {
  return res.status(status).json({
    error,
  }).end();
}

export {
  responseOk,
  responseErr
};