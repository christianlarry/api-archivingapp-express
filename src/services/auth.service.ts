import { IUser, User } from "../models/user.model"
import { hashPassword, comparePassword } from "../utils/password"
import { generateToken } from "../utils/jwt"
import { ResponseError } from "@/errors/ResponseError"
import { ChangePasswordDTO, LoginDTO, RegisterDTO, UpdateProfileDTO, UserPublic } from "@/types/auth.types"
import { validate } from "@/validations/validate"
import { changePasswordSchema, loginSchema, registerSchema, updateProfileSchema } from "@/validations/auth.validation"

const toPublic = (user: IUser): UserPublic => {
  const obj = user.toObject()
  delete obj.password
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

  const user = await User.findOne({ email: payload.email }).select("+password")

  if (!user || !(await comparePassword(payload.password, user.password!))) {
    throw new ResponseError(401, "Invalid credentials")
  }

  const token = generateToken(user)

  const userJson = toPublic(user)

  return { user: userJson, token }
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
