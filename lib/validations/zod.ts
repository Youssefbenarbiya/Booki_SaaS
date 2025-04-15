/* eslint-disable @typescript-eslint/no-unused-vars */
import { object, string, z } from "zod"

const getPasswordSchema = (type: "password" | "confirmPassword") =>
  string({ required_error: `${type} is required` })
    .min(8, `${type} must be atleast 8 characters`)
    .max(32, `${type} can not exceed 32 characters`)

const getEmailSchema = () =>
  string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email")

const getNameSchema = () =>
  string({ required_error: "Name is required" })
    .min(1, "Name is required")
    .max(50, "Name must be less than 50 characters")

const getPhoneNumberSchema = () => {
  return string()
    .min(10, "Phone number must be at least 10 digits long")
    .max(15, "Phone number must not exceed 15 digits")
    .regex(
      /^\+?[0-9]*$/,
      "Phone number must be a valid format (e.g., +1234567890)"
    )
}
// export const signUpSchema = object({
//   name: getNameSchema(),
//   email: getEmailSchema(),
//   password: getPasswordSchema("password"),
//   confirmPassword: getPasswordSchema("confirmPassword"),
//   isAgency: z.boolean().optional(),
//   phoneNumber: getPhoneNumberSchema(),
//   agencyName: z
//     .string()
//     .min(3, { message: "Agency name must be at least 3 characters" })
//     .optional(),
// })
//   .refine((data) => data.password === data.confirmPassword, {
//     message: "Passwords don't match",
//     path: ["confirmPassword"],
//   })
//   .refine(
//     (data) => {
//       if (data.isAgency && (!data.agencyName || data.agencyName.length < 3)) {
//         return false
//       }
//       return true
//     },
//     {
//       message: "Agency name is required and must be at least 3 characters",
//       path: ["agencyName"],
//     }
//   )

export const signUpSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be 6 or more characters"),
    confirmPassword: z
      .string()
      .min(6, "Confirm Password must be 6 or more characters"),
    phoneNumber: z.string().min(1, "Phone number is required"),
    isAgency: z.boolean(),
    // Make agencyName optional
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
export const signInSchema = object({
  email: getEmailSchema(),
  password: getPasswordSchema("password"),
})

export const forgotPasswordSchema = object({
  email: getEmailSchema(),
})

export const resetPasswordSchema = object({
  password: getPasswordSchema("password"),
  confirmPassword: getPasswordSchema("confirmPassword"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const updateUserInfoSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(2, { message: "Name must be at least 2 characters" })
    .max(20, { message: "Name must be at most 20 characters" })
    .optional(),
  email: getEmailSchema().optional(),
  image: z.string().optional(),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters" })
    .optional(),
  newPassword: z
    .string({ required_error: "New password is required" })
    .min(8, { message: "New password must be at least 8 characters" })
    .optional(),
  currentPassword: z
    .string({ required_error: "Current password is required" })
    .min(1, { message: "Current password is required" })
    .optional(),
  phoneNumber: getPhoneNumberSchema().optional(),
  address: z
    .string({ required_error: "Address is required" })
    .min(5, { message: "Address must be at least 5 characters" })
    .max(100, { message: "Address must be at most 100 characters" })
    .optional(),
})
