import jwt from "jsonwebtoken"
import { Response } from "express"
import { env } from "../config/env"
import { IUser } from "../models/user.model"

export const generateToken = (user: IUser): string => {
  const payload = {
    sub: user._id,
    role: user.role,
  }

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: `${env.JWT_ACCESS_EXPIRATION_MINUTE}m`,
  })
}

export const generateRefreshToken = (user: IUser): string => {
  const payload = {
    sub: user._id,
  }

  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: `${env.JWT_REFRESH_EXPIRATION_DAYS}d`,
  })
}

export const verifyToken = (token: string) => {
  return jwt.verify(token, env.JWT_SECRET)
}

export const verifyRefreshToken = (token: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as any
}

export const sendRefreshTokenCookie = (res: Response, token: string) => {
  const cookieOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    expires: new Date(Date.now() + env.JWT_REFRESH_EXPIRATION_DAYS * 24 * 60 * 60 * 1000),
    sameSite: "strict" as const,
    path: "/" // cookie is valid for all paths
  }

  res.cookie("refreshToken", token, cookieOptions)
}
