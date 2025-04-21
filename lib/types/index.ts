import { z } from "zod"
import { signUpSchema } from "@/lib/validations/signup"
import {
  signInSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validations/signin"

export type SignUpSchemaType = z.infer<typeof signUpSchema>
export type SignInSchemaType = z.infer<typeof signInSchema>
export type ForgotPasswordSchemaType = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordSchemaType = z.infer<typeof resetPasswordSchema>

export type User = {
  id: string
  name: string
  email: string
  password?: string
  phoneNumber: string
  isAgency: boolean
  agencyName?: string
  image?: string
  createdAt: string
  updatedAt: string
}

export type SafeUser = Omit<User, "password">
