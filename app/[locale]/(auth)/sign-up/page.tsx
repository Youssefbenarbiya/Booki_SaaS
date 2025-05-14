/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PhoneInput } from "@/components/ui/phone-input";
import CountrySelect from "@/components/ui/country-select";
import RegionSelect from "@/components/ui/region-select";
import Link from "next/link";
import { signUpSchema, createSignUpSchema } from "@/lib/validations/signup";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { authClient } from "@/auth-client";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Building2, User, Car, Plane } from "lucide-react";
import Image from "next/image";
import GoogleSignIn from "../(Oauth)/google";
import FacebookSignIn from "../(Oauth)/facebook";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

export default function SignUp() {
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState<"selection" | "customer" | "agency">(
    "selection"
  );
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const { toast } = useToast();

  // Get translations
  const t = useTranslations("signUp");
  // Create schema with translated error messages
  const localizedSignUpSchema = createSignUpSchema((key) => t(key));

  const params = useParams();
  const currentLocale = (params.locale as string) || "en";

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(localizedSignUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
      country: "",
      region: "",
      isAgency: false,
      agencyName: "",
      agencyType: undefined,
    },
    mode: "onChange",
  });

  // When user type changes, update the isAgency field
  const handleUserTypeChange = (type: "customer" | "agency") => {
    setUserType(type);
    if (type === "agency") {
      form.setValue("isAgency", true);
    } else {
      form.setValue("isAgency", false);
      form.setValue("agencyName", "");
      form.setValue("agencyType", undefined);
    }
  };

  // Watch isAgency value to conditionally render agency name field
  const isAgency = form.watch("isAgency");

  // Watch the country field to update the region selector
  const country = form.watch("country");

  // Update selectedCountry state when country changes
  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);
  };

  const onSubmit = async (values: z.infer<typeof signUpSchema>) => {
    try {
      setPending(true);

      // Prepare data for user creation - include phoneNumber!
      const userData = {
        email: values.email,
        password: values.password,
        name: values.name,
        phoneNumber: values.phoneNumber, // This was missing!
      };

      // If registering as agency, save that info for later
      const isAgencySignUp = values.isAgency && values.agencyName;

      console.log("Sending user data to auth client:", userData);

      // First, register the user through authClient
      await authClient.signUp.email(userData as any, {
        onSuccess: async (userData) => {
          console.log("User created successfully:", userData);

          // If this is an agency registration, proceed with second step
          if (isAgencySignUp) {
            try {
              // Wait a moment to ensure the user is in the database
              await new Promise((resolve) => setTimeout(resolve, 2000));

              // Second step: create agency record with our custom API
              const agencyData = {
                email: values.email,
                name: values.name,
                phoneNumber: values.phoneNumber,
                role: "agency owner",
                agencyName: values.agencyName,
                agencyType: values.agencyType,
                country: values.country,
                region: values.region,
              };

              console.log("Sending agency data to API:", agencyData);

              const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(agencyData),
              });

              const responseData = await response.json();
              console.log("Agency registration response:", responseData);

              if (!response.ok) {
                throw new Error(
                  responseData.error || "Failed to create agency"
                );
              }

              // Success message for agency
              toast({
                title: t("agencyAccountCreated"),
                description: t("agencyVerificationEmail"),
              });
            } catch (agencyError) {
              console.error("Agency registration error:", agencyError);
              toast({
                title: t("agencySetupFailed"),
                description: t("accountCreatedAgencyFailed"),
                variant: "destructive",
              });
            }
          } else {
            // For customer accounts, also register with our API to ensure consistency
            try {
              const customerData = {
                email: values.email,
                name: values.name,
                phoneNumber: values.phoneNumber,
                country: values.country,
                region: values.region,
                role: "customer",
              };

              // Register the customer with our custom API
              await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(customerData),
              });

              // Regular user success message
              toast({
                title: t("accountCreated"),
                description: t("verificationEmail"),
              });
            } catch (customerError) {
              console.error("Customer registration error:", customerError);
              // Still show success since the auth account was created
              toast({
                title: t("accountCreated"),
                description: t("verificationEmail"),
              });
            }
          }
        },
        onError: (error: any) => {
          console.error("User creation error:", error);
          toast({
            title: t("accountCreationFailed"),
            description: (error as any)?.message || t("errors.auth.generic"),
            variant: "destructive",
          });
        },
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: t("somethingWentWrong"),
        description: error?.message || t("errors.auth.generic"),
        variant: "destructive",
      });
    } finally {
      setPending(false);
    }
  };

  // Add a function to handle form submission via button click
  const handleFormSubmit = () => {
    // Trigger form validation and submission
    form.handleSubmit((values) => {
      onSubmit(values);
    })();
  };

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
            <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
            <p className="text-gray-600">{t("chooseRegistration")}</p>
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
              <h2 className="text-2xl font-semibold mb-2">
                {t("customerAccount")}
              </h2>

              <ul className="text-left mt-6 space-y-2">
                <li className="flex items-center">
                  <span className="bg-blue-100 rounded-full p-1 mr-2">✓</span>
                  {t("customerFeature1")}
                </li>
                <li className="flex items-center">
                  <span className="bg-blue-100 rounded-full p-1 mr-2">✓</span>
                  {t("customerFeature2")}
                </li>
                <li className="flex items-center">
                  <span className="bg-blue-100 rounded-full p-1 mr-2">✓</span>
                  {t("customerFeature3")}
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
              <h2 className="text-2xl font-semibold mb-2">
                {t("agencyAccount")}
              </h2>

              <ul className="text-left mt-6 space-y-2">
                <li className="flex items-center">
                  <span className="bg-orange-100 rounded-full p-1 mr-2">✓</span>
                  {t("agencyFeature1")}
                </li>
                <li className="flex items-center">
                  <span className="bg-orange-100 rounded-full p-1 mr-2">✓</span>
                  {t("agencyFeature2")}
                </li>
                <li className="flex items-center">
                  <span className="bg-orange-100 rounded-full p-1 mr-2">✓</span>
                  {t("agencyFeature3")}
                </li>
              </ul>
            </motion.div>
          </div>

          <div className="text-center mt-8 text-sm text-gray-600">
            {t("alreadyHaveAccount")}{" "}
            <Link
              href={`/${currentLocale}/sign-in`}
              className="text-orange-500 hover:underline"
            >
              {t("loginLink")}
            </Link>
          </div>
        </motion.div>
      </div>
    );
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
            height={400}
            className="object-cover rounded-2xl shadow-lg max-h-[450px]"
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
              {t("backToSelection")}
            </motion.button>
            <h2 className="text-3xl font-semibold">
              {t("registerAs")}{" "}
              {userType === "agency" ? t("anAgency") : t("aCustomer")}
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
                        {t("name")}
                      </FormLabel>
                      <FormControl className="flex-1">
                        <Input
                          placeholder={t("namePlaceholder")}
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
                        {t("email")}
                      </FormLabel>
                      <FormControl className="flex-1">
                        <Input
                          type="email"
                          placeholder={t("emailPlaceholder")}
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
                        {t("phoneNumber")}
                      </FormLabel>
                      <FormControl className="flex-1">
                        <PhoneInput
                          placeholder={t("phoneNumberPlaceholder")}
                          value={field.value}
                          onChange={field.onChange}
                          defaultCountry="TN"
                          international
                          className="h-12 w-full"
                        />
                      </FormControl>
                    </div>
                    <FormMessage className="ml-[136px]" />
                  </FormItem>
                )}
              />

              {/* Country Select */}
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center w-full gap-4">
                      <FormLabel className="text-sm font-medium min-w-[120px]">
                        {t("country") || "Country"}
                      </FormLabel>
                      <FormControl className="flex-1">
                        <CountrySelect
                          placeholder={
                            t("countryPlaceholder") || "Select your country"
                          }
                          value={field.value}
                          onChange={(value) => {
                            field.onChange(value);
                            handleCountryChange(value);
                          }}
                          priorityOptions={["TN", "US", "GB", "FR"]}
                          className="h-12 w-full"
                        />
                      </FormControl>
                    </div>
                    <FormMessage className="ml-[136px]" />
                  </FormItem>
                )}
              />

              {/* Region Select - only show if country is selected */}
              {form.watch("country") && (
                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center w-full gap-4">
                        <FormLabel className="text-sm font-medium min-w-[120px]">
                          {t("region") || "Region"}
                        </FormLabel>
                        <FormControl className="flex-1">
                          <RegionSelect
                            countryCode={form.watch("country")}
                            placeholder={
                              t("regionPlaceholder") || "Select your region"
                            }
                            value={field.value}
                            onChange={field.onChange}
                            className="h-12 w-full"
                          />
                        </FormControl>
                      </div>
                      <FormMessage className="ml-[136px]" />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center w-full gap-4">
                      <FormLabel className="text-sm font-medium min-w-[120px]">
                        {t("password")}
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
                        {t("confirmPassword")}
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
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="agencyName"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center w-full gap-4">
                            <FormLabel className="text-sm font-medium min-w-[120px]">
                              {t("agencyName")}
                            </FormLabel>
                            <FormControl className="flex-1">
                              <Input
                                placeholder={t("agencyNamePlaceholder")}
                                {...field}
                                className={`h-12 w-full ${
                                  form.formState.errors.agencyName
                                    ? "border-red-500 focus-visible:ring-red-500"
                                    : field.value && field.value.length >= 3
                                      ? "border-green-500 focus-visible:ring-green-500"
                                      : ""
                                }`}
                                onBlur={(e) => {
                                  field.onBlur();
                                  if (
                                    isAgency &&
                                    (!e.target.value ||
                                      e.target.value.length < 3)
                                  ) {
                                    form.setError("agencyName", {
                                      message: t("agencyNameError"),
                                    });
                                  } else {
                                    form.clearErrors("agencyName");
                                  }
                                }}
                              />
                            </FormControl>
                          </div>
                          <FormMessage className="ml-[136px]" />
                        </FormItem>
                      )}
                    />

                    {/* Agency Type Radio Group */}
                    <FormField
                      control={form.control}
                      name="agencyType"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <div className="flex items-center w-full gap-4">
                            <FormLabel className="text-sm font-medium min-w-[120px]">
                              {t("agencyType") || "Agency Type"}
                            </FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-1 ml-2"
                              >
                                <div className="flex items-center space-x-3 space-y-0">
                                  <RadioGroupItem
                                    value="travel"
                                    id="travel"
                                    className="text-orange-500"
                                  />
                                  <div className="flex items-center gap-2">
                                    <Plane className="h-4 w-4 text-orange-500" />
                                    <label
                                      htmlFor="travel"
                                      className="text-sm font-medium"
                                    >
                                      {t("travelAgency") || "Travel Agency"}
                                    </label>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-3 space-y-0">
                                  <RadioGroupItem
                                    value="car_rental"
                                    id="car_rental"
                                    className="text-orange-500"
                                  />
                                  <div className="flex items-center gap-2">
                                    <Car className="h-4 w-4 text-orange-500" />
                                    <label
                                      htmlFor="car_rental"
                                      className="text-sm font-medium"
                                    >
                                      {t("carRentalAgency") ||
                                        "Car Rental Agency"}
                                    </label>
                                  </div>
                                </div>
                              </RadioGroup>
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
                  {t("agreeToTerms")}{" "}
                  <Link
                    href={`/${currentLocale}/terms`}
                    className="text-orange-500 hover:underline"
                  >
                    {t("terms")} {t("and")} {t("privacyPolicies")}
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
                    {t("processing")}
                  </span>
                ) : (
                  t("registerButton")
                )}
              </button>

              <div className="text-center text-sm text-gray-600">
                {t("alreadyHaveAccount")}{" "}
                <Link
                  href={`/${currentLocale}/sign-in`}
                  className="text-orange-500 hover:underline"
                >
                  {t("loginLink")}
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
                        {t("orSignUpWith")}
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
  );
}
