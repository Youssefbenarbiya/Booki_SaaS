/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { updateAgencyProfile } from "@/actions/agency/agencyActions"
import {
  Loader2,
  Upload,
  Camera,
  Building,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileText,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"
import Image from "next/image"
import { uploadImages } from "@/actions/uploadActions"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { PhoneInput } from "@/components/ui/phone-input"
import CountrySelect from "@/components/ui/country-select"
import RegionSelect from "@/components/ui/region-select"

const profileSchema = z.object({
  name: z.string().min(1, "Agency name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  address: z.string().optional(),
  logo: z.string().optional(),
  country: z.string().optional(),
  region: z.string().optional(),
  rneDocument: z.string().optional(),
  patenteDocument: z.string().optional(),
  cinDocument: z.string().optional(),
})

export type AgencyProfileFormValues = z.infer<typeof profileSchema>

interface AgencyProfileFormProps {
  initialData: any
}

export default function AgencyProfileForm({
  initialData,
}: AgencyProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [currentUploadField, setCurrentUploadField] = useState<string | null>(
    null
  )
  const [previewImage, setPreviewImage] = useState<string | null>(
    initialData?.logo || null
  )
  const [selectedCountry, setSelectedCountry] = useState<string>(
    initialData?.country || ""
  )

  // Set default values from initial data
  const form = useForm<AgencyProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: initialData?.agencyName || "",
      email: initialData?.contactEmail || "",
      phone: initialData?.contactPhone || "",
      address: initialData?.address || "",
      logo: initialData?.logo || "",
      country: initialData?.country || "",
      region: initialData?.region || "",
      rneDocument: initialData?.rneDocument || "",
      patenteDocument: initialData?.patenteDocument || "",
      cinDocument: initialData?.cinDocument || "",
    },
  })

  // Effect to update the form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.agencyName || "",
        email: initialData.contactEmail || "",
        phone: initialData.contactPhone || "",
        address: initialData.address || "",
        logo: initialData.logo || "",
        country: initialData.country || "",
        region: initialData.region || "",
        rneDocument: initialData.rneDocument || "",
        patenteDocument: initialData.patenteDocument || "",
        cinDocument: initialData.cinDocument || "",
      })
      setSelectedCountry(initialData.country || "")
    }
  }, [initialData, form])

  // Handle logo upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return

    const file = e.target.files[0]
    setIsUploading(true)

    try {
      // Validate file type
      if (!file.type.includes("image/")) {
        toast.error("Please upload an image file")
        return
      }

      // Create FormData and append file
      const formData = new FormData()
      formData.append("file", file)

      // Upload the image
      const logoUrl = await uploadImages(formData)

      // Update form value and preview
      form.setValue("logo", logoUrl)
      setPreviewImage(logoUrl)
      toast.success("Logo uploaded successfully")
    } catch (error) {
      console.error("Error uploading logo:", error)
      toast.error("Failed to upload logo. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  // Handle document upload
  const handleDocumentUpload = async (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | { target: { files: (File | null)[] } },
    fieldName: string
  ) => {
    if (!e.target.files?.[0]) {
      // If no file selected, this is a re-upload button click
      // Just open the file dialog
      const fileInput = document.getElementById(
        `${fieldName.replace("Document", "")}-upload`
      ) as HTMLInputElement
      if (fileInput) {
        fileInput.click()
      }
      return
    }

    const file = e.target.files[0]
    setIsUploading(true)
    setCurrentUploadField(fieldName)

    try {
      // Validate file type
      if (
        !file.type.includes("image/") &&
        !file.type.includes("application/pdf")
      ) {
        toast.error("Please upload an image or PDF file")
        return
      }

      // Create FormData and append file
      const formData = new FormData()
      formData.append("file", file)

      // Upload the document
      const documentUrl = await uploadImages(formData)

      // Update form value
      form.setValue(fieldName as any, documentUrl)
      toast.success(`Document uploaded successfully`)
    } catch (error) {
      console.error("Error uploading document:", error)
      toast.error("Failed to upload document. Please try again.")
    } finally {
      setIsUploading(false)
      setCurrentUploadField(null)
    }
  }

  // Handle form submission
  const onSubmit = async (data: AgencyProfileFormValues) => {
    setIsSubmitting(true)

    try {
      // Map form field names to agency schema field names
      const agencyData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        logo: data.logo,
        country: data.country,
        region: data.region,
        rneDocument: data.rneDocument,
        patenteDocument: data.patenteDocument,
        cinDocument: data.cinDocument,
        verificationSubmittedAt:
          data.rneDocument || data.patenteDocument || data.cinDocument
            ? new Date().toISOString()
            : undefined,
      }

      // Call the server action to update the agency profile
      const result = await updateAgencyProfile(agencyData)

      if (result.success) {
        toast.success("Profile updated successfully!")
      } else {
        toast.error(
          result.error || "Failed to update profile. Please try again."
        )
      }
    } catch (error) {
      console.error("Failed to update profile:", error)
      toast.error("Failed to update profile. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-100 dark:from-amber-900/20 dark:to-yellow-900/20">
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Building className="h-6 w-6 text-yellow-600" />
          Agency Profile
        </CardTitle>
        <CardDescription>
          Update your agency information and branding
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Logo Upload Section */}
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
              <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FormItem className="flex-shrink-0">
                    <FormLabel className="text-base font-medium mb-2 block">
                      Agency Logo
                    </FormLabel>
                    <div className="relative group">
                      {previewImage ? (
                        <div className="relative h-32 w-32 rounded-xl overflow-hidden border-2 border-yellow-200 shadow-sm">
                          <Image
                            src={previewImage || "/placeholder.svg"}
                            alt="Agency logo"
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Camera className="h-8 w-8 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="h-32 w-32 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center border-2 border-dashed border-gray-200">
                          <Upload className="h-10 w-10 text-gray-400" />
                        </div>
                      )}
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          id="logo-upload"
                          disabled={isUploading}
                        />
                      </FormControl>
                      <label
                        htmlFor="logo-upload"
                        className="absolute inset-0 cursor-pointer"
                      >
                        <span className="sr-only">Choose file</span>
                      </label>
                      {isUploading && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl">
                          <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
                        </div>
                      )}
                    </div>
                    <FormDescription className="text-xs mt-2 text-center">
                      Click to upload (200x200px)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex-1 space-y-2">
                <h3 className="text-sm font-medium text-gray-500">
                  Profile Visibility
                </h3>
                <p className="text-sm text-gray-600">
                  Your agency profile information will be visible to clients and
                  partners. Make sure to keep your contact details up to date.
                </p>
                <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 p-2 rounded-md">
                  <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></div>
                  Last updated: {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Agency Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-500" />
                      Agency Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter agency name"
                        {...field}
                        className="border-gray-200 focus-visible:ring-yellow-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter email address"
                        {...field}
                        className="border-gray-200 focus-visible:ring-yellow-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <PhoneInput
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                        defaultCountry="US"
                        className="border-gray-200 focus-visible:ring-yellow-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Address */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter address"
                        {...field}
                        className="border-gray-200 focus-visible:ring-yellow-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Country */}
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-500" />
                      Country
                    </FormLabel>
                    <FormControl>
                      <CountrySelect
                        placeholder="Select country"
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value)
                          setSelectedCountry(value)
                          form.setValue("region", "") // Reset region when country changes
                        }}
                        className="border-gray-200 focus-visible:ring-yellow-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Region */}
              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      Region
                    </FormLabel>
                    <FormControl>
                      <RegionSelect
                        countryCode={selectedCountry}
                        placeholder="Select region"
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value)
                        }}
                        className="border-gray-200 focus-visible:ring-yellow-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Verification Documents Section */}
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">
                Verification Documents
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Upload your business documents for agency verification. These
                documents will be reviewed by our admin team.
              </p>

              {initialData?.verificationStatus && (
                <div
                  className={`p-4 rounded-md mb-6 ${
                    initialData.verificationStatus === "approved"
                      ? "bg-green-50 border border-green-200"
                      : initialData.verificationStatus === "rejected"
                        ? "bg-red-50 border border-red-200"
                        : "bg-yellow-50 border border-yellow-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {initialData.verificationStatus === "approved" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : initialData.verificationStatus === "rejected" ? (
                      <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    ) : (
                      <div className="h-5 w-5 rounded-full bg-yellow-500 animate-pulse mt-0.5" />
                    )}
                    <div>
                      <h4 className="font-medium text-sm">
                        {initialData.verificationStatus === "approved"
                          ? "Agency Verified"
                          : initialData.verificationStatus === "rejected"
                            ? "Verification Rejected"
                            : "Verification Pending"}
                      </h4>
                      {initialData.verificationStatus === "rejected" &&
                        initialData.verificationRejectionReason && (
                          <p className="text-sm text-red-700 mt-1">
                            {initialData.verificationRejectionReason}
                          </p>
                        )}
                      {initialData.verificationStatus === "pending" && (
                        <p className="text-sm text-yellow-700 mt-1">
                          Your documents are being reviewed by our team.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* RNE Document Upload */}
                <FormField
                  control={form.control}
                  name="rneDocument"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        RNE Document
                      </FormLabel>
                      <div className="mt-2">
                        <div className="relative flex items-center justify-center h-32 w-full border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group">
                          {field.value ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="flex flex-col items-center">
                                <FileText className="h-10 w-10 text-green-500" />
                                <span className="text-xs text-gray-500 mt-2">
                                  Document uploaded
                                </span>
                                <a
                                  href={field.value}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-500 underline mt-1 z-10 relative"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  View document
                                </a>
                              </div>
                              <button
                                type="button"
                                className="absolute top-2 right-2 p-1 bg-gray-100 rounded-full hover:bg-gray-200 z-10"
                                onClick={() =>
                                  handleDocumentUpload(
                                    { target: { files: [null] } } as any,
                                    "rneDocument"
                                  )
                                }
                              >
                                <Upload className="h-4 w-4 text-gray-600" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <Upload className="h-8 w-8 text-gray-400 group-hover:text-gray-500" />
                              <span className="text-xs text-gray-500 mt-1">
                                Click to upload
                              </span>
                            </div>
                          )}
                          <FormControl>
                            <Input
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={(e) =>
                                handleDocumentUpload(e, "rneDocument")
                              }
                              className="hidden"
                              id="rne-upload"
                              disabled={isUploading}
                            />
                          </FormControl>
                          {!field.value && (
                            <label
                              htmlFor="rne-upload"
                              className="absolute inset-0 cursor-pointer"
                            >
                              <span className="sr-only">
                                Upload RNE document
                              </span>
                            </label>
                          )}
                          {isUploading &&
                            currentUploadField === "rneDocument" && (
                              <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                                <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
                              </div>
                            )}
                        </div>
                      </div>
                      <FormDescription className="text-xs mt-2">
                        Upload your National Registry of Enterprises document
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Patente Document Upload */}
                <FormField
                  control={form.control}
                  name="patenteDocument"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        Patente Document
                      </FormLabel>
                      <div className="mt-2">
                        <div className="relative flex items-center justify-center h-32 w-full border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group">
                          {field.value ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="flex flex-col items-center">
                                <FileText className="h-10 w-10 text-green-500" />
                                <span className="text-xs text-gray-500 mt-2">
                                  Document uploaded
                                </span>
                                <a
                                  href={field.value}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-500 underline mt-1 z-10 relative"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  View document
                                </a>
                              </div>
                              <button
                                type="button"
                                className="absolute top-2 right-2 p-1 bg-gray-100 rounded-full hover:bg-gray-200 z-10"
                                onClick={() =>
                                  handleDocumentUpload(
                                    { target: { files: [null] } } as any,
                                    "patenteDocument"
                                  )
                                }
                              >
                                <Upload className="h-4 w-4 text-gray-600" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <Upload className="h-8 w-8 text-gray-400 group-hover:text-gray-500" />
                              <span className="text-xs text-gray-500 mt-1">
                                Click to upload
                              </span>
                            </div>
                          )}
                          <FormControl>
                            <Input
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={(e) =>
                                handleDocumentUpload(e, "patenteDocument")
                              }
                              className="hidden"
                              id="patente-upload"
                              disabled={isUploading}
                            />
                          </FormControl>
                          {!field.value && (
                            <label
                              htmlFor="patente-upload"
                              className="absolute inset-0 cursor-pointer"
                            >
                              <span className="sr-only">
                                Upload Patente document
                              </span>
                            </label>
                          )}
                          {isUploading &&
                            currentUploadField === "patenteDocument" && (
                              <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                                <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
                              </div>
                            )}
                        </div>
                      </div>
                      <FormDescription className="text-xs mt-2">
                        Upload your Business License document
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* CIN Document Upload */}
                <FormField
                  control={form.control}
                  name="cinDocument"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        CIN Document
                      </FormLabel>
                      <div className="mt-2">
                        <div className="relative flex items-center justify-center h-32 w-full border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group">
                          {field.value ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="flex flex-col items-center">
                                <FileText className="h-10 w-10 text-green-500" />
                                <span className="text-xs text-gray-500 mt-2">
                                  Document uploaded
                                </span>
                                <a
                                  href={field.value}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-500 underline mt-1 z-10 relative"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  View document
                                </a>
                              </div>
                              <button
                                type="button"
                                className="absolute top-2 right-2 p-1 bg-gray-100 rounded-full hover:bg-gray-200 z-10"
                                onClick={() =>
                                  handleDocumentUpload(
                                    { target: { files: [null] } } as any,
                                    "cinDocument"
                                  )
                                }
                              >
                                <Upload className="h-4 w-4 text-gray-600" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <Upload className="h-8 w-8 text-gray-400 group-hover:text-gray-500" />
                              <span className="text-xs text-gray-500 mt-1">
                                Click to upload
                              </span>
                            </div>
                          )}
                          <FormControl>
                            <Input
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={(e) =>
                                handleDocumentUpload(e, "cinDocument")
                              }
                              className="hidden"
                              id="cin-upload"
                              disabled={isUploading}
                            />
                          </FormControl>
                          {!field.value && (
                            <label
                              htmlFor="cin-upload"
                              className="absolute inset-0 cursor-pointer"
                            >
                              <span className="sr-only">
                                Upload CIN document
                              </span>
                            </label>
                          )}
                          {isUploading &&
                            currentUploadField === "cinDocument" && (
                              <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                                <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
                              </div>
                            )}
                        </div>
                      </div>
                      <FormDescription className="text-xs mt-2">
                        Upload your National Identity Card document
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-6 py-2 h-11 rounded-lg shadow-sm transition-all hover:shadow"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving
                    Changes...
                  </>
                ) : (
                  "Update Profile"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
