/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from "express"
import { verifyToken } from "../utils/jwt"
import { User } from "../models/user.model"
import { ResponseError } from "@/errors/ResponseError"
import { logger } from "@/config/logger"

export interface AuthRequest extends Request {
  user?: any
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1]
  }

  if (!token) {
    return next(new ResponseError(401, "Not authorized to access this route"))
  }

  try {
    const decoded = verifyToken(token)
    const user = await User.findById(decoded.sub)

    if (!user) {
      return next(new ResponseError(401, "The user belonging to this token no longer exists"))
    }

    req.user = user
    next()
  } catch (error) {
    logger.error(error)
    return next(new ResponseError(401, "Not authorized to access this route"))
  }
}

export const restrictTo = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ResponseError(403, "You do not have permission to perform this action")
      )
    }
    next()
  }
}
