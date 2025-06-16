"use server"

import { put, del } from "@vercel/blob"
import { imageUploadSchema } from "@/validasi/validasi"

// Fungsi untuk mengunggah gambar
export async function uploadImage(formData: FormData) {
  try { 
    const file = formData.get("file") as File  // Mendapatkan file dari FormData

    if (!file) {
      return { error: "Tidak ada file yang diberikan" }  // Jika file tidak ada
    }

    // Validasi file berdasarkan skema yang telah ditentukan
    const validation = imageUploadSchema.safeParse({ file })
    if (!validation.success) {
      return { error: validation.error.errors[0].message }  // Menampilkan pesan error jika validasi gagal
    }

    // Membuat nama file yang unik
    const timestamp = Date.now()  // Mendapatkan timestamp saat ini
    const randomString = Math.random().toString(36).substring(2, 15)  // Membuat string acak
    const fileExtension = file.name.split(".").pop()  // Mendapatkan ekstensi file
    const filename = `fruits/${timestamp}-${randomString}.${fileExtension}`  // Menyusun nama file unik

    // Mengunggah file ke Vercel Blob dengan akses publik
    const blob = await put(filename, file, {
      access: "public",  // Menentukan akses publik untuk file
    })

    // Mengembalikan hasil dengan URL dan nama file
    return {
      success: true,
      data: {
        url: blob.url,  // URL file yang telah diunggah
        filename: filename,  // Nama file yang digunakan
      },
    }
  } catch (error) {
    console.error("Gagal mengunggah gambar:", error)  // Menampilkan pesan error jika terjadi kesalahan
    return { error: "Gagal mengunggah gambar" }
  }
}

// Fungsi untuk menghapus gambar berdasarkan URL
export async function deleteImage(url: string) {
  try {
    await del(url)  // Menghapus file menggunakan URL
    return { success: true }  // Mengembalikan status sukses
  } catch (error) {
    console.error("Gagal menghapus gambar:", error)  // Menampilkan pesan error jika terjadi kesalahan
    return { error: "Gagal menghapus gambar" }
  }
}