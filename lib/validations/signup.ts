import { z } from "zod";

// Helper functions with hardcoded messages (fallback)
const getPasswordSchema = (type: "password" | "confirmPassword") =>
  z
    .string({ required_error: `${type} is required` })
    .min(8, `${type} must be atleast 8 characters`)
    .max(32, `${type} can not exceed 32 characters`);

const getEmailSchema = () =>
  z
    .string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email");

const getNameSchema = () =>
  z
    .string({ required_error: "Name is required" })
    .min(1, "Name is required")
    .max(50, "Name must be less than 50 characters");

const getPhoneNumberSchema = () =>
  z
    .string()
    .min(8, "Phone number must be at least 8 digits long")
    .max(15, "Phone number must not exceed 15 digits")
    .regex(
      /^\+?[0-9]*$/,
      "Phone number must be a valid format (e.g., +1234567890)"
    );

// Default schema with English error messages
export const signUpSchema = z
  .object({
    name: getNameSchema(),
    email: getEmailSchema(),
    password: getPasswordSchema("password"),
    confirmPassword: getPasswordSchema("confirmPassword"),
    phoneNumber: getPhoneNumberSchema(),
    country: z.string().min(1, "Country is required"),
    region: z.string().optional(),
    isAgency: z.boolean().default(false),
    agencyName: z.string().optional(),
    agencyType: z.enum(["travel", "car_rental"]).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) =>
      !data.isAgency || (data.agencyName && data.agencyName.length >= 3),
    {
      message: "Agency name is required and must be at least 3 characters",
      path: ["agencyName"],
    }
  )
  .refine((data) => !data.isAgency || data.agencyType, {
    message: "Agency type is required",
    path: ["agencyType"],
  });

// Function to create a schema with translations
export const createSignUpSchema = (t: (key: string) => string) => {
  const getPasswordSchema = (type: "password" | "confirmPassword") => {
    const errorKey = type === "password" ? "password" : "confirmPassword";
    return z
      .string({
        required_error: t(`errors.${errorKey}.required`),
      })
      .min(8, t(`errors.${errorKey}.tooShort`))
      .max(32, t(`errors.${errorKey}.tooLong`));
  };

  const getEmailSchema = () =>
    z
      .string({ required_error: t("errors.email.required") })
      .min(1, t("errors.email.required"))
      .email(t("errors.email.invalid"));

  const getNameSchema = () =>
    z
      .string({ required_error: t("errors.name.required") })
      .min(1, t("errors.name.tooShort"))
      .max(50, t("errors.name.tooLong"));

  const getPhoneNumberSchema = () =>
    z
      .string()
      .min(8, t("errors.phoneNumber.tooShort"))
      .max(15, t("errors.phoneNumber.tooLong"))
      .regex(/^\+?[0-9]*$/, t("errors.phoneNumber.invalid"));

  return z
    .object({
      name: getNameSchema(),
      email: getEmailSchema(),
      password: getPasswordSchema("password"),
      confirmPassword: getPasswordSchema("confirmPassword"),
      phoneNumber: getPhoneNumberSchema(),
      country: z
        .string()
        .min(1, t("errors.country.required") || "Country is required"),
      region: z.string().optional(),
      isAgency: z.boolean().default(false),
      agencyName: z.string().optional(),
      agencyType: z.enum(["travel", "car_rental"]).optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("errors.confirmPassword.mismatch"),
      path: ["confirmPassword"],
    })
    .refine(
      (data) =>
        !data.isAgency || (data.agencyName && data.agencyName.length >= 3),
      {
        message: t("errors.agencyName.required"),
        path: ["agencyName"],
      }
    )
    .refine((data) => !data.isAgency || data.agencyType, {
      message: t("errors.agencyType.required") || "Agency type is required",
      path: ["agencyType"],
    });
};
