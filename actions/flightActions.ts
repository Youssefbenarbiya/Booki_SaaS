// actions/flightActions.ts
"use server"

import db from "../db/drizzle"
import { flight } from "@/db/schema"
import { flightSchema, FlightInput } from "@/lib/validations/flightSchema"
import { eq } from "drizzle-orm"

// Create a new flight.
export async function createFlight(data: FlightInput) {
  try {
    // Parse data: the output will be of type Flight (with dates as Date)
    const validatedData = flightSchema.parse(data)

    const newFlight = await db
      .insert(flight)
      .values({
        id: crypto.randomUUID(),
        flightNumber: validatedData.flightNumber,
        departureAirport: validatedData.departureAirport,
        arrivalAirport: validatedData.arrivalAirport,
        departureTime: validatedData.departureTime,
        arrivalTime: validatedData.arrivalTime,
        price: validatedData.price.toString(),
        availableSeats: validatedData.availableSeats,
        images: validatedData.images || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    return newFlight[0]
  } catch (error) {
    console.error("Error creating flight:", error)
    throw error
  }
}

// Update an existing flight.
export async function updateFlight(flightId: string, data: FlightInput) {
  const validatedData = flightSchema.parse(data)

  const updatedFlight = await db
    .update(flight)
    .set({
      flightNumber: validatedData.flightNumber,
      departureAirport: validatedData.departureAirport,
      arrivalAirport: validatedData.arrivalAirport,
      departureTime: validatedData.departureTime,
      arrivalTime: validatedData.arrivalTime,
      price: validatedData.price.toString(), // Convert to string
      availableSeats: validatedData.availableSeats,
      images: validatedData.images || [], // Add support for images array
      updatedAt: new Date(),
    })
    .where(eq(flight.id, flightId))
    .returning()

  return updatedFlight[0]
}

// Delete a flight by its ID.
export async function deleteFlight(flightId: string) {
  const deletedFlight = await db
    .delete(flight)
    .where(eq(flight.id, flightId))
    .returning()
  return deletedFlight[0]
}

// Get all flights.
export async function getFlights() {
  const flights = await db.select().from(flight)
  return flights
}

// Get a single flight by ID.
export async function getFlightById(flightId: string) {
  const flights = await db.select().from(flight).where(eq(flight.id, flightId))
  const flightData = flights[0]

  if (!flightData) return null
  return {
    ...flightData,
    price: Number(flightData.price),
  }
}
