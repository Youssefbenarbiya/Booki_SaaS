"use client"

import Image from "next/image"
import { type Dispatch, type SetStateAction, ChangeEvent } from "react"

interface ImageUploadSectionProps {
  label: string
  images: File[]
  setImages: Dispatch<SetStateAction<File[]>>
  previewUrls: string[]
  setPreviewUrls: Dispatch<SetStateAction<string[]>>
  uploadError: string
  setUploadError: (error: string) => void
  onDeleteImage?: (index: number) => void
}

export function ImageUploadSection({
  label,
  images = [],
  setImages,
  previewUrls = [],
  setPreviewUrls,
  uploadError = "",
  setUploadError,
  onDeleteImage,
}: ImageUploadSectionProps) {
  const MAX_FILE_SIZE = 6 * 1024 * 1024 // 6MB in bytes

  const handleFileValidation = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      setUploadError(`File ${file.name} exceeds 6MB limit`)
      return false
    }
    return true
  }

  const handleMultipleImageChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || [])

    // Validate all files
    const validFiles = files.filter((file) => handleFileValidation(file))
    if (validFiles.length !== files.length) return

    if (images.length + validFiles.length > 10) {
      setUploadError("Maximum 10 images allowed")
      return
    }

    const newPreviewUrls = validFiles.map((file) => URL.createObjectURL(file))
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls])
    setImages((prev) => [...prev, ...validFiles])
    setUploadError("")
  }

  const handleDeleteImage = (index: number) => {
    if (onDeleteImage) {
      onDeleteImage(index)
    } else {
      setPreviewUrls((prev) => {
        const newUrls = prev.filter((_, i) => i !== index)
        URL.revokeObjectURL(prev[index])
        return newUrls
      })
      setImages((prev) => prev.filter((_, i) => i !== index))
    }
  }

  return (
    <div className="space-y-4">
      <label className="block font-medium">
        {label} ({(images || []).length}/10)
      </label>

      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Multiple Images Upload */}
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">
              Add Multiple Images
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleMultipleImageChange}
              className="file-input file-input-bordered w-full"
            />
          </div>
        </div>

        {uploadError && <p className="text-red-500 text-sm">{uploadError}</p>}

        {/* Image Count Warning */}
        <p className="text-sm text-gray-600">
          {10 - (images || []).length} slots remaining
        </p>
      </div>

      {/* Image Previews */}
      {Array.isArray(previewUrls) && previewUrls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative aspect-video">
              <Image
                src={url}
                alt={`Image preview ${index + 1}`}
                width={200}
                height={200}
                className="object-cover rounded-lg"

              />
              <button
                type="button"
                onClick={() => handleDeleteImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                aria-label="Delete image"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
