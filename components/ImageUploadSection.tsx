"use client"

import Image from "next/image"
import { type Dispatch, type SetStateAction } from "react"

interface ImageUploadSectionProps {
  label: string
  images: File[]
  setImages: (images: File[] | ((prev: File[]) => File[])) => void
  previewUrls: string[]
  setPreviewUrls: (urls: string[] | ((prev: string[]) => string[])) => void
  uploadError: string
  setUploadError: (error: string) => void
}

export function ImageUploadSection({
  label,
  images = [],
  setImages,
  previewUrls = [],
  setPreviewUrls,
  uploadError = "",
  setUploadError,
}: ImageUploadSectionProps) {
  const handleSingleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (images.length + 1 > 10) {
      setUploadError("Maximum 10 images allowed")
      return
    }

    const newPreviewUrl = URL.createObjectURL(file)
    setPreviewUrls((prev) => [...prev, newPreviewUrl])
    setImages((prev) => [...prev, file])
    setUploadError("")
  }

  const handleMultipleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (images.length + files.length > 10) {
      setUploadError("Maximum 10 images allowed")
      return
    }

    const newPreviewUrls = files.map((file) => URL.createObjectURL(file))
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls])
    setImages((prev) => [...prev, ...files])
    setUploadError("")
  }

  const handleDeleteImage = (index: number) => {
    setPreviewUrls((prev) => {
      const newUrls = prev.filter((_, i) => i !== index)
      URL.revokeObjectURL(prev[index])
      return newUrls
    })
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <label className="block font-medium">
        {label} ({(images || []).length}/10)
      </label>

      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Single Image Upload */}
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">
              Add Single Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleSingleImageChange}
              className="file-input file-input-bordered w-full"
            />
          </div>

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

        {uploadError && (
          <p className="text-red-500 text-sm">{uploadError}</p>
        )}

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
                fill
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