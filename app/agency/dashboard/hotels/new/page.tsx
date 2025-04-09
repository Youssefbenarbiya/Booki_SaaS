"use client"

import { useTransition, useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { hotelSchema, type HotelInput } from "@/lib/validations/hotelSchema"
import { useRouter } from "next/navigation"
import { createHotel } from "@/actions/hotels&rooms/hotelActions"
import { ImageUploadSection } from "@/components/ImageUploadSection"
import { fileToFormData } from "@/lib/utils"
import { uploadImages } from "@/actions/uploadActions"
import { Building, BedDouble, Plus, Trash2, MapPin } from "lucide-react"
import dynamic from "next/dynamic"

// Dynamically import the map component to avoid SSR issues with Leaflet
const LocationMapSelector = dynamic(
  () => import("@/components/LocationMapSelector"),
  { ssr: false }
)

// Available amenities for hotels and rooms
const HOTEL_AMENITIES = [
  "Free Parking",
  "Free Breakfast",
  "Swimming Pool",
  "Gym/Fitness Center",
  "Spa",
  "Air Conditioning",
  "Restaurant",
  "Pet Friendly",
]

const ROOM_AMENITIES = [
  "Air Conditioning",
  "TV",
  "Fridge",
  "Minibar",
  "Safe",
  "Bathtub",
  "Shower",
]

export default function NewHotelPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
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
          pricePerNightAdult: 0,
          pricePerNightChild: 0,
          availabilities: [],
        },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "rooms",
  })

  // Get current values for latitude and longitude
  const latitude = watch("latitude")
  const longitude = watch("longitude")

  // State for hotel images
  const [hotelImages, setHotelImages] = useState<File[]>([])
  const [hotelImagePreviews, setHotelImagePreviews] = useState<string[]>([])
  const [hotelUploadError, setHotelUploadError] = useState<string>("")

  // Initialize room images state with one empty array for the default room
  const [roomImages, setRoomImages] = useState<File[][]>([[]])
  const [roomImagePreviews, setRoomImagePreviews] = useState<string[][]>([[]])
  const [roomUploadErrors, setRoomUploadErrors] = useState<string[]>([""])

  // Handle location selection
  const handleLocationSelected = (lat: number, lng: number) => {
    setValue("latitude", lat)
    setValue("longitude", lng)
  }

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
      router.push("/agency/dashboard/hotels")
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
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Hotel</h1>
          <p className="text-muted-foreground mt-2">
            Create a new hotel listing with rooms and amenities
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit((data) => startTransition(() => onSubmit(data)))}
        className="space-y-8"
      >
        {/* Hotel Details Card */}
        <div className="rounded-lg border bg-card">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Building className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Hotel Details</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Hotel Name</label>
                <input
                  type="text"
                  {...register("name")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Rating</label>
                <select
                  {...register("rating", { valueAsNumber: true })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <option key={rating} value={rating}>
                      {rating} Star{rating !== 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">City</label>
                <input
                  type="text"
                  {...register("city")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                {errors.city && (
                  <p className="text-sm text-destructive">
                    {errors.city.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Country</label>
                <input
                  type="text"
                  {...register("country")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                {errors.country && (
                  <p className="text-sm text-destructive">
                    {errors.country.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium">Address</label>
                <input
                  type="text"
                  {...register("address")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                {errors.address && (
                  <p className="text-sm text-destructive">
                    {errors.address.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  {...register("description")}
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  rows={4}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Hotel Amenities */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium">Hotel Amenities</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {HOTEL_AMENITIES.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`amenity-${amenity}`}
                        value={amenity}
                        {...register("amenities")}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label htmlFor={`amenity-${amenity}`} className="text-sm">
                        {amenity}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Location Map section */}
              <div className="md:col-span-2 space-y-2 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-5 w-5" />
                  <h3 className="text-lg font-medium">Hotel Location</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Select the exact location of your hotel on the map. You can
                  search for an address or click directly on the map.
                </p>
                <LocationMapSelector
                  initialLatitude={latitude}
                  initialLongitude={longitude}
                  onLocationSelected={handleLocationSelected}
                  height="400px"
                  enableSearch={true}
                />
                {errors.latitude || errors.longitude ? (
                  <p className="text-sm text-destructive">
                    Please select a valid location on the map
                  </p>
                ) : null}
              </div>

              <div className="md:col-span-2">
                <ImageUploadSection
                  label="Hotel Images"
                  images={hotelImages}
                  setImages={setHotelImages}
                  previewUrls={hotelImagePreviews}
                  setPreviewUrls={setHotelImagePreviews}
                  uploadError={hotelUploadError}
                  setUploadError={setHotelUploadError}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Rooms Section */}
        <div className="rounded-lg border bg-card">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BedDouble className="h-5 w-5" />
                <h2 className="text-xl font-semibold">Rooms</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  append({
                    name: "",
                    description: "",
                    amenities: [],
                    images: [],
                    capacity: 2,
                    pricePerNightAdult: 0,
                    pricePerNightChild: 0,
                    roomType: "double",
                  })
                  setRoomImages((prev) => [...prev, []])
                  setRoomImagePreviews((prev) => [...prev, []])
                  setRoomUploadErrors((prev) => [...prev, ""])
                }}
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Room
              </button>
            </div>

            <div className="space-y-6">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="rounded-lg border bg-card p-6 relative"
                >
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
                          newPreviews[index]?.forEach((url) =>
                            URL.revokeObjectURL(url)
                          )
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
                      <Trash2 className="h-4 w-4" />
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
                        <p className="text-red-500">
                          {errors.rooms[index]?.name?.message}
                        </p>
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
                        <p className="text-red-500">
                          {errors.rooms[index]?.roomType?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block font-medium">Capacity</label>
                      <input
                        type="number"
                        {...register(`rooms.${index}.capacity`, {
                          valueAsNumber: true,
                        })}
                        className="input input-bordered w-full"
                      />
                      {errors.rooms?.[index]?.capacity && (
                        <p className="text-red-500">
                          {errors.rooms[index]?.capacity?.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-medium">
                          Price per Night (Adult)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          {...register(`rooms.${index}.pricePerNightAdult`, {
                            valueAsNumber: true,
                          })}
                          className="input input-bordered w-full"
                        />
                        {errors.rooms?.[index]?.pricePerNightAdult && (
                          <p className="text-red-500">
                            {errors.rooms[index]?.pricePerNightAdult?.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block font-medium">
                          Price per Night (Child 6-17)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          {...register(`rooms.${index}.pricePerNightChild`, {
                            valueAsNumber: true,
                          })}
                          className="input input-bordered w-full"
                        />
                        {errors.rooms?.[index]?.pricePerNightChild && (
                          <p className="text-red-500">
                            {errors.rooms[index]?.pricePerNightChild?.message}
                          </p>
                        )}
                      </div>
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

                    {/* Room Amenities */}
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-medium">
                        Room Amenities
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {ROOM_AMENITIES.map((amenity) => (
                          <div
                            key={`${index}-${amenity}`}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              id={`room-${index}-amenity-${amenity}`}
                              value={amenity}
                              {...register(`rooms.${index}.amenities`)}
                              className="rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <label
                              htmlFor={`room-${index}-amenity-${amenity}`}
                              className="text-sm"
                            >
                              {amenity}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Room Images */}
                    <div className="md:col-span-2">
                      <ImageUploadSection
                        label={`Room ${index + 1} Images`}
                        images={roomImages[index] || []}
                        setImages={(action) => {
                          setRoomImages((prev) => {
                            const newRoomImages = [...prev]
                            const current = newRoomImages[index] || []
                            newRoomImages[index] =
                              typeof action === "function"
                                ? action(current)
                                : action
                            return newRoomImages
                          })
                        }}
                        previewUrls={roomImagePreviews[index] || []}
                        setPreviewUrls={(action) => {
                          setRoomImagePreviews((prev) => {
                            const newRoomPreviews = [...prev]
                            const current = newRoomPreviews[index] || []
                            newRoomPreviews[index] =
                              typeof action === "function"
                                ? action(current)
                                : action
                            return newRoomPreviews
                          })
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
          </div>
        </div>

        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
          >
            {isPending ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Creating...
              </>
            ) : (
              "Create Hotel"
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
