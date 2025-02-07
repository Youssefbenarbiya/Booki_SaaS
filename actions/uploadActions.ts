"use server"

import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

export async function uploadImages(formData: FormData) {
  try {
    // Ensure uploads directory exists
    const uploadDir = join(process.cwd(), "public", "uploads")
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // Directory might already exist, ignore error
    }

    const file = formData.get("file") as File
    if (!file) {
      throw new Error("No file provided")
    }

    try {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Create a unique filename
      const uniqueFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '-')}`
      const path = join(uploadDir, uniqueFilename)

      // Write the file
      await writeFile(path, buffer)
      
      // Return the path that will be stored in the database
      return `/uploads/${uniqueFilename}`
    } catch (error) {
      console.error("Error uploading file:", error)
      throw error
    }
  } catch (error) {
    console.error("Error in uploadImages:", error)
    throw new Error("Failed to upload images")
  }
} 