"use client"

import { useTransition, useState } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { createTrip, type TripInput } from "@/actions/tripActions"
import { ImageUploadSection } from "@/components/ImageUploadSection"
import { fileToFormData } from "@/lib/utils"
import { uploadImages } from "@/actions/uploadActions"

export default function NewTripForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Image states
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [uploadError, setUploadError] = useState<string>("")

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TripInput>({
    defaultValues: {
      isAvailable: true,
      activities: [],
    },
  })

  async function onSubmit(data: TripInput) {
    try {
      // Upload images first
      let imageUrls: string[] = []
      if (images.length > 0) {
        try {
          imageUrls = await Promise.all(
            images.map(async (file) => {
              const formData = await fileToFormData(file)
              return uploadImages(formData)
            })
          )
        } catch (error) {
          console.error("Error uploading images:", error)
          setUploadError("Failed to upload images")
          return
        }
      }

      // Create trip with image URLs
      const formattedData = {
        ...data,
        images: imageUrls,
      }

      await createTrip(formattedData)
      router.push("/agency/dashboard/trips")
      router.refresh()
    } catch (error) {
      console.error("Error creating trip:", error)
    }
  }

  return (
    <div className="max-w-3xl mx-auto my-8 px-4">
      <form
        onSubmit={handleSubmit((data) => startTransition(() => onSubmit(data)))}
        className="bg-white p-6 rounded-lg shadow-md space-y-6"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Trip Name
            </label>
            <input
              type="text"
              {...register("name")}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Destination
            </label>
            <input
              type="text"
              {...register("destination")}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            />
            {errors.destination && (
              <p className="mt-1 text-xs text-red-500">
                {errors.destination.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              {...register("startDate")}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            />
            {errors.startDate && (
              <p className="mt-1 text-xs text-red-500">
                {errors.startDate.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              {...register("endDate")}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            />
            {errors.endDate && (
              <p className="mt-1 text-xs text-red-500">
                {errors.endDate.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Price
            </label>
            <input
              type="number"
              step="0.01"
              {...register("price")}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            />
            {errors.price && (
              <p className="mt-1 text-xs text-red-500">
                {errors.price.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Capacity
            </label>
            <input
              type="number"
              {...register("capacity")}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            />
            {errors.capacity && (
              <p className="mt-1 text-xs text-red-500">
                {errors.capacity.message}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register("description")}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              rows={3}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <input
                type="checkbox"
                {...register("isAvailable")}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Available for Booking</span>
            </label>
          </div>
        </div>

        {/* Trip Images */}
        <ImageUploadSection
          label="Trip Images"
          images={images}
          setImages={setImages}
          previewUrls={imagePreviews}
          setPreviewUrls={setImagePreviews}
          uploadError={uploadError}
          setUploadError={setUploadError}
        />

        <div className="flex gap-4">
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={isPending}
          >
            {isPending ? "Creating..." : "Create Trip"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
