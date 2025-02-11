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
import { Eye, EyeOff } from "lucide-react"
import Image from "next/image"
import GoogleSignIn from "../(Oauth)/google"
import FacebookSignIn from "../(Oauth)/facebook"

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
    },
  })

  const onSubmit = async (values: z.infer<typeof signUpSchema>) => {
    await authClient.signUp.email(
      {
        email: values.email,
        password: values.password,
        name: values.name,
        phoneNumber: values.phoneNumber,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      {
        onRequest: () => {
          setPending(true)
        },
        onSuccess: () => {
          toast({
            title: "Account created",
            description:
              "Your account has been created. Check your email for a verification link.",
          })
        },
        onError: (ctx) => {
          console.log("error", ctx)
          toast({
            title: "Something went wrong",
            description: ctx.error.message ?? "Something went wrong.",
          })
        },
      }
    )
    setPending(false)
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
