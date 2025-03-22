"use server"

import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

export async function uploadImages(formData: FormData) {
  try {
    // Ensure uploads directory exists
    const uploadDir = join(process.cwd(), "public", "uploads")
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch {
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
      const uniqueFilename = `${Date.now()}-${file.name.replace(
        /[^a-zA-Z0-9.-]/g,
        "-"
      )}`
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
// "use server"

// import { v2 as cloudinary } from "cloudinary"

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// })

// export async function uploadImages(formData: FormData) {
//   try {
//     const file = formData.get("file") as File
//     if (!file) {
//       throw new Error("No file provided")
//     }

//     // Convert file to buffer
//     const bytes = await file.arrayBuffer()
//     const buffer = Buffer.from(bytes)

//     // Upload to Cloudinary using a stream
//     return new Promise<string>((resolve, reject) => {
//       const uploadStream = cloudinary.uploader.upload_stream(
//         { folder: "uploads" }, // Optional: specify a folder in your Cloudinary account
//         (error, result) => {
//           if (error) {
//             console.error("Cloudinary upload error:", error)
//             return reject(error)
//           }
//           // Return the secure URL of the uploaded image
//           resolve(result?.secure_url as string)
//         }
//       )

//       // Pipe the buffer into the Cloudinary upload stream
//       uploadStream.end(buffer)
//     })
//   } catch (error) {
//     console.error("Error in uploadImages:", error)
//     throw new Error("Failed to upload image")
//   }
// }
