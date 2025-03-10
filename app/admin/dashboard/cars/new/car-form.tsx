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
import { createCar, updateCar } from "../../../../../actions/carActions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// --- Image upload imports ---
import { ImageUploadSection } from "@/components/ImageUploadSection"
import { fileToFormData } from "@/lib/utils"
import { uploadImages } from "@/actions/uploadActions"
// ----------------------------------

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
  price: z.coerce.number().positive("Price must be positive"),
  isAvailable: z.boolean().default(true),
})

type CarFormProps = {
  initialData?: CarType
  isEditing?: boolean
}

export function CarForm({ initialData, isEditing = false }: CarFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Image upload state variables
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [uploadError, setUploadError] = useState<string>("")

  // When editing, load existing image URLs into preview state
  useEffect(() => {
    if (initialData?.images && Array.isArray(initialData.images)) {
      setImagePreviews(initialData.images)
    }
  }, [initialData])

  const form = useForm<z.infer<typeof carFormSchema>>({
    resolver: zodResolver(carFormSchema),
    defaultValues: initialData
      ? {
          brand: initialData.brand,
          model: initialData.model,
          year: initialData.year,
          plateNumber: initialData.plateNumber,
          color: initialData.color,
          price: initialData.price,
          isAvailable: Boolean(initialData.isAvailable),
        }
      : {
          brand: "",
          model: "",
          year: new Date().getFullYear(),
          plateNumber: "",
          color: "",
          price: 0,
          isAvailable: true,
        },
  })

  async function onSubmit(values: z.infer<typeof carFormSchema>) {
    try {
      setIsLoading(true)

      // Upload new images (files) and get their URLs
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
          return
        }
      }

      // Preserve existing images.
      // Instead of checking for "http", we now assume any preview that doesn't start with "blob:"
      // is an existing image URL saved in the database.
      const existingImageUrls = imagePreviews.filter(
        (url) => !url.startsWith("blob:")
      )
      const finalImageUrls = [...existingImageUrls, ...newImageUrls]

      const formattedValues = { ...values, images: finalImageUrls }

      if (isEditing && initialData) {
        await updateCar(initialData.id, formattedValues)
        toast.success("Car updated successfully")
      } else {
        await createCar(formattedValues)
        toast.success("Car created successfully")
      }

      router.push("/admin/dashboard/cars")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error(isEditing ? "Failed to update car" : "Failed to create car")
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
                      <Input placeholder="ABC-1234" {...field} />
                    </FormControl>
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

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (per day)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>Price per day in dollars</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                onClick={() => router.push("/admin/dashboard/cars")}
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