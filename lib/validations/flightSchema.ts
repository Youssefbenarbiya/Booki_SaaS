import { z } from "zod"

export const flightSchema = z.object({
  flightNumber: z.string().min(1, "Flight number is required"),
  departureAirport: z.string().min(1, "Departure airport is required"),
  arrivalAirport: z.string().min(1, "Arrival airport is required"),
  // Preprocess the input to convert string to Date
  departureTime: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) return new Date(arg)
  }, z.date({ invalid_type_error: "Invalid departure date" })),
  arrivalTime: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) return new Date(arg)
  }, z.date({ invalid_type_error: "Invalid arrival date" })),
  price: z.number().nonnegative("Price must be a non-negative number"),
  availableSeats: z
    .number()
    .int()
    .nonnegative("Available seats must be non-negative"),
})
