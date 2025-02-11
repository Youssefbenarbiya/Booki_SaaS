"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

// UI Components (adjust these imports to your UI library)
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"

// Import the server action to send the email
import { sendContactForm } from "./actions"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

// Define the form schema (same as in actions.ts)
const formSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is required"),
  subject: z.enum(["general-inquiry", "Hotels", "Trips"]),
  message: z.string().min(10, "Message is required"),
})

export function ContactForm() {
  // State to store a success or error message after submission
  const [submitMessage, setSubmitMessage] = useState<string | null>(null)

  // Set up React Hook Form with Zod validation and default values for all fields.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      subject: "general-inquiry", // Default subject
      message: "",
    },
  })

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const result = await sendContactForm(values)
    if (result?.success) {
      form.reset() // Clear the form fields
      setSubmitMessage(result.message) // Show success message
    } else {
      setSubmitMessage(result?.message || "An error occurred.") // Show error message
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Display submission message */}
        {submitMessage && (
          <div className="p-4 rounded-md bg-green-100 text-green-700">
            {submitMessage}
          </div>
        )}

        {/* Name fields */}
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="First Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Last Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Email and Phone fields */}
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Email" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Phone Number" type="tel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Subject selection */}
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="general-inquiry"
                      id="general-inquiry"
                    />
                    <Label htmlFor="general-inquiry">general-inquiry</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Hotels" id="Hotels" />
                    <Label htmlFor="Hotels">Hotels</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Trips" id="Trips" />
                    <Label htmlFor="Trips">Trips</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Message field */}
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Write your message..."
                  className="min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit button */}
        <Button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600"
        >
          Send Message
        </Button>
      </form>
    </Form>
  )
}
