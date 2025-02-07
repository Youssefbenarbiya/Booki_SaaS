"use client"

import { useTransition, useState } from "react"
import { useForm } from "react-hook-form"
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

  // Image states
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>(
    trip.images.map((img) => img.imageUrl)
  )
  const [uploadError, setUploadError] = useState<string>("")

  const {
    register,
    handleSubmit,
    formState: { errors },
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
      activities: trip.activities.map(activity => ({
        activityName: activity.activityName,
        description: activity.description || undefined,
        scheduledDate: activity.scheduledDate || undefined,
      })),
    },
  })

  async function onSubmit(data: TripInput) {
    try {
      // Handle existing and new images
      let imageUrls = trip.images.map((img) => img.imageUrl)
      
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
      router.push("/admin/dashboard/trips")
      router.refresh()
    } catch (error) {
      console.error("Error updating trip:", error)
    }
  }

  return (
    <form onSubmit={handleSubmit((data) => startTransition(() => onSubmit(data)))} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block font-medium">Trip Name</label>
          <input
            type="text"
            {...register("name")}
            className="input input-bordered w-full"
          />
          {errors.name && (
            <p className="text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block font-medium">Destination</label>
          <input
            type="text"
            {...register("destination")}
            className="input input-bordered w-full"
          />
          {errors.destination && (
            <p className="text-red-500">{errors.destination.message}</p>
          )}
        </div>

        <div>
          <label className="block font-medium">Start Date</label>
          <input
            type="date"
            {...register("startDate")}
            className="input input-bordered w-full"
          />
          {errors.startDate && (
            <p className="text-red-500">{errors.startDate.message}</p>
          )}
        </div>

        <div>
          <label className="block font-medium">End Date</label>
          <input
            type="date"
            {...register("endDate")}
            className="input input-bordered w-full"
          />
          {errors.endDate && (
            <p className="text-red-500">{errors.endDate.message}</p>
          )}
        </div>

        <div>
          <label className="block font-medium">Price</label>
          <input
            type="number"
            step="0.01"
            {...register("price")}
            className="input input-bordered w-full"
          />
          {errors.price && (
            <p className="text-red-500">{errors.price.message}</p>
          )}
        </div>

        <div>
          <label className="block font-medium">Capacity</label>
          <input
            type="number"
            {...register("capacity")}
            className="input input-bordered w-full"
          />
          {errors.capacity && (
            <p className="text-red-500">{errors.capacity.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block font-medium">Description</label>
          <textarea
            {...register("description")}
            className="textarea textarea-bordered w-full"
            rows={3}
          />
          {errors.description && (
            <p className="text-red-500">{errors.description.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("isAvailable")}
              className="checkbox"
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
          className="btn btn-primary"
          disabled={isPending}
        >
          {isPending ? "Updating..." : "Update Trip"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn btn-outline"
        >
          Cancel
        </button>
      </div>
    </form>
  )
} 