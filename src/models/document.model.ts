import mongoose, { Schema, Document } from "mongoose"

export interface IDocument extends Document {
  title: string
  description?: string
  originalName: string
  storagePath: string
  mimeType: string
  size: number
  category?: string
  tags?: string[]
  uploadedBy: mongoose.Types.ObjectId
  isEncrypted: boolean
  createdAt: Date
  updatedAt: Date
  toPublic: () => unknown
}

const DocumentSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    originalName: {
      type: String,
      required: true,
    },
    storagePath: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      index: true,
    },
    tags: [
      {
        type: String,
        index: true,
      },
    ],
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isEncrypted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for search
DocumentSchema.index({ title: "text", description: "text" })

DocumentSchema.methods.toPublic = function () {
  const obj = this.toObject()
  // Transform _id to id if needed, or keep _id.
  // The openapi spec uses `id` but mongo returns `_id`. 
  // Often APIs transform it. Let's stick to standard mongo for now unless specified otherwise in utils.
  // But typically frontend wants `id` or `_id`. I'll return as is for now or use a global transformer if available.
  return obj
}

export const DocumentModel = mongoose.model<IDocument>("Document", DocumentSchema)
