/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import nodemailer from "nodemailer"

// Define the validation schema for the form
const formSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  countryCode: z.string().min(1, "Country code is required"),
  phone: z.string().min(6, "Phone number is required"),
  subject: z.enum(["general-inquiry", "Hotels", "Trips", "Cars"]),
  message: z.string().min(10, "Message is required"),
})

export type Inputs = z.infer<typeof formSchema>

export const sendContactForm = async (values: Inputs) => {
  try {
    // Validate the input data using the schema
    const validatedValues = formSchema.parse(values)

    // 1. Create a Nodemailer transporter object
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASSWORD,
      },
    })
    const htmlContent = `
  <h1>Contact Form Submission</h1>
  <p><strong>First Name:</strong> ${validatedValues.firstName}</p>
  <p><strong>Last Name:</strong> ${validatedValues.lastName}</p>
  <p><strong>Phone:</strong> ${validatedValues.countryCode} ${validatedValues.phone}</p>
  <p><strong>Subject:</strong> ${validatedValues.subject}</p>
  <p><strong>Message:</strong></p>
  <p>${validatedValues.message}</p>
`
    // 2. Define the email options using validated values
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: "youssefbenarbia345@gmail.com",
      subject: `Contact Form Submission - ${validatedValues.subject}`,
      html: htmlContent,
    }
    // 3. Send the email
    await transporter.sendMail(mailOptions)
    console.log("Contact form sent successfully!")

    revalidatePath("/contact")

    return { success: true, message: "Message sent successfully!" }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      // Handle validation errors from Zod
      console.error("Validation error:", error.errors)
      return {
        success: false,
        message: "Invalid form data.",
      }
    }
    console.error("Error sending contact form:", error)
    return {
      success: false,
      message: "An error occurred while sending the message.",
    }
  }
}
