/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import nodemailer from "nodemailer"

// Define the validation schema for the form
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const formSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  countryCode: z.string().min(1, "Country code is required"),
  phone: z.string().min(6, "Phone number is required"),
  subject: z.enum(["general-inquiry", "Hotels", "Trips"]),
  message: z.string().min(10, "Message is required"),
})

export type Inputs = z.infer<typeof formSchema>

export const sendContactForm = async (values: Inputs) => {
  try {
    // 1. Create a Nodemailer transporter object
    const transporter = nodemailer.createTransport({
      service: "gmail", // Use your email service; here we use Gmail as an example
      auth: {
        user: process.env.EMAIL_FROM, // Your email address
        pass: process.env.EMAIL_PASSWORD, // Your email password or app password
      },
    })

    // 2. Define the email options
    const mailOptions = {
      from: process.env.EMAIL_FROM, // Sender address
      to: "youssefbenarbia345@gmail.com", // Set default email here
      subject: `Contact Form Submission - ${values.subject}`,
      html: `
        <h1>Contact Form Submission</h1>
        <p><strong>First Name:</strong> ${values.firstName}</p>
        <p><strong>Last Name:</strong> ${values.lastName}</p>
        <p><strong>Phone:</strong> ${values.countryCode} ${values.phone}</p>
        <p><strong>Subject:</strong> ${values.subject}</p>
        <p><strong>Message:</strong></p>
        <p>${values.message}</p>
      `,
    }

    // 3. Send the email
    await transporter.sendMail(mailOptions)
    console.log("Contact form sent successfully!")

    // Optionally revalidate the contact page if needed
    revalidatePath("/contact")

    return { success: true, message: "Message sent successfully!" }
  } catch (error: any) {
    console.error("Error sending contact form:", error)
    return {
      success: false,
      message: "An error occurred while sending the message.",
    }
  }
}
