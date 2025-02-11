/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, ChangeEvent } from "react"
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
import type { Session } from "@/lib/auth/type"
import { updateUserInfoSchema } from "@/lib/validations/zod"
import { z } from "zod"
import { handleImageUpload } from "@/actions/upload-image"
import { authClient } from "@/auth-client"

type UserFormType = z.infer<typeof updateUserInfoSchema>

export function UpdateUserInfo({ session }: { session: Session }) {
  const { user } = session
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("account")
  const [submittingField, setSubmittingField] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

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
    },
  })

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
  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto px-4 relative -mt-24">
        <div className="flex items-end mb-6">
          {/* Profile image container */}
          <div className="relative">
            <div className="rounded-full w-32 h-32 bg-gray-200 border-4 border-white overflow-hidden relative">
              <Image
                // Use the local preview if available, otherwise fallback to user.image
                src={
                  imagePreview ||
                  user.image ||
                  "/assets/ProfileBanner.jpg?height=128&width=128"
                }
                alt="Profile"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              {/* Overlay edit button */}
            </div>
            <div>
              <label className="absolute bottom-0 right-0 bg-orange-600 rounded-full p-1 shadow cursor-pointer">
                <Pen className="w-4 h-4 text-gray-700" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>
          <div className="ml-4 mb-2">
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>

        <div className="border-b mb-8">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab("account")}
              className={`pb-4 px-2 ${
                activeTab === "account"
                  ? "border-b-2 border-black font-medium"
                  : "text-gray-600"
              }`}
            >
              Account
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`pb-4 px-2 ${
                activeTab === "history"
                  ? "border-b-2 border-black font-medium"
                  : "text-gray-600"
              }`}
            >
              History
            </button>
            <button
              onClick={() => setActiveTab("accommodations")}
              className={`pb-4 px-2 ${
                activeTab === "accommodations"
                  ? "border-b-2 border-black font-medium"
                  : "text-gray-600"
              }`}
            >
              My Accommodations
            </button>
          </nav>
        </div>

        {activeTab === "account" && (
          <div>
            <Form {...form}>
              <div className="space-y-6">
                {/* Name Field */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John Doe"
                            {...field}
                            className="mt-1"
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={submittingField === "name"}
                        onClick={() => onSubmit("name")}
                        className="mt-7"
                      >
                        {submittingField === "name" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Change"
                        )}
                      </Button>
                    </FormItem>
                  )}
                />

                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} className="mt-1" />
                        </FormControl>
                        {!user.emailVerified && (
                          <p className="text-sm text-yellow-600 mt-1">
                            Pending verification – check your inbox
                          </p>
                        )}
                        <FormMessage />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={
                          submittingField === "email" ||
                          !form.formState.dirtyFields.email
                        }
                        onClick={() => onSubmit("email")}
                        className="mt-7"
                      >
                        {submittingField === "email" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Change"
                        )}
                      </Button>
                    </FormItem>
                  )}
                />

                {/* Current Password Field (for email/password changes) */}
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} className="mt-1" />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                {/* New Password Field */}
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} className="mt-1" />
                        </FormControl>
                        <FormMessage />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={submittingField === "newPassword"}
                        onClick={() => onSubmit("newPassword")}
                        className="mt-7"
                      >
                        {submittingField === "newPassword" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Change"
                        )}
                      </Button>
                    </FormItem>
                  )}
                />

                {/* Phone Number Field */}
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} className="mt-1" />
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

                {/* Address Field */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input {...field} className="mt-1" />
                        </FormControl>
                        <FormMessage />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={submittingField === "address"}
                        onClick={() => onSubmit("address")}
                        className="mt-7"
                      >
                        {submittingField === "address" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Change"
                        )}
                      </Button>
                    </FormItem>
                  )}
                />
              </div>
            </Form>
          </div>
        )}

        {activeTab === "history" && (
          <div className="mt-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              <div className="relative aspect-square">
                <Image
                  src="/assets/ProfileBanner.jpg"
                  alt="History 1"
                  fill
                  style={{ objectFit: "cover" }}
                  className="rounded-lg"
                />
              </div>
              {/* Additional history images as needed */}
            </div>
          </div>
        )}

        {activeTab === "accommodations" && (
          <div className="mt-8">
            <p>My accommodations content here</p>
          </div>
        )}
      </div>
    </div>
  )

  async function onSubmit(fieldName: keyof UserFormType) {
    try {
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
}
