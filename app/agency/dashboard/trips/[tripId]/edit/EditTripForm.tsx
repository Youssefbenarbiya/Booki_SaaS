"use client"
import Image from "next/image"
import { useTransition, useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { useRouter } from "next/navigation"
import { ImageUploadSection } from "@/components/ImageUploadSection"
import { fileToFormData } from "@/lib/utils"
import { uploadImages } from "@/actions/uploadActions"
import { type TripInput, updateTrip } from "@/actions/trips/tripActions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Percent, DollarSign, Info } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ExtendedTripInput extends TripInput {
  discountPercentage?: number
}

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

  // Determine if trip has a discount
  const hasExistingDiscount =
    !!trip.discountPercentage && !!trip.priceAfterDiscount

  // Discount states
  const [hasDiscount, setHasDiscount] = useState<boolean>(hasExistingDiscount)
  const [discountPercentage, setDiscountPercentage] = useState<number>(
    trip.discountPercentage || 0
  )
  const [originalPrice, setOriginalPrice] = useState<number>(trip.originalPrice)
  const [priceAfterDiscount, setPriceAfterDiscount] = useState<number>(
    trip.priceAfterDiscount || trip.originalPrice
  )
  const [customPercentage, setCustomPercentage] = useState<boolean>(
    !!trip.discountPercentage && ![10, 20, 30].includes(trip.discountPercentage)
  )

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
            })
          )
          imageUrls = [...imageUrls, ...newUrls]
        } catch (error) {
          console.error("Error uploading images:", error)
          setUploadError("Failed to upload images")
          return
        }
      }

      // Calculate price after discount if applicable
      let finalPriceAfterDiscount = undefined
      if (hasDiscount && data.discountPercentage) {
        finalPriceAfterDiscount = calculatePriceAfterDiscount(
          Number(data.originalPrice),
          data.discountPercentage
        )
      }

      // Update trip with all image URLs and discount info
      const formattedData = {
        ...data,
        originalPrice: Number(data.originalPrice),
        discountPercentage:
          hasDiscount && data.discountPercentage
            ? data.discountPercentage
            : undefined,
        priceAfterDiscount:
          hasDiscount && finalPriceAfterDiscount
            ? finalPriceAfterDiscount
            : undefined,
        images: imageUrls,
        // Ensure dates are always Date objects
        startDate:
          data.startDate instanceof Date
            ? data.startDate
            : new Date(data.startDate),
        endDate:
          data.endDate instanceof Date ? data.endDate : new Date(data.endDate),
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
      <Card>
        <CardHeader className="bg-indigo-600 text-white">
          <CardTitle>Edit Trip</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form
            onSubmit={handleSubmit((data) =>
              startTransition(() => onSubmit(data))
            )}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Trip Name</Label>
                <Input id="name" {...register("name")} />
                {errors.name && (
                  <p className="text-xs text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <Input id="destination" {...register("destination")} />
                {errors.destination && (
                  <p className="text-xs text-destructive">
                    {errors.destination.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="startDate"
                      type="date"
                      value={formatDateForInput(new Date(field.value))}
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                    />
                  )}
                />
                {errors.startDate && (
                  <p className="text-xs text-destructive">
                    {errors.startDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Controller
                  name="endDate"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="endDate"
                      type="date"
                      value={formatDateForInput(new Date(field.value))}
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                    />
                  )}
                />
                {errors.endDate && (
                  <p className="text-xs text-destructive">
                    {errors.endDate.message}
                  </p>
                )}
              </div>

              {/* Pricing Section */}
              <div className="md:col-span-2">
                <Card className="border-2 border-muted">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <DollarSign className="h-5 w-5 mr-1" />
                      Pricing Information
                      {hasExistingDiscount && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <Percent className="h-3 w-3 mr-1" />
                                Discount Applied
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                This trip has a {trip.discountPercentage}%
                                discount applied
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Label htmlFor="originalPrice">Original Price</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 ml-1 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>The base price before any discounts</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="originalPrice"
                          type="number"
                          step="0.01"
                          className="pl-9"
                          {...register("originalPrice", {
                            required: "Original price is required",
                            onChange: (e) => {
                              const price = Number(e.target.value)
                              setOriginalPrice(price)
                              if (hasDiscount && discountPercentage) {
                                calculatePriceAfterDiscount(
                                  price,
                                  discountPercentage
                                )
                              }
                            },
                          })}
                        />
                      </div>
                      {errors.originalPrice && (
                        <p className="text-xs text-destructive">
                          {errors.originalPrice.message}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasDiscount"
                        checked={hasDiscount}
                        onCheckedChange={(checked) => {
                          setHasDiscount(!!checked)
                          if (!checked) {
                            setDiscountPercentage(0)
                            setValue("discountPercentage", undefined)
                            setValue("priceAfterDiscount", undefined)
                            setPriceAfterDiscount(originalPrice)
                            setCustomPercentage(false)
                            // Reset form values immediately
                            setValue("discountPercentage", undefined)
                            setValue("priceAfterDiscount", undefined)
                          } else if (hasExistingDiscount) {
                            // Restore original discount values if they exist
                            setDiscountPercentage(trip.discountPercentage || 0)
                            setValue(
                              "discountPercentage",
                              trip.discountPercentage
                            )
                            setPriceAfterDiscount(
                              trip.priceAfterDiscount || originalPrice
                            )
                            setValue(
                              "priceAfterDiscount",
                              trip.priceAfterDiscount
                            )
                            setCustomPercentage(
                              ![10, 20, 30].includes(
                                trip.discountPercentage || 0
                              )
                            )
                          }
                        }}
                      />
                      <Label htmlFor="hasDiscount" className="font-medium">
                        Apply Discount
                      </Label>
                      {hasExistingDiscount && !hasDiscount && (
                        <span className="text-xs text-amber-600">
                          Warning: Unchecking will remove the existing discount
                        </span>
                      )}
                    </div>

                    {hasDiscount && (
                      <div className="space-y-4 pl-6 border-l-2 border-muted">
                        <div className="space-y-3">
                          <Label>Discount Percentage</Label>
                          <RadioGroup
                            value={
                              customPercentage
                                ? "custom"
                                : discountPercentage.toString()
                            }
                            onValueChange={(value) => {
                              if (value === "custom") {
                                setCustomPercentage(true)
                                return
                              }

                              setCustomPercentage(false)
                              const percentage = Number.parseInt(value, 10)
                              applyPercentageDiscount(percentage)
                            }}
                            className="flex flex-wrap gap-2"
                          >
                            <div className="flex items-center space-x-2 border rounded-md p-2">
                              <RadioGroupItem value="10" id="r10" />
                              <Label htmlFor="r10">10%</Label>
                            </div>
                            <div className="flex items-center space-x-2 border rounded-md p-2">
                              <RadioGroupItem value="20" id="r20" />
                              <Label htmlFor="r20">20%</Label>
                            </div>
                            <div className="flex items-center space-x-2 border rounded-md p-2">
                              <RadioGroupItem value="30" id="r30" />
                              <Label htmlFor="r30">30%</Label>
                            </div>
                            <div className="flex items-center space-x-2 border rounded-md p-2">
                              <RadioGroupItem value="custom" id="rcustom" />
                              <Label htmlFor="rcustom">Custom</Label>
                            </div>
                          </RadioGroup>

                          {customPercentage && (
                            <div className="flex items-center space-x-2 mt-2">
                              <Input
                                type="number"
                                min="1"
                                max="100"
                                value={discountPercentage || ""}
                                onChange={(e) => {
                                  const value = Number.parseInt(
                                    e.target.value,
                                    10
                                  )
                                  if (
                                    !isNaN(value) &&
                                    value >= 0 &&
                                    value <= 100
                                  ) {
                                    applyPercentageDiscount(value)
                                  }
                                }}
                                className="w-24"
                              />
                              <Percent className="h-4 w-4" />
                            </div>
                          )}
                        </div>

                        {discountPercentage > 0 && originalPrice > 0 && (
                          <div className="bg-muted p-4 rounded-md space-y-2">
                            <div className="flex justify-between">
                              <span>Original Price:</span>
                              <span>${originalPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Discount ({discountPercentage}%):</span>
                              <span className="text-red-500">
                                -$
                                {(
                                  (originalPrice * discountPercentage) /
                                  100
                                ).toFixed(2)}
                              </span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between font-bold">
                              <span>Price After Discount:</span>
                              <span className="text-green-600">
                                ${priceAfterDiscount.toFixed(2)}
                              </span>
                            </div>
                            <input
                              type="hidden"
                              {...register("priceAfterDiscount")}
                              value={priceAfterDiscount}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input id="capacity" type="number" {...register("capacity")} />
                {errors.capacity && (
                  <p className="text-xs text-destructive">
                    {errors.capacity.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  rows={3}
                />
                {errors.description && (
                  <p className="text-xs text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2 flex items-center space-x-2">
                <Checkbox id="isAvailable" {...register("isAvailable")} />
                <Label htmlFor="isAvailable">Available for Booking</Label>
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
              <Button type="submit" disabled={isPending}>
                {isPending ? "Updating..." : "Update Trip"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
