import { z } from "zod"

export const createFruitSchema = z.object({
  name: z.string().min(1, "Fruit name is required"),
  price: z.number().positive("Price must be positive"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  image: z.string().url("Invalid image URL").optional(),
})

export const updateFruitSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Fruit name is required").optional(),
  price: z.number().positive("Price must be positive").optional(),
  stock: z.number().int().min(0, "Stock cannot be negative").optional(),
  image: z.string().url("Invalid image URL").optional(),
})

// New schema for image upload
export const imageUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 5 * 1024 * 1024, // 5MB limit
      "File size must be less than 5MB",
    )
    .refine(
      (file) => ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type),
      "File must be a valid image (JPEG, PNG, or WebP)",
    ),
})

export const createCustomerSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  email: z.string().email("Invalid email format").optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  userId: z.string(),
})

export const updateCustomerSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Customer name is required").optional(),
  email: z.string().email("Invalid email format").optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
})

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>
export type CreateFruitInput = z.infer<typeof createFruitSchema>
export type UpdateFruitInput = z.infer<typeof updateFruitSchema>
export type ImageUploadInput = z.infer<typeof imageUploadSchema>