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
export const signUpSchema = object({
  name: getNameSchema(),
  email: getEmailSchema(),
  password: getPasswordSchema("password"),
  confirmPassword: getPasswordSchema("confirmPassword"),
  phoneNumber: getPhoneNumberSchema(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

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
//export const updateUserInfoSchema = z.object({
//   name: z
//     .string()
//     .min(2, "Name must be at least 2 characters")
//     .max(20, "Name must be at most 20 characters")
//     .optional(),
//   email: getEmailSchema().optional(),
//   image: z.string().optional(),
//   password: z
//     .string()
//     .min(8, "Password must be at least 8 characters")
//     .optional(),
//   newPassword: z
//     .string()
//     .min(8, "Password must be at least 8 characters")
//     .optional(),
//   currentPassword: z.string().optional(),
//   phoneNumber: getPhoneNumberSchema().optional(),
//   address: z
//     .string()
//     .min(5, "Address must be at least 5 characters")
//     .max(100, "Address must be at most 100 characters")
//     .optional(),
// })
// 

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