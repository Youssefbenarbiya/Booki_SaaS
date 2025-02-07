"use client"

import { useTransition, useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { hotelSchema, type HotelInput } from "@/lib/validations/hotelSchema"
import { useRouter } from "next/navigation"
import { createHotel } from "@/actions/hotelActions"
import { uploadFiles } from "@/lib/uploadFiles"
import Image from "next/image"
import { ImageUploadSection } from "@/components/ImageUploadSection"
import { fileToFormData } from "@/lib/utils"
import { uploadImages } from "@/actions/uploadActions"

export default function NewHotelPage() {
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
      amenities: [],
      rooms: [
        {
          amenities: [],
          capacity: 2,
          roomType: "double",
          availabilities: [],
        },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "rooms",
  })

  // State for hotel images
  const [hotelImages, setHotelImages] = useState<File[]>([])
  const [hotelImagePreviews, setHotelImagePreviews] = useState<string[]>([])
  const [hotelUploadError, setHotelUploadError] = useState<string>("")

  // Initialize room images state with one empty array for the default room
  const [roomImages, setRoomImages] = useState<File[][]>([[]])
  const [roomImagePreviews, setRoomImagePreviews] = useState<string[][]>([[]])
  const [roomUploadErrors, setRoomUploadErrors] = useState<string[]>([""])

  async function onSubmit(data: HotelInput) {
    try {
      // Upload hotel images first
      let hotelImageUrls: string[] = []
      if (hotelImages.length > 0) {
        try {
          hotelImageUrls = await Promise.all(
            hotelImages.map(async (file) => {
              const formData = await fileToFormData(file)
              return uploadImages(formData)
            })
          )
        } catch (error) {
          console.error("Error uploading hotel images:", error)
          setHotelUploadError("Failed to upload hotel images")
          return
        }
      }

      // Upload room images
      const roomImageUrlsPromises = roomImages.map(async (roomImageArray) => {
        if (!Array.isArray(roomImageArray) || !roomImageArray.length) return []
        
        try {
          return await Promise.all(
            roomImageArray.map(async (file) => {
              const formData = await fileToFormData(file)
              return uploadImages(formData)
            })
          )
        } catch (error) {
          console.error("Error uploading room images:", error)
          throw error
        }
      })

      const roomImageUrls = await Promise.all(roomImageUrlsPromises)

      // Prepare final data with image URLs
      const formattedData = {
        ...data,
        images: hotelImageUrls,
        rooms: data.rooms.map((room, index) => ({
          ...room,
          images: roomImageUrls[index] || [],
        })),
      }

      // Create hotel with all data
      await createHotel(formattedData)
      router.push("/admin/dashboard/hotels")
      router.refresh()
    } catch (error) {
      console.error("Error creating hotel:", error)
      if (error instanceof Error) {
        setHotelUploadError(error.message)
      } else {
        setHotelUploadError("Failed to create hotel")
      }
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Add New Hotel</h1>
      <form
        onSubmit={handleSubmit((data) => startTransition(() => onSubmit(data)))}
        className="space-y-6"
      >
        {/* Hotel Details Section */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block font-medium">Hotel Name</label>
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
            <label className="block font-medium">Rating (1-5)</label>
            <input
              type="number"
              min="1"
              max="5"
              {...register("rating", { valueAsNumber: true })}
              className="input input-bordered w-full"
            />
            {errors.rating && (
              <p className="text-red-500">{errors.rating.message}</p>
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

          <div>
            <label className="block font-medium">City</label>
            <input
              type="text"
              {...register("city")}
              className="input input-bordered w-full"
            />
            {errors.city && (
              <p className="text-red-500">{errors.city.message}</p>
            )}
          </div>

          <div>
            <label className="block font-medium">Country</label>
            <input
              type="text"
              {...register("country")}
              className="input input-bordered w-full"
            />
            {errors.country && (
              <p className="text-red-500">{errors.country.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block font-medium">Address</label>
            <input
              type="text"
              {...register("address")}
              className="input input-bordered w-full"
            />
            {errors.address && (
              <p className="text-red-500">{errors.address.message}</p>
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
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Rooms</h2>
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
                // Initialize new arrays for the new room
                setRoomImages((prev) => [...prev, []])
                setRoomImagePreviews((prev) => [...prev, []])
                setRoomUploadErrors((prev) => [...prev, ""])
              }}
              className="btn btn-secondary btn-sm"
            >
              Add Room
            </button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="card bg-base-100 shadow-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium">Room {index + 1}</h3>
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
                      // Cleanup URLs before removing
                      newPreviews[index]?.forEach(url => URL.revokeObjectURL(url))
                      newPreviews.splice(index, 1)
                      return newPreviews
                    })
                    setRoomUploadErrors((prev) => {
                      const newErrors = [...prev]
                      newErrors.splice(index, 1)
                      return newErrors
                    })
                  }}
                  className="btn btn-sm btn-error"
                >
                  Remove Room
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block font-medium">Room Name</label>
                  <input
                    type="text"
                    {...register(`rooms.${index}.name`)}
                    className="input input-bordered w-full"
                  />
                  {errors.rooms?.[index]?.name && (
                    <p className="text-red-500">{errors.rooms[index]?.name?.message}</p>
                  )}
                </div>

                <div>
                  <label className="block font-medium">Room Type</label>
                  <select
                    {...register(`rooms.${index}.roomType`)}
                    className="select select-bordered w-full"
                  >
                    <option value="single">Single</option>
                    <option value="double">Double</option>
                    <option value="suite">Suite</option>
                    <option value="family">Family</option>
                  </select>
                  {errors.rooms?.[index]?.roomType && (
                    <p className="text-red-500">{errors.rooms[index]?.roomType?.message}</p>
                  )}
                </div>

                <div>
                  <label className="block font-medium">Capacity</label>
                  <input
                    type="number"
                    {...register(`rooms.${index}.capacity`, { valueAsNumber: true })}
                    className="input input-bordered w-full"
                  />
                  {errors.rooms?.[index]?.capacity && (
                    <p className="text-red-500">{errors.rooms[index]?.capacity?.message}</p>
                  )}
                </div>

                <div>
                  <label className="block font-medium">Price per Night</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register(`rooms.${index}.pricePerNight`, { valueAsNumber: true })}
                    className="input input-bordered w-full"
                  />
                  {errors.rooms?.[index]?.pricePerNight && (
                    <p className="text-red-500">
                      {errors.rooms[index]?.pricePerNight?.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block font-medium">Description</label>
                  <textarea
                    {...register(`rooms.${index}.description`)}
                    className="textarea textarea-bordered w-full"
                    rows={2}
                  />
                  {errors.rooms?.[index]?.description && (
                    <p className="text-red-500">
                      {errors.rooms[index]?.description?.message}
                    </p>
                  )}
                </div>

                {/* Room Images */}
                <div className="md:col-span-2">
                  <ImageUploadSection
                    label={`Room ${index + 1} Images`}
                    images={roomImages[index] || []}
                    setImages={(newImages) => {
                      const newRoomImages = [...roomImages]
                      newRoomImages[index] = newImages
                      setRoomImages(newRoomImages)
                    }}
                    previewUrls={roomImagePreviews[index] || []}
                    setPreviewUrls={(newPreviews) => {
                      const newRoomPreviews = [...roomImagePreviews]
                      newRoomPreviews[index] = newPreviews
                      setRoomImagePreviews(newRoomPreviews)
                    }}
                    uploadError={roomUploadErrors[index] || ""}
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

        <div className="flex gap-4">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isPending}
          >
            {isPending ? "Creating..." : "Create Hotel"}
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