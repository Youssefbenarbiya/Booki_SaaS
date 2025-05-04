/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, type ChangeEvent, useEffect } from "react"
import { Loader2, Pen } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useToast } from "@/hooks/use-toast"
import { updateUserInfoSchema } from "@/lib/validations/zod"
import type { z } from "zod"
import { handleImageUpload } from "@/actions/upload-image"
import { authClient } from "@/auth-client"
import type { Session } from "@/auth"
import { PhoneInput } from "@/components/ui/phone-input"
import CountrySelect from "@/components/ui/country-select"
import RegionSelect from "@/components/ui/region-select"
import { updateUserProfile } from "@/actions/users/updateProfile"

type UserFormType = z.infer<typeof updateUserInfoSchema>

export function UpdateUserInfo({ session }: { session: Session }) {
  const { user } = session
  const { toast } = useToast()
  const [submittingField, setSubmittingField] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<string>(
    (user as any).country || ""
  )

  const form = useForm<UserFormType>({
    resolver: zodResolver(updateUserInfoSchema),
    defaultValues: {
      image: user.image || "",
      name: user.name || "",
      email: user.email || "",
      password: "",
      newPassword: "",
      currentPassword: "",
      phoneNumber: user.phoneNumber || "",
      address: user.address || "",
      country: (user as any).country || "",
      region: (user as any).region || "",
    },
  })

  // Add an effect to initialize the selectedCountry from the session
  useEffect(() => {
    // Set selectedCountry from user data
    if ((user as any).country) {
      setSelectedCountry((user as any).country)
    }
  }, [user])

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        setIsUploading(true)
        const file = e.target.files[0]
        const previewURL = URL.createObjectURL(file)
        setImagePreview(previewURL)

        const formData = new FormData()
        formData.append("file", file)

        const uploadedUrl = await handleImageUpload(formData)
        form.setValue("image", uploadedUrl)

        toast({
          title: "Success!",
          description: "Profile image updated.",
        })
        await authClient.updateUser({ image: uploadedUrl })
        console.log("Image uploaded:", uploadedUrl)
      } catch (error: any) {
        toast({
          title: "Upload Error",
          description: error.message,
          variant: "destructive",
        })
      } finally {
        setIsUploading(false)
      }
    }
  }

  // Function to update user location (country and region)
  const updateUserLocation = async () => {
    try {
      setSubmittingField("location")
      const country = form.getValues("country")
      const region = form.getValues("region")

      // Use the custom server action for updating location
      const result = await updateUserProfile({
        country,
        region,
      })

      if (result.success) {
        // Fetch the latest user data to refresh the form
        await fetchUserProfile()

        toast({
          title: "Success!",
          description: "Your location has been updated.",
        })
      } else {
        toast({
          title: "Error!",
          description: result.error || "Failed to update location.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error!",
        description: error.message || "Failed to update location.",
        variant: "destructive",
      })
    } finally {
      setSubmittingField(null)
    }
  }

  // Add a function to fetch the user profile data from the database
  const fetchUserProfile = async () => {
    try {
      // Get the user ID from the session
      const userId = user.id

      // Fetch the user from the database
      const response = await fetch(`/api/users/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch user profile")
      }

      const userData = await response.json()

      // Update the form values
      if (userData.country) {
        setSelectedCountry(userData.country)
        form.setValue("country", userData.country)
      }

      if (userData.region) {
        form.setValue("region", userData.region)
      }

      if (userData.phoneNumber) {
        form.setValue("phoneNumber", userData.phoneNumber)
      }

      if (userData.address) {
        form.setValue("address", userData.address)
      }

      return userData
    } catch (error) {
      console.error("Error fetching user profile:", error)
      return null
    }
  }

  async function onSubmit(fieldName: keyof UserFormType) {
    try {
      // For country and region, use the custom update function
      if (fieldName === "country" || fieldName === "region") {
        await updateUserLocation()
        return
      }

      // Validate the field (or fields) involved.
      let valid = await form.trigger(fieldName)
      if (fieldName === "newPassword") {
        const validCurrent = await form.trigger("currentPassword")
        valid = valid && validCurrent
      }
      if (!valid) {
        const errorMessage =
          form.formState.errors[fieldName]?.message ||
          (fieldName === "newPassword" &&
            form.formState.errors.currentPassword?.message) ||
          "Invalid input"
        toast({
          title: "Validation Error",
          description: errorMessage,
          variant: "destructive",
        })
        return
      }

      setSubmittingField(fieldName)

      if (fieldName === "email") {
        const newEmail = form.getValues("email")!
        await authClient.changeEmail({ newEmail })
        toast({
          title: "Check your inbox",
          description:
            "A verification link was sent to your new email address.",
        })
      } else if (fieldName === "newPassword") {
        const newPassword = form.getValues("newPassword")!
        const currentPassword = form.getValues("currentPassword")!
        await authClient.changePassword({ newPassword, currentPassword })
        toast({
          title: "Success!",
          description: "Your password has been updated successfully.",
        })
      } else if (fieldName === "phoneNumber") {
        // For phone number, use the custom server action
        const phoneNumber = form.getValues("phoneNumber")!
        const result = await updateUserProfile({ phoneNumber })

        if (result.success) {
          // Fetch the latest user data to refresh the form
          await fetchUserProfile()

          toast({
            title: "Success!",
            description: "Your phone number has been updated.",
          })
        } else {
          throw new Error(result.error || "Failed to update phone number")
        }
      } else {
        const fieldValue = form.getValues(fieldName)!
        const values = { [fieldName]: fieldValue }
        await authClient.updateUser(values)
        toast({
          title: "Success!",
          description: `Your ${fieldName} has been updated.`,
        })
      }
    } catch (error: any) {
      const errMsg = error.message || error
      if (errMsg.toLowerCase().includes("current password")) {
        toast({
          title: "Error!",
          description: "Current password is wrong.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error!",
          description: errMsg,
          variant: "destructive",
        })
      }
    } finally {
      setSubmittingField(null)
    }
  }

  const FormFieldWithButton = ({
    name,
    label,
    inputType = "text",
    placeholder = "",
    buttonText = "Change",
    disabled = false,
    onSubmit,
  }: {
    name: keyof UserFormType
    label: string
    inputType?: string
    placeholder?: string
    buttonText?: string
    disabled?: boolean
    onSubmit: () => void
  }) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <Input
                type={inputType}
                placeholder={placeholder}
                {...field}
                className="mt-1"
              />
            </FormControl>
            <FormMessage />
          </div>
          {buttonText && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || submittingField === name}
              onClick={onSubmit}
              className="mt-7"
            >
              {submittingField === name ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                buttonText
              )}
            </Button>
          )}
        </FormItem>
      )}
    />
  )

  return (
    <div className="w-full">
      <div className="max-w-3xl mx-auto px-4 relative -mt-20">
        <div className="flex items-end mb-6">
          <div className="relative">
            <div className="rounded-full w-24 h-24 bg-gray-200 border-4 border-white overflow-hidden relative">
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              )}
              <Image
                src={
                  imagePreview ||
                  user.image ||
                  "/assets/icons/logo-blank.png?height=128&width=128"
                }
                alt="Profile"
                fill
                sizes="128px"
                className="object-cover"
              />
            </div>
            <label
              className={`absolute bottom-0 right-0 ${
                isUploading ? "bg-gray-400" : "bg-orange-600"
              } rounded-full p-1 shadow ${
                isUploading ? "cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <Pen className="w-4 h-4 text-gray-700" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={isUploading}
              />
            </label>
          </div>
          <div className="ml-4 mb-2">
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
        </div>

        <Form {...form}>
          <div className="space-y-4">
            <FormFieldWithButton
              name="name"
              label="Name"
              placeholder="John Doe"
              onSubmit={() => onSubmit("name")}
            />

            <FormFieldWithButton
              name="email"
              label="Email"
              inputType="email"
              disabled={!form.formState.dirtyFields.email}
              onSubmit={() => onSubmit("email")}
            />
            {!user.emailVerified && (
              <p className="text-sm text-yellow-600 -mt-3 ml-1">
                Pending verification – check your inbox
              </p>
            )}

            <FormFieldWithButton
              name="currentPassword"
              label="Current Password"
              inputType="password"
              buttonText=""
              onSubmit={() => {}}
            />

            <FormFieldWithButton
              name="newPassword"
              label="New Password"
              inputType="password"
              onSubmit={() => onSubmit("newPassword")}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <PhoneInput
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                        defaultCountry="US"
                        className="mt-1"
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={submittingField === "phoneNumber"}
                    onClick={() => onSubmit("phoneNumber")}
                    className="mt-7"
                  >
                    {submittingField === "phoneNumber" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Change"
                    )}
                  </Button>
                </FormItem>
              )}
            />

            <FormFieldWithButton
              name="address"
              label="Address"
              onSubmit={() => onSubmit("address")}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <CountrySelect
                        placeholder="Select country"
                        className="mt-1"
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value)
                          setSelectedCountry(value)
                          form.setValue("region", "") // Reset region when country changes
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region</FormLabel>
                    <FormControl>
                      <RegionSelect
                        countryCode={selectedCountry}
                        placeholder="Select region"
                        className="mt-1"
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="md:col-span-2 w-fit ml-auto"
                disabled={submittingField === "location"}
                onClick={updateUserLocation}
              >
                {submittingField === "location" ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Update Location
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  )
}
