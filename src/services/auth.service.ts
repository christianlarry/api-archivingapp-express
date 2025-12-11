import { User } from "../models/user.model"
import { AppError } from "../errors/AppError"
import { hashPassword, comparePassword } from "../utils/password"
import { generateToken } from "../utils/jwt"

export const register = async (userData: any) => {
  const existingUser = await User.findOne({ email: userData.email })
  if (existingUser) {
    throw new AppError("Email already exists", 400)
  }

  const hashedPassword = await hashPassword(userData.password)
  const user = await User.create({
    ...userData,
    password: hashedPassword,
  })

  // Return user without password
  const userJson = user.toObject()
  delete userJson.password
  
  return userJson
}

export const login = async (loginData: any) => {
  const user = await User.findOne({ email: loginData.email }).select("+password")
  
  if (!user || !(await comparePassword(loginData.password, user.password!))) {
    throw new AppError("Invalid credentials", 401)
  }

  const token = generateToken(user)
  
  const userJson = user.toObject()
  delete userJson.password

  return { user: userJson, token }
}

export const getMe = async (userId: string) => {
  const user = await User.findById(userId)
  if (!user) throw new AppError("User not found", 404)
  return user
}

export const updateProfile = async (userId: string, updateData: any) => {
  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  })
  if (!user) throw new AppError("User not found", 404)
  return user
}

export const changePassword = async (userId: string, data: any) => {
  const user = await User.findById(userId).select("+password")
  if (!user) throw new AppError("User not found", 404)

  const isMatch = await comparePassword(data.oldPassword, user.password!)
  if (!isMatch) throw new AppError("Invalid old password", 400)

  user.password = await hashPassword(data.newPassword)
  await user.save()
  
  return { message: "Password changed successfully" }
}
