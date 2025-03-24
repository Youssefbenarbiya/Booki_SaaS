/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import LoadingButton from "@/components/loading-button"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { signUpSchema } from "@/lib/validations/zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { authClient } from "@/auth-client"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, HelpCircle } from "lucide-react"
import Image from "next/image"
import GoogleSignIn from "../(Oauth)/google"
import FacebookSignIn from "../(Oauth)/facebook"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { motion, AnimatePresence } from "framer-motion"

export default function SignUp() {
  const [pending, setPending] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
      isAgency: false,
      agencyName: "",
    },
    mode: "onChange",
  })

  // Watch isAgency value to conditionally render agency name field
  const isAgency = form.watch("isAgency")

  const onSubmit = async (values: z.infer<typeof signUpSchema>) => {
    try {
      setPending(true)

      // Prepare data for user creation - include phoneNumber!
      const userData = {
        email: values.email,
        password: values.password,
        name: values.name,
        phoneNumber: values.phoneNumber, // This was missing!
      }

      // If registering as agency, save that info for later
      const isAgencySignUp = values.isAgency && values.agencyName

      console.log("Sending user data to auth client:", userData)

      // First, register the user through authClient
      await authClient.signUp.email(userData as any, {
        onSuccess: async (userData) => {
          console.log("User created successfully:", userData)

          // If this is an agency registration, proceed with second step
          if (isAgencySignUp) {
            try {
              // Wait a moment to ensure the user is in the database
              await new Promise((resolve) => setTimeout(resolve, 2000))

              // Second step: create agency record with our custom API
              const agencyData = {
                email: values.email,
                name: values.name,
                phoneNumber: values.phoneNumber,
                role: "agency owner",
                agencyName: values.agencyName,
              }

              console.log("Sending agency data to API:", agencyData)

              const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(agencyData),
              })

              const responseData = await response.json()
              console.log("Agency registration response:", responseData)

              if (!response.ok) {
                throw new Error(responseData.error || "Failed to create agency")
              }

              // Success message for agency
              toast({
                title: "Agency account created",
                description:
                  "Your agency account has been created. Check your email for a verification link.",
              })
            } catch (agencyError) {
              console.error("Agency registration error:", agencyError)
              toast({
                title: "Agency setup failed",
                description:
                  "Your account was created but we couldn't set up your agency. Please contact support.",
                variant: "destructive",
              })
            }
          } else {
            // Regular user success message
            toast({
              title: "Account created",
              description:
                "Your account has been created. Check your email for a verification link.",
            })
          }
        },
        onError: (error: any) => {
          console.error("User creation error:", error)
          toast({
            title: "Account creation failed",
            description:
              (error as any)?.message || "Something went wrong creating your account.",
            variant: "destructive",
          })
        },
      })
    } catch (error: any) {
      console.error("Registration error:", error)
      toast({
        title: "Something went wrong",
        description: error?.message || "Something went wrong.",
        variant: "destructive",
      })
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex min-h-screen ml-[200px] ">
      {/* Left side - Image */}
      <div className="w-[30%] ml-16">
        <Image
          src="/assets/registerImg.jpg"
          alt="Forest view from below"
          width={400}
          height={800}
          className="object-cover rounded-2xl"
          priority
        />
      </div>

      {/* Right side - Form */}
      <div className="w-1/2">
        <div className="max-w-md mx-auto w-full py-8">
          {/* Title */}
          <div>
            <h2 className="text-3xl font-semibold ">Register</h2>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center w-full gap-4">
                      <FormLabel className="text-sm font-medium min-w-[120px]">
                        Name
                      </FormLabel>
                      <FormControl className="flex-1">
                        <Input
                          placeholder="John Doe"
                          {...field}
                          className="h-12 w-full"
                        />
                      </FormControl>
                    </div>
                    <FormMessage className="ml-[136px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center w-full gap-4">
                      <FormLabel className="text-sm font-medium min-w-[120px]">
                        Email
                      </FormLabel>
                      <FormControl className="flex-1">
                        <Input
                          type="email"
                          placeholder="john.doe@gmail.com"
                          {...field}
                          className="h-12 w-full"
                        />
                      </FormControl>
                    </div>
                    <FormMessage className="ml-[136px]" />
                  </FormItem>
                )}
              />

              {/* Phone Number Input */}
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center w-full gap-4">
                      <FormLabel className="text-sm font-medium min-w-[120px]">
                        Phone Number
                      </FormLabel>
                      <FormControl className="flex-1">
                        <Input
                          type="tel"
                          placeholder="+216 4567890"
                          {...field}
                          className="h-12 w-full"
                        />
                      </FormControl>
                    </div>
                    <FormMessage className="ml-[136px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center w-full gap-4">
                      <FormLabel className="text-sm font-medium min-w-[120px]">
                        Password
                      </FormLabel>
                      <FormControl className="flex-1">
                        <div className="relative w-full">
                          <Input
                            type={showPassword ? "text" : "password"}
                            {...field}
                            className="h-12 w-full"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                    </div>
                    <FormMessage className="ml-[136px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center w-full gap-4">
                      <FormLabel className="text-sm font-medium min-w-[120px]">
                        Confirm Password
                      </FormLabel>
                      <FormControl className="flex-1">
                        <div className="relative w-full">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            {...field}
                            className="h-12 w-full"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                    </div>
                    <FormMessage className="ml-[136px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isAgency"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 ml-[136px]">
                    <FormControl>
                      <div className="relative">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="transition-all duration-200 data-[state=checked]:bg-orange-500"
                        />
                        {field.value && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                          >
                            <svg
                              className="h-3 w-3 text-white"
                              fill="none"
                              strokeWidth="2"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              ></path>
                            </svg>
                          </motion.div>
                        )}
                      </div>
                    </FormControl>
                    <div className="space-y-1 leading-none flex items-center">
                      <FormLabel className="mr-2">
                        Register as an Agency
                      </FormLabel>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              Register as an agency to list trips, manage
                              bookings, and earn commissions. You&apos;ll get
                              access to our agency dashboard.hboard.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </FormItem>
                )}
              />

              {/* Conditionally render agency name field */}
              <AnimatePresence>
                {isAgency && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FormField
                      control={form.control}
                      name="agencyName"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center w-full gap-4">
                            <FormLabel className="text-sm font-medium min-w-[120px]">
                              Agency Name
                            </FormLabel>
                            <FormControl className="flex-1">
                              <Input
                                placeholder="Your Agency Name"
                                {...field}
                                className={`h-12 w-full ${
                                  form.formState.errors.agencyName
                                    ? "border-red-500 focus-visible:ring-red-500"
                                    : field.value && field.value.length >= 3
                                    ? "border-green-500 focus-visible:ring-green-500"
                                    : ""
                                }`}
                                onBlur={(e) => {
                                  field.onBlur()
                                  if (
                                    isAgency &&
                                    (!e.target.value ||
                                      e.target.value.length < 3)
                                  ) {
                                    form.setError("agencyName", {
                                      message:
                                        "Agency name is required and must be at least 3 characters",
                                    })
                                  } else {
                                    form.clearErrors("agencyName")
                                  }
                                }}
                              />
                            </FormControl>
                          </div>
                          <FormMessage className="ml-[136px]" />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center space-x-2">
                <Checkbox id="terms" />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to all the{" "}
                  <Link href="#" className="text-orange-500 hover:underline">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link href="#" className="text-orange-500 hover:underline">
                    Privacy Policies
                  </Link>
                </label>
              </div>

              <LoadingButton pending={pending}>Create account</LoadingButton>

              <div className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/sign-in"
                  className="text-orange-500 hover:underline"
                >
                  Login
                </Link>
              </div>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Or Sign up with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FacebookSignIn />
                <GoogleSignIn />
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
