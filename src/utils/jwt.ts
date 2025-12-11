import jwt from "jsonwebtoken"
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

export const verifyToken = (token: string): any => {
  return jwt.verify(token, env.JWT_SECRET)
}
