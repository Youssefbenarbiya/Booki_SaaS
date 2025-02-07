"use server"

import { writeFile } from "fs/promises"
import path from "path"
import { revalidatePath } from "next/cache"
//import { v2 as cloudinary } from "cloudinary" // ONLY if using Cloudinary
import { authClient } from "@/auth-client" 

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpeg"]
const UPLOAD_DIRECTORY = "/uploads" 

async function uploadImage(file: File): Promise<string> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File size exceeds 2MB limit")
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Invalid file type (only JPG/PNG/WEBP allowed)")
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const filename = `${Date.now()}_${file.name.replace(/\s/g, "_")}`

  let imageUrl: string

  // Option 1: Local Storage (ONLY FOR DEVELOPMENT - NOT PRODUCTION)
  try {
    await writeFile(
      path.join(process.cwd(), "public" + UPLOAD_DIRECTORY + "/" + filename),
      buffer
    )
    imageUrl = `${UPLOAD_DIRECTORY}/${filename}`
  } catch (localErr) {
    console.error("Local file save error:", localErr)
    throw new Error("Failed to save image locally.")
  }

  // Option 2: Cloudinary (PRODUCTION - Recommended)
  /*
  try {
      const result = await cloudinary.uploader.upload(buffer, {
          folder: "user-uploads",  // Customize your folder
      });
      imageUrl = result.secure_url;
  } catch (cloudinaryErr: any) {
      console.error("Cloudinary upload error:", cloudinaryErr);
      throw new Error(cloudinaryErr.message || "Cloudinary upload failed.");
  }
  */
  return imageUrl
}

export async function handleImageUpload(formData: FormData): Promise<string> {
  try {
    const file = formData.get("file") as File | null

    if (!file) {
      throw new Error("No file received")
    }

    const imageUrl = await uploadImage(file)

    try {
      await authClient.updateUser({ image: imageUrl })
      revalidatePath("/profile")
      return imageUrl
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (updateErr: any) {
      console.error("Database update error:", updateErr)
      throw new Error("Failed to update profile in database.")
    }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (uploadError: any) {
    console.error("Image upload error:", uploadError)
    throw new Error(uploadError.message || "Image upload failed.")
  }
}
