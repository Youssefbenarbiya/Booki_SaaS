"use client"

import { Loader2 } from "lucide-react"
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
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import type { Session } from "@/lib/auth/type"
import { updateUserInfoSchema } from "@/lib/zod"
import { authClient } from "@/auth-client"
import { z } from "zod"

type UserFormType = z.infer<typeof updateUserInfoSchema>

export function UpdateUserInfo({ session }: { session: Session }) {
  const { user } = session
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("account")
  const [submittingField, setSubmittingField] = useState<string | null>(null)

  const form = useForm<UserFormType>({
    resolver: zodResolver(updateUserInfoSchema),
    defaultValues: {
      image: user.image || "",
      name: user.name || "",
      email: user.email || "",
      // Never prefill password fields.
      password: "",
      newPassword: "",
      currentPassword: "",
      phoneNumber: user.phoneNumber || "",
      address: user.address || "",
    },
  })

  async function onSubmit(fieldName: keyof UserFormType) {
    try {
      // Trigger validation for the field (or fields) involved.
      let valid = await form.trigger(fieldName)

      // If updating password (via newPassword) also validate currentPassword.
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
        const newEmail = form.getValues("email") || ""
        await authClient.changeEmail({ newEmail })
        toast({
          title: "Check your inbox",
          description:
            "A verification link was sent to your new email address.",
        })
      } else if (fieldName === "newPassword") {
        const newPassword = form.getValues("newPassword") || ""
        const currentPassword = form.getValues("currentPassword") || ""
        await authClient.changePassword({ newPassword, currentPassword })
        toast({
          title: "Success!",
          description: "Your password has been updated successfully.",
        })
      } else {
        const fieldValue = form.getValues(fieldName)
        const values = { [fieldName]: fieldValue }
        await authClient.updateUser(values)
        toast({
          title: "Success!",
          description: `Your ${fieldName} has been updated.`,
        })
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errMsg = error.message || error
      // Check if the error message suggests the current password is wrong.
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

  return (
    <div className="w-full">
      <div className="relative h-48 w-full">
        <Image
          src="/assets/ProfileBanner.jpg"
          alt="Profile banner"
          fill
          style={{ objectFit: "cover" }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 relative -mt-24">
        <div className="flex items-end mb-6">
          <div className="rounded-full w-32 h-32 bg-gray-200 border-4 border-white overflow-hidden relative">
            <Image
              src={
                user.image || "/assets/ProfileBanner.jpg?height=128&width=128"
              }
              alt="Profile"
              fill
              style={{ objectFit: "cover" }}
            />
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
                      {/* IMPORTANT: Use "newPassword" here */}
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

                {/* Image Field */}
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <FormLabel>Profile Image URL</FormLabel>
                        <FormControl>
                          <Input {...field} className="mt-1" />
                        </FormControl>
                        <FormMessage />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={submittingField === "image"}
                        onClick={() => onSubmit("image")}
                        className="mt-7"
                      >
                        {submittingField === "image" ? (
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
}
