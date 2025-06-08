"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { ParseError, parsePhoneNumber } from "libphonenumber-js";

// Import the server action to send the email
import { sendContactForm } from "./actions";

// Define the form schema using Zod
const formSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Valid email is required"),
  countryCode: z.string().min(1, "Country code is required"),
  phone: z.string().min(6, "Phone number is required"),
  subject: z.enum(["general-inquiry", "Hotels", "Trips", "Cars"]),
  message: z.string().min(10, "Message is required"),
});

export function ContactForm() {
  // State for submission feedback
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  // Initialize the form with React Hook Form and Zod validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      countryCode: "+216", // Default to Tunisia
      phone: "",
      subject: "general-inquiry",
      message: "",
    },
  });

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const result = await sendContactForm(values);
    if (result?.success) {
      form.reset(); // Reset form fields
      setSubmitMessage(result.message); // Show success message
    } else {
      setSubmitMessage(result?.message || "An error occurred."); // Show error message
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Submission feedback */}
        {submitMessage && (
          <div className="p-4 rounded-md bg-green-100 text-green-700">
            {submitMessage}
          </div>
        )}

        {/* First Name */}
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="First Name" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Last Name */}
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input placeholder="Last Name" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Your email" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Phone Number */}
        <FormItem>
          <FormLabel>Phone Number</FormLabel>
          <PhoneInput
            country={"tn"} // Default to Tunisia
            onChange={(value) => {
              const fullNumber = `+${value}`; // Prepend the "+" to the input value
              try {
                const phoneNumber = parsePhoneNumber(fullNumber);
                if (phoneNumber) {
                  // If parsing succeeds, update the form fields
                  form.setValue(
                    "countryCode",
                    `+${phoneNumber.countryCallingCode}`
                  );
                  form.setValue("phone", phoneNumber.nationalNumber);
                  form.clearErrors("phone"); // Remove any previous error messages
                }
              } catch (error) {
                // Handle the TOO_SHORT error gracefully
                if (
                  error instanceof ParseError &&
                  error.message === "TOO_SHORT"
                ) {
                  form.setError("phone", {
                    type: "manual",
                    message: "Phone number is too short",
                  });
                } else {
                  // Log other unexpected errors for debugging (optional)
                  console.error("Invalid phone number:", error);
                }
              }
            }}
          />
        </FormItem>
        {/* Subject */}
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-4" // Horizontal layout
                >
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="general-inquiry" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      General Inquiry
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="Hotels" />
                    </FormControl>
                    <FormLabel className="font-normal">Hotels</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="Trips" />
                    </FormControl>
                    <FormLabel className="font-normal">Trips</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="Cars" />
                    </FormControl>
                    <FormLabel className="font-normal">Cars</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />

        {/* Message */}
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea placeholder="Your message" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button type="submit">Send Message</Button>
      </form>
    </Form>
  );
}
