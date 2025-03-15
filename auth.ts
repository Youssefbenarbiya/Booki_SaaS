/* eslint-disable @typescript-eslint/no-explicit-any */
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import db from "./db/drizzle"
import { sendEmail } from "./actions/email"
import { openAPI } from "better-auth/plugins"

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  user: {
    additionalFields: {
      role: { type: "string", required: true, defaultValue: "customer" },
      phoneNumber: { type: "string", required: true },
      address: { type: "string", required: false },
      image: { type: "string", required: false },
    },
    changeEmail: {
      enabled: true,
      requireCurrentPassword: true,
      sendChangeEmailVerification: async ({ newEmail, url }) => {
        await sendEmail({
          to: newEmail,
          subject: "Verify your email change",
          text: `Click to verify email change: ${url}`,
        })
      },
    },
    changePassword: {
      enabled: true,
      requireCurrentPassword: true,
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    },
  },
  plugins: [openAPI()],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        text: `Password reset link: ${url}`,
      })
    },
    passwordPolicy: {
      minLength: 8,
      requireNumber: true,
      requireSymbol: true,
      requireUppercase: true,
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, token }) => {
      const verificationUrl = `${process.env.BETTER_AUTH_URL}/api/auth/verify-email?token=${token}&callbackURL=${process.env.EMAIL_VERIFICATION_CALLBACK_URL}`
      await sendEmail({
        to: user.email,
        subject: "Verify your email",
        text: `Click the link to verify your email of Booki : ${verificationUrl}`,
      })
    },
  },
})
export type Session = typeof auth.$Infer.Session

export type Auth = typeof auth
