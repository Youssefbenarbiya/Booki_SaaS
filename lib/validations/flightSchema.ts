// lib/validations/flightSchema.ts
import { z } from "zod"

export const flightSchema = z.object({
  flightNumber: z.string().min(1, "Flight number is required"),
  departureAirport: z.string().min(1, "Departure airport is required"),
  arrivalAirport: z.string().min(1, "Arrival airport is required"),
  departureTime: z.preprocess((arg) => {
    if (arg instanceof Date) return arg
    if (typeof arg === "string") return new Date(arg)
    return arg
  }, z.date({ invalid_type_error: "Invalid departure date" })),
  arrivalTime: z.preprocess((arg) => {
    if (arg instanceof Date) return arg
    if (typeof arg === "string") return new Date(arg)
    return arg
  }, z.date({ invalid_type_error: "Invalid arrival date" })),
  price: z.number().nonnegative("Price must be non-negative"),
  availableSeats: z
    .number()
    .int()
    .nonnegative("Available seats must be non-negative"),
})

// Export types
export type FlightInput = z.input<typeof flightSchema> // Raw input type
export type Flight = z.infer<typeof flightSchema> // Parsed type (dates as Date objects)
