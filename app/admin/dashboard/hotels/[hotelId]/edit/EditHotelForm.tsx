// EditHotelForm.tsx
"use client"
import Image from "next/image"
import { useTransition, useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { hotelSchema, type HotelInput } from "@/lib/validations/hotelSchema"
import { useRouter } from "next/navigation"
import { updateHotel } from "@/actions/hotelActions"
import { ImageUploadSection } from "@/components/ImageUploadSection"
import { fileToFormData } from "@/lib/utils"
import { uploadImages } from "@/actions/uploadActions"
import { Building, BedDouble, Plus, Trash2 } from "lucide-react"

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

  // Initialize react-hook-form with default values.
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
      images: hotel.images, // will be updated on submit
      rooms: hotel.rooms.map((room) => ({
        id: room.id,
        name: room.name,
        description: room.description,
        capacity: room.capacity,
        pricePerNight: parseFloat(room.pricePerNight),
        roomType: room.roomType as "single" | "double" | "suite" | "family",
        amenities: room.amenities,
        images: room.images, // will be updated on submit
      })),
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "rooms",
  })

  // --------------------------------------------------
  // EXISTING IMAGES (state so they can be modified)
  // --------------------------------------------------
  const [existingHotelImages, setExistingHotelImages] = useState<string[]>(
    hotel.images
  )
  const [existingRoomImages, setExistingRoomImages] = useState<string[][]>(
    hotel.rooms.map((room) => room.images)
  )

  // --------------------------------------------------
  // NEW UPLOADS (for hotel and room images)
  // --------------------------------------------------
  const [newHotelImages, setNewHotelImages] = useState<File[]>([])
  const [newHotelImagePreviews, setNewHotelImagePreviews] = useState<string[]>(
    []
  )
  const [hotelUploadError, setHotelUploadError] = useState<string>("")

  const [newRoomImages, setNewRoomImages] = useState<File[][]>(
    hotel.rooms.map(() => [])
  )
  const [newRoomImagePreviews, setNewRoomImagePreviews] = useState<string[][]>(
    hotel.rooms.map(() => [])
  )
  const [roomUploadErrors, setRoomUploadErrors] = useState<string[]>(
    hotel.rooms.map(() => "")
  )

  async function onSubmit(data: HotelInput) {
    startTransition(async () => {
      try {
        // ----------------------------
        // Process Hotel Images
        // ----------------------------
        // Start with the remaining (not removed) existing images.
        let hotelImageUrls: string[] = [...existingHotelImages]

        // Upload any new hotel images.
        if (newHotelImages.length > 0) {
          try {
            const newUrls = await Promise.all(
              newHotelImages.map(async (file) => {
                const formData = await fileToFormData(file)
                return uploadImages(formData)
              })
            )
            hotelImageUrls = [...existingHotelImages, ...newUrls]
          } catch (error) {
            console.error("Error uploading hotel images:", error)
            setHotelUploadError("Failed to upload hotel images")
            return
          }
        }

        // ----------------------------
        // Process Room Images
        // ----------------------------
        const roomImageUrlsPromises = newRoomImages.map(
          async (newRoomImageArray, index) => {
            // Use the remaining existing images for this room.
            const currentExistingImages = existingRoomImages[index] || []
            if (
              !Array.isArray(newRoomImageArray) ||
              newRoomImageArray.length === 0
            ) {
              return currentExistingImages
            }
            try {
              const newUrls = await Promise.all(
                newRoomImageArray.map(async (file) => {
                  const formData = await fileToFormData(file)
                  return uploadImages(formData)
                })
              )
              return [...currentExistingImages, ...newUrls]
            } catch (error) {
              console.error("Error uploading room images:", error)
              throw error
            }
          }
        )

        const roomImageUrls = await Promise.all(roomImageUrlsPromises)

        // ----------------------------
        // Prepare Final Data
        // ----------------------------
        const formattedData = {
          ...data,
          images: hotelImageUrls,
          rooms: data.rooms.map((room, index) => ({
            ...room,
            images: roomImageUrls[index] || [],
            pricePerNight: Number(room.pricePerNight),
          })),
        }

        const cleanedData = JSON.parse(JSON.stringify(formattedData))

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
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Hotel</h1>
          <p className="text-muted-foreground mt-2">
            Update the hotel details and room information
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* ----------------------------
            Hotel Details Section
        ----------------------------- */}
        <div className="rounded-lg border bg-card">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Building className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Hotel Details</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Basic Hotel Information */}
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

              {/* Existing Hotel Images */}
              {existingHotelImages.length > 0 && (
                <div className="md:col-span-2">
                  <h3 className="font-medium mb-2">Existing Hotel Images</h3>
                  <div className="flex gap-2 flex-wrap">
                    {existingHotelImages.map((url, i) => (
                      <div key={i} className="relative">
                        <Image
                          src={url}
                          alt={`Hotel Image ${i + 1}`}
                          className="w-20 h-20 object-cover rounded"
                          width={80}
                          height={80}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setExistingHotelImages((prev) =>
                              prev.filter((_, index) => index !== i)
                            )
                          }}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
                        >
                          x
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Hotel Images Uploader */}
              <div className="md:col-span-2">
                <ImageUploadSection
                  label="Add New Hotel Images"
                  images={newHotelImages}
                  setImages={setNewHotelImages}
                  previewUrls={newHotelImagePreviews}
                  setPreviewUrls={setNewHotelImagePreviews}
                  uploadError={hotelUploadError}
                  setUploadError={setHotelUploadError}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ----------------------------
            Rooms Section
        ----------------------------- */}
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
                    pricePerNight: 0,
                    roomType: "double",
                  })
                  setNewRoomImages((prev) => [...prev, []])
                  setNewRoomImagePreviews((prev) => [...prev, []])
                  setRoomUploadErrors((prev) => [...prev, ""])
                  // Also add an empty array for existing images for the new room.
                  setExistingRoomImages((prev) => [...prev, []])
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
                        setNewRoomImages((prev) => {
                          const newImages = [...prev]
                          newImages.splice(index, 1)
                          return newImages
                        })
                        setNewRoomImagePreviews((prev) => {
                          const newPreviews = [...prev]
                          newPreviews.splice(index, 1)
                          return newPreviews
                        })
                        setRoomUploadErrors((prev) => {
                          const newErrors = [...prev]
                          newErrors.splice(index, 1)
                          return newErrors
                        })
                        setExistingRoomImages((prev) => {
                          const newExisting = [...prev]
                          newExisting.splice(index, 1)
                          return newExisting
                        })
                      }}
                      className="btn btn-sm btn-error"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Room Basic Info */}
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

                    <div>
                      <label className="block font-medium">
                        Price per Night
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        {...register(`rooms.${index}.pricePerNight`, {
                          valueAsNumber: true,
                        })}
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

                    {/* Existing Room Images */}
                    {existingRoomImages[index] &&
                      existingRoomImages[index].length > 0 && (
                        <div className="md:col-span-2">
                          <h3 className="font-medium mb-2">
                            Existing Room Images
                          </h3>
                          <div className="flex gap-2 flex-wrap">
                            {existingRoomImages[index].map((url, j) => (
                              <div key={j} className="relative">
                                <Image
                                  src={url}
                                  alt={`Room ${index + 1} Image ${j + 1}`}
                                  className="w-20 h-20 object-cover rounded"
                                  width={80}
                                  height={80}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setExistingRoomImages((prev) => {
                                      const newImages = [...prev]
                                      newImages[index] = newImages[
                                        index
                                      ].filter((_, k) => k !== j)
                                      return newImages
                                    })
                                  }}
                                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
                                >
                                  x
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* New Room Images Uploader */}
                    <div className="md:col-span-2">
                      <ImageUploadSection
                        label={`Add New Room ${index + 1} Images`}
                        images={newRoomImages[index] || []}
                        setImages={(action) => {
                          setNewRoomImages((prev) => {
                            const newRoomImagesCopy = [...prev]
                            const current = newRoomImagesCopy[index] || []
                            newRoomImagesCopy[index] =
                              typeof action === "function"
                                ? action(current)
                                : action
                            return newRoomImagesCopy
                          })
                        }}
                        previewUrls={newRoomImagePreviews[index] || []}
                        setPreviewUrls={(action) => {
                          setNewRoomImagePreviews((prev) => {
                            const newRoomPreviewsCopy = [...prev]
                            const current = newRoomPreviewsCopy[index] || []
                            newRoomPreviewsCopy[index] =
                              typeof action === "function"
                                ? action(current)
                                : action
                            return newRoomPreviewsCopy
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
                Updating...
              </>
            ) : (
              "Update Hotel"
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
