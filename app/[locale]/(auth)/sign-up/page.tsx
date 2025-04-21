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
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { signUpSchema } from "@/lib/validations/signup"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { authClient } from "@/auth-client"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, Building2, User } from "lucide-react"
import Image from "next/image"
import GoogleSignIn from "../(Oauth)/google"
import FacebookSignIn from "../(Oauth)/facebook"
import { motion, AnimatePresence } from "framer-motion"

export default function SignUp() {
  const [pending, setPending] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [userType, setUserType] = useState<"selection" | "customer" | "agency">(
    "selection"
  )
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

  // When user type changes, update the isAgency field
  const handleUserTypeChange = (type: "customer" | "agency") => {
    setUserType(type)
    if (type === "agency") {
      form.setValue("isAgency", true)
    } else {
      form.setValue("isAgency", false)
      form.setValue("agencyName", "")
    }
  }

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
            // For customer accounts, also register with our API to ensure consistency
            try {
              const customerData = {
                email: values.email,
                name: values.name,
                phoneNumber: values.phoneNumber,
                role: "customer",
              }

              // Register the customer with our custom API
              await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(customerData),
              })

              // Regular user success message
              toast({
                title: "Account created",
                description:
                  "Your account has been created. Check your email for a verification link.",
              })
            } catch (customerError) {
              console.error("Customer registration error:", customerError)
              // Still show success since the auth account was created
              toast({
                title: "Account created",
                description:
                  "Your account has been created. Check your email for a verification link.",
              })
            }
          }
        },
        onError: (error: any) => {
          console.error("User creation error:", error)
          toast({
            title: "Account creation failed",
            description:
              (error as any)?.message ||
              "Something went wrong creating your account.",
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

  // Add a function to handle form submission via button click
  const handleFormSubmit = () => {
    // Trigger form validation and submission
    form.handleSubmit((values) => {
      onSubmit(values)
    })()
  }

  // Selection screen - first step
  if (userType === "selection") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <motion.div
          className="w-full max-w-4xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-2">Create a new account</h1>
            <p className="text-gray-600">Choose how you want to register</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Customer Box */}
            <motion.div
              className="border rounded-xl p-8 text-center hover:shadow-lg cursor-pointer bg-white transition-all flex flex-col items-center justify-center"
              whileHover={{
                scale: 1.03,
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleUserTypeChange("customer")}
            >
              <div className="bg-blue-50 p-4 rounded-full mb-4">
                <User className="h-12 w-12 text-blue-500" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Customer Account</h2>

              <ul className="text-left mt-6 space-y-2">
                <li className="flex items-center">
                  <span className="bg-blue-100 rounded-full p-1 mr-2">✓</span>
                  Book trips , accommodations & cars
                </li>
                <li className="flex items-center">
                  <span className="bg-blue-100 rounded-full p-1 mr-2">✓</span>
                  Save favorite destinations
                </li>
                <li className="flex items-center">
                  <span className="bg-blue-100 rounded-full p-1 mr-2">✓</span>
                  Track booking history
                </li>
              </ul>
            </motion.div>

            {/* Agency Box */}
            <motion.div
              className="border rounded-xl p-8 text-center hover:shadow-lg cursor-pointer bg-white transition-all flex flex-col items-center justify-center"
              whileHover={{
                scale: 1.03,
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleUserTypeChange("agency")}
            >
              <div className="bg-orange-50 p-4 rounded-full mb-4">
                <Building2 className="h-12 w-12 text-orange-500" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Agency Account</h2>

              <ul className="text-left mt-6 space-y-2">
                <li className="flex items-center">
                  <span className="bg-orange-100 rounded-full p-1 mr-2">✓</span>
                  List and manage offerings
                </li>
                <li className="flex items-center">
                  <span className="bg-orange-100 rounded-full p-1 mr-2">✓</span>
                  Manage bookings & employees
                </li>
                <li className="flex items-center">
                  <span className="bg-orange-100 rounded-full p-1 mr-2">✓</span>
                  Dashboard analytics
                </li>
              </ul>
            </motion.div>
          </div>

          <div className="text-center mt-8 text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/en/sign-in"
              className="text-orange-500 hover:underline"
            >
              Login
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  // Registration form screens (agency or customer)
  return (
    <motion.div
      className="flex min-h-screen bg-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Left side - Image */}
      <div className="w-[40%] p-8 hidden lg:flex justify-center items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Image
            src={
              userType === "agency"
                ? "/assets/registerImg.jpg"
                : "/assets/loginImg.jpg"
            }
            alt="Forest view from below"
            width={500}
            height={400} // Reduced from 700 to 400
            className="object-cover rounded-2xl shadow-lg max-h-[450px]" // Added max-h class to control height
            priority
          />
        </motion.div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-[60%] px-6 flex items-center justify-center">
        <motion.div
          className="max-w-md w-full py-8 px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Title */}
          <div className="mb-6">
            <motion.button
              onClick={() => setUserType("selection")}
              className="flex items-center text-gray-600 mb-4 hover:text-gray-800 transition-colors"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to selection
            </motion.button>
            <h2 className="text-3xl font-semibold">
              Register as {userType === "agency" ? "an Agency" : "a Customer"}
            </h2>
          </div>

          <Form {...form}>
            <form
              id="signup-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
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

              {/* Agency fields only shown when in agency registration mode */}
              <AnimatePresence>
                {userType === "agency" && (
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

              <button
                type="button"
                className="w-full py-3 bg-orange-500 text-white rounded-md font-medium hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                disabled={pending}
                onClick={handleFormSubmit}
              >
                {pending ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Create account"
                )}
              </button>

              <div className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/en/sign-in"
                  className="text-orange-500 hover:underline"
                >
                  Login
                </Link>
              </div>

              {/* Only show OAuth options for customers */}
              {userType === "customer" && (
                <>
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
                </>
              )}
            </form>
          </Form>
        </motion.div>
      </div>
    </motion.div>
  )
}
