/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { createSignInSchema, signInSchema } from "@/lib/validations/signin";
import type { z } from "zod";
import { authClient } from "@/auth-client";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import LoadingButton from "@/components/loading-button";
import type { ErrorContext } from "@better-fetch/fetch";
import GoogleSignIn from "../(Oauth)/google";
import FacebookSignIn from "../(Oauth)/facebook";
import { useTranslations } from "next-intl";
import LanguageSelector from "@/components/language-selector";

// Define the type directly from the schema
type SignInSchemaType = z.infer<typeof signInSchema>;

export default function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const currentLocale = (params.locale as string) || "en";

  // Extract callbackUrl from the query parameters; default to "/" if not present
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const { toast } = useToast();
  const [pendingCredentials, setPendingCredentials] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Start with false for server rendering, then update in useEffect
  const [rememberMe, setRememberMe] = useState(false);

  // Form default values
  const defaultEmail = "";

  const slides = [
    "/assets/loginImg.jpg",
    "/assets/registerImg.jpg",
    // Add more slide images here
  ];

  // Setup slide rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  // Check localStorage after component mounts (client-side only)
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setRememberMe(true);
    }
  }, []);

  // Use next-intl for translations
  const t = useTranslations("signIn");

  // Create a schema with translated error messages
  const localizedSignInSchema = createSignInSchema((key) => t(key));

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SignInSchemaType>({
    resolver: zodResolver(localizedSignInSchema),
    defaultValues: {
      email: defaultEmail,
      password: "",
    },
  });

  // Update email field when component mounts (client-side only)
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setValue("email", rememberedEmail);
    }
  }, [setValue]);

  const handleCredentialsSignIn = async (values: SignInSchemaType) => {
    await authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
      },
      {
        onRequest: () => {
          setPendingCredentials(true);
        },
        onSuccess: async () => {
          if (rememberMe) {
            localStorage.setItem("rememberedEmail", values.email);
          } else {
            localStorage.removeItem("rememberedEmail");
          }

          router.push(callbackUrl);
          router.refresh();
        },
        onError: (ctx: ErrorContext) => {
          console.log(ctx);
          toast({
            title: "Error",
            description: t("errors.auth.invalid"),
            variant: "destructive",
          });
        },
      }
    );
    setPendingCredentials(false);
  };

  return (
    <div className="flex min-h-screen ml-[200px] mt-[50px]">
      {/* Left Column */}
      <div className="w-full md:w-1/ px-8 pb-8 x-col justify-center">
        <div className="max-w-[480px] mx-auto w-full">
          <div className="flex justify-between items-center mb-12">
            <div>
              <Image
                src="/assets/icons/logo.png"
                alt="Logo"
                width={64}
                height={64}
                className="rounded-lg"
                priority
              />
              <h1 className="text-[1.75rem] font-serif mb-1">{t("title")}</h1>
              <p className="text-gray-600 text-sm">{t("subtitle")}</p>
            </div>
            <LanguageSelector />
          </div>

          <form
            onSubmit={handleSubmit(handleCredentialsSignIn)}
            className="space-y-4"
          >
            {/* Email Input */}
            <div className="space-y-1">
              <Input
                type="email"
                placeholder={t("emailPlaceholder")}
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
                placeholder={t("passwordPlaceholder")}
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
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) =>
                    setRememberMe(checked as boolean)
                  }
                />
                <label
                  htmlFor="remember"
                  className="text-sm text-gray-600 leading-none"
                >
                  {t("rememberMe")}
                </label>
              </div>
              <Link
                href="/forgot-password"
                className="text-[#FF5C00] text-sm hover:underline"
              >
                {t("forgotPassword")}
              </Link>
            </div>

            {/* Login Button */}
            <LoadingButton pending={pendingCredentials}>
              {t("loginButton")}
            </LoadingButton>

            <div className="text-center text-sm">
              {t("noAccount")}{" "}
              <Link href="/sign-up" className="text-[#FF5C00] hover:underline">
                {t("register")}
              </Link>
            </div>

            {/* OR Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-gray-500">
                  {t("orLoginWith")}
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
      <div className="md:w-1/2 h-[520px] relative w-[30%] mr-[200px]">
        <div className="absolute inset-y-0 -left-8 right-8 rounded-xl overflow-hidden">
          <Image
            src={slides[currentSlide] || "/assets/loginImg.jpg"}
            alt="Login banner"
            width={400}
            height={600}
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
  );
}
