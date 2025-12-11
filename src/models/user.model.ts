import mongoose, { Schema, Document } from "mongoose"

export interface IUser extends Document {
  email: string
  password?: string
  fullName: string
  role: "user" | "admin"
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // Don't return password by default
    },
    fullName: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "users"
  }
)

export const User = mongoose.model<IUser>("User", UserSchema)
