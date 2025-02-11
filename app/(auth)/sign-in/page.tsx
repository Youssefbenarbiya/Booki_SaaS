"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import type { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FiEye, FiEyeOff } from "react-icons/fi"
import { signInSchema } from "@/lib/validations/zod"
import { authClient } from "@/auth-client"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import LoadingButton from "@/components/loading-button"
import type { ErrorContext } from "@better-fetch/fetch"
import GoogleSignIn from "../(Oauth)/google"
import FacebookSignIn from "../(Oauth)/facebook"

export default function SignIn() {
  const router = useRouter()
  const { toast } = useToast()
  const [pendingCredentials, setPendingCredentials] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    "/assets/loginImg.jpg",
    "/assets/registerImg.jpg",
    // Add more slide images here
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const handleCredentialsSignIn = async (
    values: z.infer<typeof signInSchema>
  ) => {
    await authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
      },
      {
        onRequest: () => {
          setPendingCredentials(true)
        },
        onSuccess: async () => {
          router.push("/")
          router.refresh()
        },
        onError: (ctx: ErrorContext) => {
          console.log(ctx)
          toast({
            title: "Something went wrong",
            description: ctx.error.message ?? "Something went wrong.",
            variant: "destructive",
          })
        },
      }
    )
    setPendingCredentials(false)
  }

  return (
    <div className="flex min-h-screen ml-[200px]  mt-[50px]">
      {/* Left Column */}
      <div className="w-full md:w-1/ px-8 pb-8 x-col justify-center ">
        <div className="max-w-[480px] mx-auto w-full">
          <div className="mb-12">
            <Image
              src="/assets/icons/logo.png"
              alt="Logo"
              width={64}
              height={64}
              className="rounded-lg"
            />
            <h1 className="text-[1.75rem] font-serif mb-1">Login</h1>
            <p className="text-gray-600 text-sm">
              Login to access your Ostelflow account
            </p>
          </div>

          <form
            onSubmit={handleSubmit(handleCredentialsSignIn)}
            className="space-y-4"
          >
            {/* Email Input */}
            <div className="space-y-1">
              <Input
                type="email"
                placeholder="john.doe@gmail.com"
                className="h-12 border-gray-300"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red-600 text-sm">{errors.email.message}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-1 relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                className="h-12 border-gray-300"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400"
              >
                {showPassword ? (
                  <FiEyeOff className="w-5 h-5" />
                ) : (
                  <FiEye className="w-5 h-5" />
                )}
              </button>
              {errors.password && (
                <p className="text-red-600 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <label
                  htmlFor="remember"
                  className="text-sm text-gray-600 leading-none"
                >
                  Remember me
                </label>
              </div>
              <Link
                href="/forgot-password"
                className="text-[#FF5C00] text-sm hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <LoadingButton pending={pendingCredentials}>Login</LoadingButton>

            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/sign-up" className="text-[#FF5C00] hover:underline">
                Register
              </Link>
            </div>

            {/* OR Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-gray-500">
                  Or login with
                </span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FacebookSignIn />
              <GoogleSignIn />
            </div>
          </form>
        </div>
      </div>

      {/* Right Column */}
      <div className="md:w-1/2  h-[520px]  relative w-[30%] mr-[200px]">
        <div className="absolute inset-y-0 -left-8 right-8 rounded-xl overflow-hidden">
          <Image
            src={slides[currentSlide] || "/assets/loginImg.jpg"}
            alt="Login banner"
            fill
            className="object-cover rounded-lg"
          />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSlide ? "bg-white" : "bg-white/50"
                }`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
