import { z } from "zod";
const getPhoneNumberSchema = () =>
  z
    .string()
    .min(8, "Phone number must be at least 8 digits long")
    .max(15, "Phone number must not exceed 15 digits")
    .regex(
      /^\+?[0-9]*$/,
      "Phone number must be a valid format (e.g., +1234567890)"
    );
export const updateUserInfoSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(2, { message: "Name must be at least 2 characters" })
    .max(20, { message: "Name must be at most 20 characters" })
    .optional(),
  email: z.string().email("Invalid email").optional(),
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
  country: z.string({ required_error: "Country is required" }).optional(),
  region: z.string({ required_error: "Region is required" }).optional(),
});
