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
    res.status(201).json({ message: "User registered successfully", user })
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
    // req.user is populated by auth middleware
    res.status(200).json(req.user)
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
    res.status(200).json(user)
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
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}
