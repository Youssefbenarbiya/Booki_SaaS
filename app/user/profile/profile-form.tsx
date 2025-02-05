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
import type { z } from "zod"
import { useToast } from "@/hooks/use-toast"
import type { Session } from "@/lib/auth/type"
import { updateUserInfoSchema } from "@/lib/zod"
import { authClient } from "@/auth-client"
import { useState } from "react"

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
      phoneNumber: user.phoneNumber || "",
      address: user.address || "",
    },
  })

  async function onSubmit(fieldName: keyof UserFormType) {
    try {
      setSubmittingField(fieldName)
      const fieldValue = form.getValues(fieldName)
      const values = { [fieldName]: fieldValue }

      await authClient.updateUser(values)
      toast({
        title: "Success!",
        description: `Your ${fieldName} has been updated.`,
      })
    } catch (error) {
      toast({
        title: "Error!",
        description: `${error}`,
      })
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
          layout="fill"
          objectFit="cover"
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
              layout="fill"
              objectFit="cover"
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
              my accommodations
            </button>
          </nav>
        </div>

        {activeTab === "account" && (
          <div>
            <Form {...form}>
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <FormLabel className="text-sm font-medium">
                          Name
                        </FormLabel>
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
                        onClick={() => onSubmit("name")}
                        disabled={submittingField === "name"}
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

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <FormLabel className="text-sm font-medium">
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input type="email" {...field} className="mt-1" />
                        </FormControl>
                        <FormMessage />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onSubmit("email")}
                        disabled={submittingField === "email"}
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

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <FormLabel className="text-sm font-medium">
                          Password
                        </FormLabel>
                        <FormControl>
                          <Input type="password" {...field} className="mt-1" />
                        </FormControl>
                        <FormMessage />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onSubmit("password")}
                        disabled={submittingField === "password"}
                        className="mt-7"
                      >
                        {submittingField === "password" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Change"
                        )}
                      </Button>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <FormLabel className="text-sm font-medium">
                          Phone number
                        </FormLabel>
                        <FormControl>
                          <Input {...field} className="mt-1" />
                        </FormControl>
                        <FormMessage />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onSubmit("phoneNumber")}
                        disabled={submittingField === "phoneNumber"}
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

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <FormLabel className="text-sm font-medium">
                          Address
                        </FormLabel>
                        <FormControl>
                          <Input {...field} className="mt-1" />
                        </FormControl>
                        <FormMessage />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onSubmit("address")}
                        disabled={submittingField === "address"}
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
                  alt="Greece"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg"
                />
              </div>
              <div className="relative aspect-square">
                <Image
                  src="/assets/ProfileBanner.jpg"
                  alt="France"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg"
                />
              </div>
              <div className="relative aspect-square">
                <Image
                  src="/assets/ProfileBanner.jpg"
                  alt="Arc de Triomphe"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg"
                />
              </div>
              <div className="relative aspect-square">
                <Image
                  src="/assets/ProfileBanner.jpg"
                  alt="Switzerland"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg"
                />
              </div>
              <div className="relative aspect-square">
                <Image
                  src="/assets/ProfileBanner.jpg"
                  alt="Beach"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg"
                />
              </div>
              <div className="relative aspect-square">
                <Image
                  src="/assets/ProfileBanner.jpg"
                  alt="Italy"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg"
                />
              </div>
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
