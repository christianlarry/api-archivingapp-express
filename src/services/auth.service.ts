import { IUser, User } from "../models/user.model"
import { hashPassword, comparePassword } from "../utils/password"
import { generateToken } from "../utils/jwt"
import { ResponseError } from "@/errors/ResponseError"
import { ChangePasswordDTO, LoginDTO, RegisterDTO, UpdateProfileDTO, UserPublic } from "@/types/auth.types"

const toPublic = (user: IUser): UserPublic => {
  const obj = user.toObject()
  delete obj.password
  return obj as UserPublic
}

export const register = async (userData: RegisterDTO) => {
  const existingUser = await User.findOne({ email: userData.email })
  if (existingUser) {
    throw new ResponseError(400, "Email already exists")
  }

  const hashedPassword = await hashPassword(userData.password)
  const user = await User.create({
    ...userData,
    password: hashedPassword,
  })

  // Return user without password
  const userJson = toPublic(user)
  
  return userJson
}

export const login = async (loginData: LoginDTO) => {
  const user = await User.findOne({ email: loginData.email }).select("+password")
  
  if (!user || !(await comparePassword(loginData.password, user.password!))) {
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
  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  })
  if (!user) throw new ResponseError(404, "User not found")
  return user
}

export const changePassword = async (userId: string, data: ChangePasswordDTO) => {
  const user = await User.findById(userId).select("+password")
  if (!user) throw new ResponseError(404, "User not found")

  const isMatch = await comparePassword(data.oldPassword, user.password!)
  if (!isMatch) throw new ResponseError(400, "Invalid old password")

  user.password = await hashPassword(data.newPassword)
  await user.save()
  
  return { message: "Password changed successfully" }
}
