"use server"

import { prisma } from "@/db/prisma"
import {
  createFruitSchema,
  updateFruitSchema,
  type CreateFruitInput,
  type UpdateFruitInput,
} from "@/validasi/validasi"
import { deleteImage } from "@/actions/image-action"
import { revalidatePath } from "next/cache"

// Fungsi untuk membuat data buah baru
export async function createFruit(data: CreateFruitInput) {
  try {
    // Memvalidasi data yang diterima
    const validatedData = createFruitSchema.parse(data)

    // Menyimpan data buah baru ke dalam database
    const fruit = await prisma.fruit.create({
      data: validatedData,
    })

    // Revalidasi path agar halaman terkait di-refresh
    revalidatePath("dashboard/buah")
    revalidatePath("/dashboard")
    return { success: true, data: fruit }
  } catch (error) {
    console.error("Error creating fruit:", error)
    return { error: "Gagal membuat buah" }
  }
}

// Fungsi untuk memperbarui data buah
export async function updateFruit(data: UpdateFruitInput) {
  try {
    // Memvalidasi data yang diterima
    const validatedData = updateFruitSchema.parse(data)
    const { id, ...updateData } = validatedData

    // Mendapatkan data buah yang ada untuk memeriksa jika ada perubahan gambar
    const currentFruit = await prisma.fruit.findUnique({
      where: { id },
      select: { image: true },
    })

    // Jika gambar berubah dan ada gambar lama, hapus gambar lama
    if (currentFruit?.image && updateData.image !== currentFruit.image) {
      try {
        await deleteImage(currentFruit.image)
      } catch (error) {
        console.warn("Gagal menghapus gambar lama:", error)
      }
    }

    // Memperbarui data buah dalam database
    const fruit = await prisma.fruit.update({
      where: { id },
      data: updateData,
    })

    // Revalidasi path agar halaman terkait di-refresh
    revalidatePath("dashboard/buah")
    revalidatePath("/dashboard")
    return { success: true, data: fruit }
  } catch (error) {
    console.error("Error updating fruit:", error)
    return { error: "Gagal memperbarui buah" }
  }
}

// Fungsi untuk menghapus buah berdasarkan ID
export async function deleteFruit(id: string) {
  try {
    // Mendapatkan data buah untuk memeriksa jika ada gambar
    const fruit = await prisma.fruit.findUnique({
      where: { id },
      select: { image: true },
    })

    // Memeriksa apakah buah digunakan dalam pesanan
    const orderItemCount = await prisma.orderItem.count({
      where: { fruitId: id },
    })

    // Jika buah sudah dipesan, tidak dapat dihapus
    if (orderItemCount > 0) {
      return { error: "Tidak dapat menghapus buah yang sudah dipesan" }
    }

    // Menghapus data buah dari database
    await prisma.fruit.delete({
      where: { id },
    })

    // Menghapus gambar jika ada
    if (fruit?.image) {
      try {
        await deleteImage(fruit.image)
      } catch (error) {
        console.warn("Gagal menghapus gambar buah:", error)
      }
    }

    // Revalidasi path agar halaman terkait di-refresh
    revalidatePath("/buah")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Error deleting fruit:", error)
    return { error: "Gagal menghapus buah" }
  }
}


// Fungsi untuk mendapatkan semua data buah
export async function getFruits() {
  try {
    const fruits = await prisma.fruit.findMany({
      include: {
        _count: {
          select: {
            orderItems: true,
            stockHistory: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return { success: true, data: fruits }
  } catch (error) {
    console.error("Error fetching fruits:", error)
    return { error: "Gagal mengambil buah" }
  }
}

// Fungsi untuk mendapatkan data buah berdasarkan ID
export async function getFruitById(id: string) {
  try {
    const fruit = await prisma.fruit.findUnique({
      where: { id },
      include: {
        stockHistory: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            user: {
              select: { name: true },
            },
          },
        },
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
    })

    if (!fruit) {
      return { error: "Buah tidak ditemukan" }
    }

    return { success: true, data: fruit }
  } catch (error) {
    console.error("Error fetching fruit:", error)
    return { error: "Gagal mengambil data buah" }
  }
}

// Fungsi untuk mendapatkan buah yang tersedia di stok
export async function getFruitsInStock() {
  try {
    const fruits = await prisma.fruit.findMany({
      where: {
        stock: {
          gt: 0,
        },
      },
      orderBy: { name: "asc" },
    })

    return { success: true, data: fruits }
  } catch (error) {
    console.error("Error fetching fruits in stock:", error)
    return { error: "Gagal mengambil buah yang ada di stok" }
  }
}

// Fungsi untuk mendapatkan statistik buah
export async function getFruitStats() {
  try {
    const [totalFruits, inStockFruits, lowStockFruits, outOfStockFruits, totalValue] = await Promise.all([
      prisma.fruit.count(),
      prisma.fruit.count({
        where: {
          stock: {
            gt: 0,
          },
        },
      }),
      prisma.fruit.count({
        where: {
          stock: {
            gt: 0,
            lte: 10,
          },
        },
      }),
      prisma.fruit.count({
        where: {
          stock: 0,
        },
      }),
      prisma.fruit.aggregate({
        _sum: {
          stock: true,
        },
        _avg: {
          price: true,
        },
      }),
    ])

    return {
      success: true,
      data: {
        totalFruits,
        inStockFruits,
        lowStockFruits,
        outOfStockFruits,
        totalStock: totalValue._sum.stock || 0,
        averagePrice: totalValue._avg.price || 0,
      },
    }
  } catch (error) {
    console.error("Error fetching fruit stats:", error)
    return { error: "Gagal mengambil statistik buah" }
  }
}