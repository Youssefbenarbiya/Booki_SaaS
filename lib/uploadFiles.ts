import { uploadImages } from "@/actions/uploadActions"
import { fileToFormData } from "@/lib/utils"

export async function uploadFiles(files: File[]) {
  if (!files.length) return []
  
  try {
    const uploadPromises = files.map(async (file) => {
      const formData = await fileToFormData(file)
      return uploadImages(formData)
    })

    const paths = await Promise.all(uploadPromises)
    return paths
  } catch (error) {
    console.error("Error uploading files:", error)
    throw error
  }
} 