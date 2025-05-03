import { z } from "zod"

// Create a function that takes a translation function and returns the schema
export const createSignInSchema = (t: (key: string) => string) => {
  const getPasswordSchema = () =>
    z
      .string({ required_error: t("errors.password.required") })
      .min(8, t("errors.password.tooShort"))
      .max(32, t("errors.password.tooLong"))

  const getEmailSchema = () =>
    z
      .string({ required_error: t("errors.email.required") })
      .min(1, t("errors.email.required"))
      .email(t("errors.email.invalid"))

  return z.object({
    email: getEmailSchema(),
    password: getPasswordSchema(),
  })
}

// Default schema with English error messages (fallback)
export const signInSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email format"),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .max(32, "Password cannot exceed 32 characters"),
})

// Also move the forgot password and reset password schemas here
export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email"),
})

export const resetPasswordSchema = z
  .object({
    password: z
      .string({ required_error: "Password is required" })
      .min(8, "Password must be at least 8 characters")
      .max(32, "Password cannot exceed 32 characters"),
    confirmPassword: z
      .string({ required_error: "Password confirmation is required" })
      .min(8, "Password confirmation must be at least 8 characters")
      .max(32, "Password confirmation cannot exceed 32 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
