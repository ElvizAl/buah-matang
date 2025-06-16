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

export const fruitSearchSchema = z.object({
  query: z.string().optional(),
  sortBy: z.enum(["name", "price", "stock", "createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  inStock: z.boolean().optional(),
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

export type CreateFruitInput = z.infer<typeof createFruitSchema>
export type UpdateFruitInput = z.infer<typeof updateFruitSchema>
export type FruitSearchInput = z.infer<typeof fruitSearchSchema>
export type ImageUploadInput = z.infer<typeof imageUploadSchema>