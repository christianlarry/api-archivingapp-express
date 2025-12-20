import { Request, Response, NextFunction } from "express"
import * as authService from "../services/auth.service"
import { AuthRequest } from "../middlewares/auth.middleware"
import { responseOk } from "@/utils/response"
import { sendRefreshTokenCookie } from "@/utils/jwt"

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
    const { user, token, refreshToken } = await authService.login(req.body)

    sendRefreshTokenCookie(res, refreshToken)

    responseOk(res, 200, { user, token })
  } catch (error) {
    next(error)
  }
}

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const incomingRefreshToken = req.cookies.refreshToken;
    if (!incomingRefreshToken) {
      // No content or Bad Request depending on preference, but strictly 401/403
      res.status(401).json({ error: "Refresh token not found" });
      return;
    }

    const result = await authService.refreshToken(incomingRefreshToken);

    sendRefreshTokenCookie(res, result.refreshToken);

    responseOk(res, 200, { token: result.token, user: result.user });
  } catch (error) {
    next(error);
  }
}

export const logout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const incomingRefreshToken = req.cookies.refreshToken;

    if (incomingRefreshToken) {
      await authService.logout(incomingRefreshToken);
    }

    res.clearCookie("refreshToken");
    responseOk(res, 200, { message: "Logged out successfully" });
  } catch (error) {
    next(error);
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