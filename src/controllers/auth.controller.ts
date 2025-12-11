import { Request, Response, NextFunction } from "express"
import * as authService from "../services/auth.service"
import { AuthRequest } from "../middlewares/auth.middleware"
import { responseOk } from "@/utils/response"

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await authService.register(req.body)
    responseOk(res, 201, { message: "User registered successfully", user })
  } catch (error) {
    next(error)
  }
}

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user, token } = await authService.login(req.body)
    responseOk(res, 200, { user, token })
  } catch (error) {
    next(error)
  }
}

export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    responseOk(res, 200, { user: req.user })
  } catch (error) {
    next(error)
  }
}

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await authService.updateProfile(req.user.id, req.body)
    responseOk(res, 200, { user })
  } catch (error) {
    next(error)
  }
}

export const changePassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await authService.changePassword(req.user.id, req.body)
    responseOk(res, 200, result)
  } catch (error) {
    next(error)
  }
}