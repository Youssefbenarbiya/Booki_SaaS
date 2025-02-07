// app/dashboard/flights/[flightId]/edit/EditFlightForm.tsx
"use client"

import { useTransition, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { flightSchema, FlightInput } from "@/lib/validations/flightSchema"
import { useRouter } from "next/navigation"
import { updateFlight } from "@/actions/flightActions"
import { uploadFiles } from "@/lib/uploadFiles"
import Image from "next/image"

interface EditFlightFormProps {
  flight: FlightInput & { id: string; images: string[] }
}

export default function EditFlightForm({ flight }: EditFlightFormProps) {
  const router = useRouter()
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>(flight.images || [])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [uploadError, setUploadError] = useState<string>("")

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FlightInput>({
    resolver: zodResolver(flightSchema),
    defaultValues: {
      ...flight,
      departureTime: new Date(flight.departureTime),
      arrivalTime: new Date(flight.arrivalTime),
    },
  })

  const [isPending, startTransition] = useTransition()

  const handleSingleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (existingImages.length + selectedImages.length + 1 > 10) {
      setUploadError("Maximum 10 images allowed in total")
      return
    }

    // Create preview URL for single image
    const newPreviewUrl = URL.createObjectURL(file)
    setPreviewUrls((prev) => [...prev, newPreviewUrl])
    setSelectedImages((prev) => [...prev, file])
    setUploadError("")
  }

  const handleMultipleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (existingImages.length + selectedImages.length + files.length > 10) {
      setUploadError("Maximum 10 images allowed in total")
      return
    }

    // Create preview URLs for multiple images
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file))
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls])
    setSelectedImages((prev) => [...prev, ...files])
    setUploadError("")
  }

  const handleDeleteExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleDeleteNewImage = (index: number) => {
    setPreviewUrls((prev) => {
      const newUrls = prev.filter((_, i) => i !== index)
      URL.revokeObjectURL(prev[index])
      return newUrls
    })
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
  }

  async function onSubmit(data: FlightInput) {
    try {
      let newImageUrls: string[] = []

      if (selectedImages.length > 0) {
        newImageUrls = await uploadFiles(selectedImages)
      }

      // Combine existing and new images
      const allImages = [...existingImages, ...newImageUrls]

      // Convert string dates to Date objects
      const formattedData = {
        ...data,
        departureTime: new Date(data.departureTime),
        arrivalTime: new Date(data.arrivalTime),
        images: allImages,
      }

      await updateFlight(flight.id, formattedData)
      router.push("/admin/dashboard/flights")
      router.refresh()
    } catch (error) {
      console.error("Error updating flight:", error)
      setUploadError("Failed to update flight")
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Flight</h1>
      <form
        onSubmit={handleSubmit((data) => startTransition(() => onSubmit(data)))}
        className="space-y-4"
      >
        {/* Existing form fields */}
        <div>
          <label className="block font-medium">Flight Number</label>
          <input
            type="text"
            {...register("flightNumber")}
            className="input input-bordered w-full"
          />
          {errors.flightNumber && (
            <p className="text-red-500">{errors.flightNumber.message}</p>
          )}
        </div>
        <div>
          <label className="block font-medium">Departure Time</label>
          <input
            type="datetime-local"
            {...register("departureTime")}
            className="input input-bordered w-full"
          />
          {errors.departureTime && (
            <p className="text-red-500">{errors.departureTime.message}</p>
          )}
        </div>
        <div>
          <label className="block font-medium">Arrival Time</label>
          <input
            type="datetime-local"
            {...register("arrivalTime")}
            className="input input-bordered w-full"
          />
          {errors.arrivalTime && (
            <p className="text-red-500">{errors.arrivalTime.message}</p>
          )}
        </div>
        <div>
          <label className="block font-medium">Price</label>
          <input
            type="number"
            step="0.01"
            {...register("price", { valueAsNumber: true })}
            className="input input-bordered w-full"
          />
          {errors.price && (
            <p className="text-red-500">{errors.price.message}</p>
          )}
        </div>
        <div>
          <label className="block font-medium">Available Seats</label>
          <input
            type="number"
            {...register("availableSeats", { valueAsNumber: true })}
            className="input input-bordered w-full"
          />
          {errors.availableSeats && (
            <p className="text-red-500">{errors.availableSeats.message}</p>
          )}
        </div>

        {/* Updated Images Section */}
        <div className="space-y-4">
          <label className="block font-medium">
            Flight Images ({existingImages.length + selectedImages.length}/10)
          </label>
          
          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium mb-2">Current Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {existingImages.map((image, index) => (
                  <div key={`existing-${index}`} className="relative aspect-video">
                    <Image
                      src={image}
                      alt={`Existing flight image ${index + 1}`}
                      fill
                      className="object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteExistingImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
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
            </div>
          )}

          {/* New Images Input Section */}
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
              {10 - (existingImages.length + selectedImages.length)} slots remaining
            </p>
          </div>

          {/* New Image Previews */}
          {previewUrls.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">New Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {previewUrls.map((url, index) => (
                  <div key={`preview-${index}`} className="relative aspect-video">
                    <Image
                      src={url}
                      alt={`New image preview ${index + 1}`}
                      fill
                      className="object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteNewImage(index)}
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
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button type="submit" className="btn btn-primary" disabled={isPending}>
            {isPending ? "Updating..." : "Update Flight"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
