"use client"

import { useTransition, useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { hotelSchema, type HotelInput } from "@/lib/validations/hotelSchema"
import { useRouter } from "next/navigation"
import { updateHotel } from "@/actions/hotelActions"
import { ImageUploadSection } from "@/components/ImageUploadSection"
import { fileToFormData } from "@/lib/utils"
import { uploadImages } from "@/actions/uploadActions"

interface EditHotelFormProps {
  hotel: {
    id: string
    name: string
    description: string
    address: string
    city: string
    country: string
    rating: number
    amenities: string[]
    images: string[]
    rooms: Array<{
      id: string
      name: string
      description: string
      capacity: number
      pricePerNight: string
      roomType: string
      amenities: string[]
      images: string[]
    }>
  }
}

export default function EditHotelForm({ hotel }: EditHotelFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<HotelInput>({
    resolver: zodResolver(hotelSchema),
    defaultValues: {
      name: hotel.name,
      description: hotel.description,
      address: hotel.address,
      city: hotel.city,
      country: hotel.country,
      rating: hotel.rating,
      amenities: hotel.amenities,
      images: hotel.images,
      rooms: hotel.rooms.map((room) => ({
        id: room.id,
        name: room.name,
        description: room.description,
        capacity: room.capacity,
        pricePerNight: parseFloat(room.pricePerNight),
        roomType: room.roomType as "single" | "double" | "suite" | "family",
        amenities: room.amenities,
        images: room.images,
      })),
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "rooms",
  })

  // State for hotel images
  const [hotelImages, setHotelImages] = useState<File[]>([])
  const [hotelImagePreviews, setHotelImagePreviews] = useState<string[]>(
    hotel.images
  )
  const [hotelUploadError, setHotelUploadError] = useState<string>("")

  // Initialize room images state
  const [roomImages, setRoomImages] = useState<File[][]>(
    hotel.rooms.map(() => [])
  )
  const [roomImagePreviews, setRoomImagePreviews] = useState<string[][]>(
    hotel.rooms.map((room) => room.images)
  )
  const [roomUploadErrors, setRoomUploadErrors] = useState<string[]>(
    hotel.rooms.map(() => "")
  )

  async function onSubmit(data: HotelInput) {
    startTransition(async () => {
      try {
        // Upload new hotel images
        let hotelImageUrls: string[] = [...hotelImagePreviews]
        if (hotelImages.length > 0) {
          try {
            const newUrls = await Promise.all(
              hotelImages.map(async (file) => {
                const formData = await fileToFormData(file)
                return uploadImages(formData)
              })
            )
            hotelImageUrls = [...hotelImageUrls, ...newUrls]
          } catch (error) {
            console.error("Error uploading hotel images:", error)
            setHotelUploadError("Failed to upload hotel images")
            return
          }
        }

        // Upload new room images
        const roomImageUrlsPromises = roomImages.map(
          async (roomImageArray, index) => {
            const existingImages = roomImagePreviews[index]
            if (!Array.isArray(roomImageArray) || !roomImageArray.length)
              return existingImages

            try {
              const newUrls = await Promise.all(
                roomImageArray.map(async (file) => {
                  const formData = await fileToFormData(file)
                  return uploadImages(formData)
                })
              )
              return [...existingImages, ...newUrls]
            } catch (error) {
              console.error("Error uploading room images:", error)
              throw error
            }
          }
        )

        const roomImageUrls = await Promise.all(roomImageUrlsPromises)

        // Prepare final data with image URLs
        const formattedData = {
          ...data,
          images: hotelImageUrls,
          rooms: data.rooms.map((room, index) => ({
            ...room,
            images: roomImageUrls[index] || [],
            pricePerNight: Number(room.pricePerNight),
          })),
        }

        // Remove any function properties that might have been added by the form
        const cleanedData = JSON.parse(JSON.stringify(formattedData))

        // Update hotel
        await updateHotel(hotel.id, cleanedData)
        router.push("/admin/dashboard/hotels")
        router.refresh()
      } catch (error) {
        console.error("Error updating hotel:", error)
        if (error instanceof Error) {
          setHotelUploadError(error.message)
        } else {
          setHotelUploadError("Failed to update hotel")
        }
      }
    })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Edit Hotel</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Hotel Details Section */}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Hotel Name
            </label>
            <input
              type="text"
              {...register("name")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Rating (1-5)
            </label>
            <input
              type="number"
              min="1"
              max="5"
              {...register("rating", { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
            />
            {errors.rating && (
              <p className="mt-1 text-xs text-red-600">
                {errors.rating.message}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              {...register("description")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
              rows={3}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              City
            </label>
            <input
              type="text"
              {...register("city")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
            />
            {errors.city && (
              <p className="mt-1 text-xs text-red-600">{errors.city.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Country
            </label>
            <input
              type="text"
              {...register("country")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
            />
            {errors.country && (
              <p className="mt-1 text-xs text-red-600">
                {errors.country.message}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              type="text"
              {...register("address")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
            />
            {errors.address && (
              <p className="mt-1 text-xs text-red-600">
                {errors.address.message}
              </p>
            )}
          </div>
        </div>

        {/* Hotel Images */}
        <ImageUploadSection
          label="Hotel Images"
          images={hotelImages}
          setImages={setHotelImages}
          previewUrls={hotelImagePreviews}
          setPreviewUrls={setHotelImagePreviews}
          uploadError={hotelUploadError}
          setUploadError={setHotelUploadError}
        />

        {/* Rooms Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Rooms</h2>
            <button
              type="button"
              onClick={() => {
                append({
                  name: "",
                  description: "",
                  capacity: 2,
                  pricePerNight: 0,
                  roomType: "double",
                  amenities: [],
                  images: [],
                })
                setRoomImages((prev) => [...prev, []])
                setRoomImagePreviews((prev) => [...prev, []])
                setRoomUploadErrors((prev) => [...prev, ""])
              }}
              className="inline-flex items-center rounded-md bg-green-600 px-3 py-1 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            >
              Add Room
            </button>
          </div>

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800">
                  Room {index + 1}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    remove(index)
                    setRoomImages((prev) => {
                      const newImages = [...prev]
                      newImages.splice(index, 1)
                      return newImages
                    })
                    setRoomImagePreviews((prev) => {
                      const newPreviews = [...prev]
                      newPreviews.splice(index, 1)
                      return newPreviews
                    })
                    setRoomUploadErrors((prev) => {
                      const newErrors = [...prev]
                      newErrors.splice(index, 1)
                      return newErrors
                    })
                  }}
                  className="inline-flex items-center rounded-md bg-red-600 px-3 py-1 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                >
                  Remove Room
                </button>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Room Name
                  </label>
                  <input
                    type="text"
                    {...register(`rooms.${index}.name`)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                  />
                  {errors.rooms?.[index]?.name && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.rooms[index]?.name?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Room Type
                  </label>
                  <select
                    {...register(`rooms.${index}.roomType`)}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="single">Single</option>
                    <option value="double">Double</option>
                    <option value="suite">Suite</option>
                    <option value="family">Family</option>
                  </select>
                  {errors.rooms?.[index]?.roomType && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.rooms[index]?.roomType?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Capacity
                  </label>
                  <input
                    type="number"
                    {...register(`rooms.${index}.capacity`, {
                      valueAsNumber: true,
                    })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                  />
                  {errors.rooms?.[index]?.capacity && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.rooms[index]?.capacity?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Price per Night
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register(`rooms.${index}.pricePerNight`, {
                      valueAsNumber: true,
                    })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                  />
                  {errors.rooms?.[index]?.pricePerNight && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.rooms[index]?.pricePerNight?.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    {...register(`rooms.${index}.description`)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                    rows={2}
                  />
                  {errors.rooms?.[index]?.description && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.rooms[index]?.description?.message}
                    </p>
                  )}
                </div>

                {/* Room Images */}
                <div className="md:col-span-2">
                  <ImageUploadSection
                    label={`Room ${index + 1} Images`}
                    images={roomImages[index]}
                    setImages={(newImages) => {
                      setRoomImages((prev) => {
                        const newRoomImages = [...prev]
                        newRoomImages[index] = Array.isArray(newImages)
                          ? newImages
                          : newImages(prev[index])
                        return newRoomImages
                      })
                    }}
                    previewUrls={roomImagePreviews[index]}
                    setPreviewUrls={(newPreviews) => {
                      setRoomImagePreviews((prev) => {
                        const newRoomPreviews = [...prev]
                        newRoomPreviews[index] = Array.isArray(newPreviews)
                          ? newPreviews
                          : newPreviews(prev[index])
                        return newRoomPreviews
                      })
                    }}
                    uploadError={roomUploadErrors[index]}
                    setUploadError={(error) => {
                      const newErrors = [...roomUploadErrors]
                      newErrors[index] = error
                      setRoomUploadErrors(newErrors)
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Form Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isPending}
          >
            {isPending ? "Updating..." : "Update Hotel"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center rounded-md bg-gray-300 px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
