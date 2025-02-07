// lib/validations/flightSchema.ts
import * as z from "zod"

export const flightSchema = z.object({
  flightNumber: z.string().min(1, "Flight number is required"),
  departureAirport: z.string().min(1, "Departure airport is required"),
  arrivalAirport: z.string().min(1, "Arrival airport is required"),
  departureTime: z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof Date) return new Date(arg)
    return arg
  }, z.date()),
  arrivalTime: z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof Date) return new Date(arg)
    return arg
  }, z.date()),
  price: z.number().positive(),
  availableSeats: z.number().int().positive(),
  images: z.array(z.string()).max(10).optional(),
})

// Export types
export type FlightInput = z.infer<typeof flightSchema> // Raw input type
export type Flight = z.infer<typeof flightSchema> // Parsed type (dates as Date objects)
