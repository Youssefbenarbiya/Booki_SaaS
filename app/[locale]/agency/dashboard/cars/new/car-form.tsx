/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { CarType } from "../types"
import { createCar, updateCar } from "@/actions/cars/carActions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Percent } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// --- Image upload imports ---
import { ImageUploadSection } from "@/components/ImageUploadSection"
import { fileToFormData } from "@/lib/utils"
import { uploadImages } from "@/actions/uploadActions"
// ----------------------------------
import { Locale } from "@/i18n/routing"

// Extend the schema to include discount fields.
const carFormSchema = z.object({
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  year: z.coerce
    .number()
    .int()
    .min(1900, "Year must be 1900 or later")
    .max(new Date().getFullYear() + 1, "Year cannot be in the distant future"),
  plateNumber: z.string().min(1, "License plate number is required"),
  color: z.string().min(1, "Color is required"),
  originalPrice: z.coerce.number().positive("Price must be positive"),
  currency: z.string().default("USD"),
  discountPercentage: z.coerce.number().optional(),
  priceAfterDiscount: z.coerce.number().optional(),
  isAvailable: z.boolean().default(true),
  seats: z.coerce
    .number()
    .int()
    .min(1, "Car must have at least 1 seat")
    .max(20, "Car cannot have more than 20 seats"),
  category: z.string().min(1, "Category is required"),
  location: z.string().min(1, "Pickup location is required"),
})

type CarFormProps = {
  initialData?: CarType
  isEditing?: boolean
  locale: Locale
}

export function CarForm({
  initialData,
  isEditing = false,
  locale,
}: CarFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  // Image upload state variables
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [uploadError, setUploadError] = useState<string>("")

  // When editing, load existing image URLs into preview state
  useEffect(() => {
    if (initialData?.images && Array.isArray(initialData.images)) {
      // Check if images are objects with imageUrl property
      if (
        initialData.images.length > 0 &&
        typeof initialData.images[0] === "object" &&
        "imageUrl" in initialData.images[0]
      ) {
        // Map the array of objects to an array of strings
        setImagePreviews(
          initialData.images.map(
            (img) => (img as { imageUrl: string }).imageUrl
          )
        )
      } else {
        // Images are already strings
        setImagePreviews(initialData.images as string[])
      }
    }
  }, [initialData])

  // Discount state variables
  const [hasDiscount, setHasDiscount] = useState(false)
  const [discountPercentage, setDiscountPercentage] = useState<number>(0)
  const [priceAfterDiscount, setPriceAfterDiscount] = useState<number>(0)
  const [customPercentage, setCustomPercentage] = useState(false)

  // Currency options
  const currencyOptions = [
    { value: "USD", label: "USD - US Dollar" },
    { value: "EUR", label: "EUR - Euro" },
    { value: "GBP", label: "GBP - British Pound" },
    { value: "JPY", label: "JPY - Japanese Yen" },
    { value: "TND", label: "TND - Tunisian Dinar" },
    { value: "CAD", label: "CAD - Canadian Dollar" },
    { value: "AUD", label: "AUD - Australian Dollar" },
  ]

  // Setup form with default values (convert null to undefined for discount fields)
  const form = useForm<z.infer<typeof carFormSchema>>({
    resolver: zodResolver(carFormSchema),
    defaultValues: initialData
      ? {
          brand: initialData.brand,
          model: initialData.model,
          year: initialData.year,
          plateNumber: initialData.plateNumber,
          color: initialData.color,
          originalPrice: Number(initialData.originalPrice),
          currency: initialData.currency || "USD",
          isAvailable: Boolean(initialData.isAvailable),
          discountPercentage: initialData.discountPercentage ?? undefined,
          priceAfterDiscount:
            initialData.priceAfterDiscount !== undefined
              ? Number(initialData.priceAfterDiscount)
              : undefined,
          seats: initialData.seats ?? 4,
          category: initialData.category ?? "",
          location: initialData.location ?? "",
        }
      : {
          brand: "",
          model: "",
          year: new Date().getFullYear(),
          plateNumber: "",
          color: "",
          originalPrice: 0,
          currency: "USD",
          isAvailable: true,
          discountPercentage: undefined,
          priceAfterDiscount: undefined,
          seats: 4,
          category: "",
          location: "",
        },
  })

  // Watch the originalPrice field for changes
  const watchedPrice = form.watch("originalPrice")

  // Calculate the price after discount based on originalPrice and discount percentage
  const calculatePriceAfterDiscount = (price: number, percentage: number) => {
    if (!price || !percentage) {
      setPriceAfterDiscount(price || 0)
      form.setValue("priceAfterDiscount", price || 0)
      return price || 0
    }
    const calculated = price - price * (percentage / 100)
    const rounded = Math.round(calculated * 100) / 100
    setPriceAfterDiscount(rounded)
    form.setValue("priceAfterDiscount", rounded)
    return rounded
  }

  // When originalPrice changes and discount is applied, recalc
  useEffect(() => {
    if (hasDiscount && discountPercentage) {
      calculatePriceAfterDiscount(Number(watchedPrice), discountPercentage)
    }
  }, [watchedPrice, discountPercentage, hasDiscount])

  // When editing, if initial discount exists then prefill discount state
  useEffect(() => {
    if (initialData?.discountPercentage !== undefined) {
      setHasDiscount(true)
      setDiscountPercentage(initialData.discountPercentage ?? 0)

      // Set customPercentage based on whether it matches standard percentages
      const std = [10, 20, 30]
      setCustomPercentage(!std.includes(initialData.discountPercentage ?? 0))

      if (initialData.priceAfterDiscount !== undefined) {
        setPriceAfterDiscount(Number(initialData.priceAfterDiscount) ?? 0)
      } else {
        calculatePriceAfterDiscount(
          Number(initialData.originalPrice),
          initialData.discountPercentage ?? 0
        )
      }
    }
  }, [initialData])

  // Function to update discount percentage and recalc price
  const applyPercentageDiscount = (percentage: number) => {
    setDiscountPercentage(percentage)
    form.setValue("discountPercentage", percentage)
    calculatePriceAfterDiscount(Number(watchedPrice), percentage)
  }

  async function onSubmit(values: z.infer<typeof carFormSchema>) {
    setServerError(null)
    setIsLoading(true)
    try {
      // Upload new images and get URLs
      let newImageUrls: string[] = []
      if (images.length > 0) {
        try {
          newImageUrls = await Promise.all(
            images.map(async (file) => {
              const formData = await fileToFormData(file)
              return uploadImages(formData)
            })
          )
        } catch (error) {
          console.error("Error uploading images:", error)
          setUploadError("Failed to upload images")
          setIsLoading(false)
          return
        }
      }

      // Preserve existing images (if editing)
      const existingImageUrls = imagePreviews.filter(
        (url) => !url.startsWith("blob:")
      )
      const finalImageUrls = [...existingImageUrls, ...newImageUrls]

      const formattedValues = {
        ...values,
        originalPrice: Number(values.originalPrice),
        // Only send discount fields if discount is applied
        discountPercentage: hasDiscount ? discountPercentage : undefined,
        priceAfterDiscount: hasDiscount ? priceAfterDiscount : undefined,
        images: finalImageUrls,
      }

      if (isEditing && initialData) {
        await updateCar(initialData.id, formattedValues)
        toast.success("Car updated successfully")
      } else {
        await createCar(formattedValues)
        toast.success("Car created successfully")
      }
      router.push(`/${locale}/agency/dashboard/cars`)
      router.refresh()
    } catch (error) {
      console.error("Form submission error:", error)
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      setServerError(errorMessage)
      toast.error(errorMessage)
      if (errorMessage.toLowerCase().includes("plate number")) {
        form.setFocus("plateNumber")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Car" : "Add New Car"}</CardTitle>
      </CardHeader>
      <CardContent>
        {serverError && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 border border-red-200">
            {serverError}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl>
                      <Input placeholder="Toyota" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl>
                      <Input placeholder="Corolla" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="plateNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plate Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ABC-1234"
                        {...field}
                        className={
                          serverError &&
                          serverError.toLowerCase().includes("plate number")
                            ? "border-red-500"
                            : ""
                        }
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-muted-foreground">
                      Must be unique. Example: ABC-1234
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <Input placeholder="Red" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="originalPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Original Price (per day)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currencyOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="seats"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Seats</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="20" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter the number of seats in the car
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="SUV">SUV</SelectItem>
                        <SelectItem value="Economy">Economy</SelectItem>
                        <SelectItem value="Midsize">Midsize</SelectItem>
                        <SelectItem value="Luxury">Luxury</SelectItem>
                        <SelectItem value="Electric">Electric</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pickup Location</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Airport Terminal 1"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Where customers can pick up this car
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Discount Section */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={hasDiscount}
                  onCheckedChange={(checked) => {
                    const enabled = !!checked
                    setHasDiscount(enabled)
                    if (!enabled) {
                      setDiscountPercentage(0)
                      form.setValue("discountPercentage", undefined)
                      form.setValue("priceAfterDiscount", undefined)
                      setPriceAfterDiscount(Number(watchedPrice) || 0)
                    }
                  }}
                />
                <Label htmlFor="hasDiscount" className="font-medium">
                  Apply Discount
                </Label>
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
                            const value = Number.parseInt(e.target.value, 10)
                            if (!isNaN(value) && value >= 0 && value <= 100) {
                              applyPercentageDiscount(value)
                            }
                          }}
                          className="w-24"
                        />
                        <Percent className="h-4 w-4" />
                      </div>
                    )}
                  </div>

                  {Number(watchedPrice) > 0 && discountPercentage > 0 && (
                    <div className="bg-muted p-4 rounded-md space-y-2">
                      <div className="flex justify-between">
                        <span>Original Price:</span>
                        <span>
                          ${Number(watchedPrice).toFixed(2)}{" "}
                          {form.getValues("currency")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Discount ({discountPercentage}%):</span>
                        <span className="text-red-500">
                          -$
                          {(
                            (Number(watchedPrice) * discountPercentage) /
                            100
                          ).toFixed(2)}{" "}
                          {form.getValues("currency")}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Price After Discount:</span>
                        <span className="text-green-600">
                          $
                          {typeof priceAfterDiscount === "number"
                            ? priceAfterDiscount.toFixed(2)
                            : "0.00"}{" "}
                          {form.getValues("currency")}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="isAvailable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Available for booking</FormLabel>
                    <FormDescription>
                      Make this car available for customers to book
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* Car Images Upload Section */}
            <ImageUploadSection
              label="Car Images"
              images={images}
              setImages={setImages}
              previewUrls={imagePreviews}
              setPreviewUrls={setImagePreviews}
              uploadError={uploadError}
              setUploadError={setUploadError}
            />

            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/${locale}/agency/dashboard/cars`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Saving..."
                  : isEditing
                    ? "Update Car"
                    : "Create Car"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
