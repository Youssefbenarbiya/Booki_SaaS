"use client"
import Image from "next/image"
import { useTransition, useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { useRouter } from "next/navigation"
import { ImageUploadSection } from "@/components/ImageUploadSection"
import { fileToFormData } from "@/lib/utils"
import { uploadImages } from "@/actions/uploadActions"
import { TripInput, updateTrip } from "@/actions/trips/tripActions"

interface EditTripFormProps {
  trip: {
    id: number
    name: string
    description: string
    destination: string
    startDate: Date
    endDate: Date
    originalPrice: number
    discountPercentage?: number
    priceAfterDiscount?: number
    capacity: number
    isAvailable: boolean
    images: Array<{
      id: number
      imageUrl: string
    }>
    activities: Array<{
      id: number
      activityName: string
      description: string
      scheduledDate: Date | null
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
    watch,
    setValue,
    reset,
  } = useForm<ExtendedTripInput>({
    defaultValues: {
      name: trip.name,
      description: trip.description,
      destination: trip.destination,
      startDate: new Date(trip.startDate),
      endDate: new Date(trip.endDate),
      originalPrice: trip.originalPrice,
      discountPercentage: trip.discountPercentage,
      priceAfterDiscount: trip.priceAfterDiscount,
      capacity: trip.capacity,
      isAvailable: trip.isAvailable,
      activities: trip.activities.map((activity) => ({
        activityName: activity.activityName,
        description: activity.description || undefined,
        scheduledDate: activity.scheduledDate || undefined,
      })),
    },
  })

  // Watch original price to update discount calculations
  const watchedOriginalPrice = watch("originalPrice")

  // Initialize form with correct values when component mounts
  useEffect(() => {
    // Reset form with trip data
    reset({
      name: trip.name,
      description: trip.description,
      destination: trip.destination,
      startDate: new Date(trip.startDate),
      endDate: new Date(trip.endDate),
      originalPrice: trip.originalPrice,
      discountPercentage: trip.discountPercentage,
      priceAfterDiscount: trip.priceAfterDiscount,
      capacity: trip.capacity,
      isAvailable: trip.isAvailable,
      activities: trip.activities.map((activity) => ({
        activityName: activity.activityName,
        description: activity.description || undefined,
        scheduledDate: activity.scheduledDate || undefined,
      })),
    })

    // Set UI state based on trip data
    if (hasExistingDiscount) {
      setHasDiscount(true)
      setDiscountPercentage(trip.discountPercentage || 0)
      setOriginalPrice(trip.originalPrice)
      setPriceAfterDiscount(trip.priceAfterDiscount || trip.originalPrice)

      // Check if the discount percentage is one of our preset values
      setCustomPercentage(![10, 20, 30].includes(trip.discountPercentage || 0))
    } else {
      // No discount case
      setHasDiscount(false)
      setDiscountPercentage(0)
      setOriginalPrice(trip.originalPrice)
      setPriceAfterDiscount(trip.originalPrice)
    }
  }, [trip, hasExistingDiscount, reset])

  // Update original price when price changes
  useEffect(() => {
    if (watchedOriginalPrice) {
      const price = Number(watchedOriginalPrice)
      setOriginalPrice(price)
      if (hasDiscount && discountPercentage) {
        calculatePriceAfterDiscount(price, discountPercentage)
      } else {
        setPriceAfterDiscount(price)
      }
    }
  }, [watchedOriginalPrice, discountPercentage, hasDiscount])

  // Calculate price after discount
  const calculatePriceAfterDiscount = (price: number, percentage: number) => {
    if (!price || !percentage) {
      setPriceAfterDiscount(price || 0)
      setValue("priceAfterDiscount", undefined)
      return price || 0
    }

    const calculatedPrice = price - price * (percentage / 100)
    const roundedPrice = Math.round(calculatedPrice * 100) / 100 // Round to 2 decimal places
    setPriceAfterDiscount(roundedPrice)
    setValue("priceAfterDiscount", roundedPrice)
    return roundedPrice
  }

  // Apply percentage discount
  const applyPercentageDiscount = (percentage: number) => {
    setDiscountPercentage(percentage)
    setValue("discountPercentage", percentage)

    const price = Number(watchedOriginalPrice) || 0
    calculatePriceAfterDiscount(price, percentage)
  }

  // Handle deletion of existing images
  const handleDeleteExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index))
  }

  async function onSubmit(data: ExtendedTripInput) {
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
            }),
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
            <div className="space-y-4">
              {/* Display existing images */}
              {existingImages.length > 0 && (
                <div className="space-y-3">
                  <Label>Current Images</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {existingImages.map((img, index) => (
                      <div
                        key={`existing-${img.id}`}
                        className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden"
                      >
                        <Image
                          src={img.imageUrl || "/placeholder.svg"}
                          alt={`Trip image ${index + 1}`}
                          className="object-cover"
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6"
                          onClick={() => handleDeleteExistingImage(index)}
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
                          >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload new images section */}
              <div className="border border-dashed rounded-md p-4">
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