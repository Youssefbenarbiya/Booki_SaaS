"use client"
import Image from "next/image"
import { useTransition, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { useRouter } from "next/navigation"
import { updateTrip, type TripInput } from "@/actions/tripActions"
import { ImageUploadSection } from "@/components/ImageUploadSection"
import { fileToFormData } from "@/lib/utils"
import { uploadImages } from "@/actions/uploadActions"

interface EditTripFormProps {
  trip: {
    id: number
    name: string
    description: string
    destination: string
    startDate: Date
    endDate: Date
    price: number
    capacity: number
    isAvailable: boolean
    images: Array<{
      id: number
      imageUrl: string
    }>
    activities: Array<{
      id: number
      activityName: string
      description?: string | null
      scheduledDate?: Date | null
    }>
  }
}

export default function EditTripForm({ trip }: EditTripFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Format dates for input fields
  const formatDateForInput = (date: Date) => {
    const d = new Date(date)
    return d.toISOString().split("T")[0]
  }

  // Image states
  const [images, setImages] = useState<File[]>([])
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])
  const [uploadError, setUploadError] = useState<string>("")
  const [existingImages, setExistingImages] = useState<
    Array<{ id: number; imageUrl: string }>
  >(trip.images)

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<TripInput>({
    defaultValues: {
      name: trip.name,
      description: trip.description,
      destination: trip.destination,
      startDate: new Date(trip.startDate),
      endDate: new Date(trip.endDate),
      price: trip.price,
      capacity: trip.capacity,
      isAvailable: trip.isAvailable,
      activities: trip.activities.map((activity) => ({
        activityName: activity.activityName,
        description: activity.description || undefined,
        scheduledDate: activity.scheduledDate || undefined,
      })),
    },
  })

  // Handle deletion of existing images
  const handleDeleteExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index))
  }

  async function onSubmit(data: TripInput) {
    try {
      // Get URLs of remaining existing images
      let imageUrls = existingImages.map((img) => img.imageUrl)

      // Upload any new images
      if (images.length > 0) {
        try {
          const newUrls = await Promise.all(
            images.map(async (file) => {
              const formData = await fileToFormData(file)
              return uploadImages(formData)
            })
          )
          imageUrls = [...imageUrls, ...newUrls]
        } catch (error) {
          console.error("Error uploading images:", error)
          setUploadError("Failed to upload images")
          return
        }
      }

      // Update trip with all image URLs
      const formattedData = {
        ...data,
        images: imageUrls,
      }

      await updateTrip(trip.id, formattedData)
      router.push("/agency/dashboard/trips")
      router.refresh()
    } catch (error) {
      console.error("Error updating trip:", error)
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
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <input
                  type="date"
                  value={formatDateForInput(new Date(field.value))}
                  onChange={(e) => field.onChange(new Date(e.target.value))}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                />
              )}
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
            <Controller
              name="endDate"
              control={control}
              render={({ field }) => (
                <input
                  type="date"
                  value={formatDateForInput(new Date(field.value))}
                  onChange={(e) => field.onChange(new Date(e.target.value))}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                />
              )}
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
        <div className="space-y-6">
          {/* Display existing images */}
          {existingImages.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Current Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {existingImages.map((img, index) => (
                  <div
                    key={`existing-${img.id}`}
                    className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden"
                  >
                    <Image
                      src={img.imageUrl}
                      alt={`Trip image ${index + 1}`}
                      className="object-cover"
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteExistingImage(index)}
                      className="absolute top-2 right-2 bg-white bg-opacity-75 p-1 rounded-md hover:bg-red-100 transition-colors"
                      aria-label="Delete image"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-red-600"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload new images section */}
          <ImageUploadSection
            label="Add New Images"
            images={images}
            setImages={setImages}
            previewUrls={newImagePreviews}
            setPreviewUrls={setNewImagePreviews}
            uploadError={uploadError}
            setUploadError={setUploadError}
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={isPending}
          >
            {isPending ? "Updating..." : "Update Trip"}
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
