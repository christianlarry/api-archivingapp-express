type Role = "user" | "admin"

export interface RegisterDTO {
  email: string
  password: string
  fullName: string
  role?: Role
}

export interface LoginDTO {
  email: string
  password: string
}

export type UpdateProfileDTO = Partial<{
  email: string
  fullName: string
  role: Role
  isActive: boolean
}>

export interface ChangePasswordDTO {
  oldPassword: string
  newPassword: string
}

export type UserPublic = {
  _id: string
  email: string
  fullName: string
  role: Role
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}