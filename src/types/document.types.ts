export interface DocumentUploadDTO {
  title: string
  description?: string
  category?: string
  tags?: string // Sent as comma-separated string from multipart/form-data
}

export interface DocumentUpdateDTO {
  title?: string
  description?: string
  category?: string
  tags?: string[]
}

export interface DocumentQueryDTO {
  page?: number
  limit?: number
  q?: string
  category?: string
  tags?: string
}
