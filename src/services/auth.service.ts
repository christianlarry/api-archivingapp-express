import { IUser, User } from "../models/user.model"
import { hashPassword, comparePassword } from "../utils/password"
import { generateToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt"
import { ResponseError } from "@/errors/ResponseError"
import { ChangePasswordDTO, LoginDTO, RegisterDTO, UpdateProfileDTO, UserPublic } from "@/types/auth.types"
import { validate } from "@/validations/validate"
import { changePasswordSchema, loginSchema, registerSchema, updateProfileSchema } from "@/validations/auth.validation"
import { env } from "@/config/env"
import { logger } from "@/config/logger"

const toPublic = (user: IUser): UserPublic => {
  const obj = user.toObject()
  delete obj.password
  delete obj.refreshTokens
  return obj as UserPublic
}

export const register = async (userData: RegisterDTO) => {

  // Validation
  const payload = validate<RegisterDTO>(registerSchema, userData)

  const existingUser = await User.findOne({ email: payload.email })
  if (existingUser) {
    throw new ResponseError(400, "Email already exists")
  }

  const hashedPassword = await hashPassword(payload.password)
  const user = await User.create({
    ...payload,
    password: hashedPassword,
  })

  // Return user without password
  const userJson = toPublic(user)

  return userJson
}

export const login = async (loginData: LoginDTO) => {

  const payload = validate<LoginDTO>(loginSchema, loginData)

  const user = await User.findOne({ email: payload.email }).select("+password +refreshTokens")

  if (!user || !(await comparePassword(payload.password, user.password!))) {
    throw new ResponseError(401, "Invalid credentials")
  }

  const token = generateToken(user)
  const refreshToken = generateRefreshToken(user)

  // Save refresh token
  user.refreshTokens = user.refreshTokens || []
  user.refreshTokens.push(refreshToken)

  // Optional: Cap the number of refresh tokens (e.g., max 5 devices)
  if (user.refreshTokens.length > 5) {
    user.refreshTokens.shift(); // Remove the oldest
  }

  await user.save()

  const userJson = toPublic(user)

  return { user: userJson, token, refreshToken }
}

export const refreshToken = async (incomingRefreshToken: string) => {
  let decoded;
  try {
    decoded = verifyRefreshToken(incomingRefreshToken);
  } catch (err) {
    if (env.NODE_ENV === "development" && err instanceof Error) {
      logger.error("Refresh token verification failed: %s", err.message);
    }
    // If token is invalid/expired, we might want to just say "Forbidden" or "Unauthorized"
    throw new ResponseError(403, "Invalid refresh token");
  }

  const user = await User.findById(decoded.sub).select("+refreshTokens");

  if (!user) {
    throw new ResponseError(401, "User not found");
  }

  // Reuse Detection Logic
  // If the token is valid (signature-wise) but NOT in the DB, it means it was already used/rotated.
  if (!user.refreshTokens || !user.refreshTokens.includes(incomingRefreshToken)) {
    // Valid signature, but not in DB -> REUSE DETECTED!
    // Clear all refresh tokens to force re-login on all devices
    user.refreshTokens = [];
    await user.save();

    throw new ResponseError(403, "Refresh token reuse detected. Please login again.");
  }

  // Rotation Logic
  // 1. Remove old token
  user.refreshTokens = user.refreshTokens.filter(t => t !== incomingRefreshToken);

  // 2. Generate new pair
  const newAccessToken = generateToken(user);
  const newRefreshToken = generateRefreshToken(user);

  // 3. Add new refresh token
  user.refreshTokens.push(newRefreshToken);

  // Optional: Cap max devices
  if (user.refreshTokens.length > 5) {
    user.refreshTokens.shift();
  }

  await user.save();

  return {
    token: newAccessToken,
    refreshToken: newRefreshToken,
    user: toPublic(user)
  };
};

export const logout = async (incomingRefreshToken: string) => {
  // Decode token to get user ID
  // We can use verifyRefreshToken, but for logout, even if expired, 
  // we might want to remove it if possible. 
  // However, for security, verify is better. If expired, it's already useless.
  // Let's use decode for broad compatibility or verify if we want strictness.
  // Given rotation logic, let's try to verify.

  try {
    const decoded = verifyRefreshToken(incomingRefreshToken);
    const user = await User.findById(decoded.sub).select("+refreshTokens");

    if (!user) return;

    if (user.refreshTokens) {
      user.refreshTokens = user.refreshTokens.filter(t => t !== incomingRefreshToken);
      await user.save();
    }
  } catch (error) {
    logger.error("Error during logout token processing: %s", (error as Error).message);
    // If verification fails (e.g. expired), we could try decoding 
    // just to find the user and remove the token string if it exists in DB.
    // But if it's expired/invalid, it won't be accepted for refresh anyway.
    // So we can safely ignore errors here.
    return;
  }
}

export const getMe = async (userId: string) => {
  const user = await User.findById(userId)
  if (!user) throw new ResponseError(404, "User not found")
  return user
}

export const updateProfile = async (userId: string, updateData: UpdateProfileDTO) => {

  const payload = validate<UpdateProfileDTO>(updateProfileSchema, updateData)

  const user = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  })

  if (!user) throw new ResponseError(404, "User not found")
  return user
}

export const changePassword = async (userId: string, data: ChangePasswordDTO) => {
  const payload = validate<ChangePasswordDTO>(changePasswordSchema, data)

  const user = await User.findById(userId).select("+password")
  if (!user) throw new ResponseError(404, "User not found")

  const isMatch = await comparePassword(payload.oldPassword, user.password!)
  if (!isMatch) throw new ResponseError(400, "Invalid old password")

  user.password = await hashPassword(payload.newPassword)
  await user.save()

  return { message: "Password changed successfully" }
}
