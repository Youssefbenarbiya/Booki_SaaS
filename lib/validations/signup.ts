import { z } from "zod"

// Helper functions for common validations
const getPasswordSchema = (type: "password" | "confirmPassword") =>
  z
    .string({ required_error: `${type} is required` })
    .min(8, `${type} must be atleast 8 characters`)
    .max(32, `${type} can not exceed 32 characters`)

const getEmailSchema = () =>
  z
    .string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email")

const getNameSchema = () =>
  z
    .string({ required_error: "Name is required" })
    .min(1, "Name is required")
    .max(50, "Name must be less than 50 characters")

const getPhoneNumberSchema = () =>
  z
    .string()
    .min(10, "Phone number must be at least 10 digits long")
    .max(15, "Phone number must not exceed 15 digits")
    .regex(
      /^\+?[0-9]*$/,
      "Phone number must be a valid format (e.g., +1234567890)"
    )

export const signUpSchema = z
  .object({
    name: getNameSchema(),
    email: getEmailSchema(),
    password: getPasswordSchema("password"),
    confirmPassword: getPasswordSchema("confirmPassword"),
    phoneNumber: getPhoneNumberSchema(),
    isAgency: z.boolean().default(false),
    agencyName: z.string().optional(),
  })
  // Check that passwords match
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  // Conditionally require agencyName if isAgency is true
  .refine(
    (data) =>
      !data.isAgency || (data.agencyName && data.agencyName.length >= 3),
    {
      message: "Agency name is required and must be at least 3 characters",
      path: ["agencyName"],
    }
  )
