"use server"

import { cars, agencies } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import type { CarFormValues } from "../../app/agency/dashboard/cars/types"
import db from "@/db/drizzle"
import { auth } from "@/auth"
import { headers } from "next/headers"

// Helper function to get the current session
async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user) {
    throw new Error("Unauthorized: No session found")
  }
  return session
}

// Helper function to get the current user's agency ID
async function getAgencyId() {
  try {
    const session = await getSession()

    // Get the agency directly - more reliable than going through the user relation
    const agency = await db.query.agencies.findFirst({
      where: eq(agencies.userId, session.user.id),
    })

    if (!agency) {
      console.error("No agency found for user ID:", session.user.id)
      throw new Error("No agency found for this user")
    }

    return session.user.id // Using the user ID as agencyId as per your schema
  } catch (error) {
    console.error("Error getting agency ID:", error)
    throw error
  }
}

export async function getCars() {
  try {
    const agencyId = await getAgencyId()

    const allCars = await db.query.cars.findMany({
      where: (cars, { eq }) => eq(cars.agencyId, agencyId),
      orderBy: (cars, { desc }) => [desc(cars.createdAt)],
    })

    return { cars: allCars }
  } catch (error) {
    console.error("Failed to fetch cars:", error)
    throw new Error("Failed to fetch cars")
  }
}

export async function getCarById(id: number) {
  try {
    // Optionally, you can also check for session here if needed
    await getSession()

    const car = await db.query.cars.findFirst({
      where: eq(cars.id, id),
    })

    if (!car) {
      throw new Error("Car not found")
    }

    return { car }
  } catch (error) {
    console.error(`Failed to fetch car with ID ${id}:`, error)
    throw new Error("Failed to fetch car")
  }
}
export async function createCar(data: CarFormValues) {
  try {
    // Get session and agency for current user
    const agencyId = await getAgencyId()

    // Process discount fields: if discountPercentage exists and priceAfterDiscount is not provided, calculate it.
    const discountPercentage = data.discountPercentage;
    let priceAfterDiscount = data.priceAfterDiscount;
    if (discountPercentage !== undefined && discountPercentage !== null) {
      if (priceAfterDiscount === undefined || priceAfterDiscount === null) {
        priceAfterDiscount =
          data.originalPrice - (data.originalPrice * discountPercentage) / 100
      }
    }

    // Create car with discount fields included
    const newCar = await db
      .insert(cars)
      .values({
        model: data.model,
        brand: data.brand,
        year: data.year,
        plateNumber: data.plateNumber,
        color: data.color,
        originalPrice: data.originalPrice.toString(),
        discountPercentage: discountPercentage ?? undefined,
        priceAfterDiscount:
          priceAfterDiscount !== undefined && priceAfterDiscount !== null
            ? priceAfterDiscount.toString()
            : undefined,
        isAvailable: data.isAvailable ?? true,
        images: data.images || [],
        agencyId: agencyId,
      })
      .returning()


    revalidatePath("/agency/dashboard/cars")
    return { car: newCar[0] }
  } catch (error) {
    console.error("Failed to create car - detailed error:", error)

    // Duplicate plate number error handling
    const errorMessage = error instanceof Error ? error.message : String(error)
    if (
      (errorMessage.toLowerCase().includes("duplicate") &&
        errorMessage.toLowerCase().includes("plate_number")) ||
      (errorMessage.toLowerCase().includes("unique") &&
        errorMessage.toLowerCase().includes("plate_number"))
    ) {
      throw new Error(
        "Plate Number must be unique. This plate number is already registered."
      )
    }

    throw new Error("Failed to create car")
  }
}


export async function updateCar(id: number, data: CarFormValues) {
  try {
    // Ensure the user is authenticated before updating
    await getSession()

    // Process discount fields: calculate discounted price if needed.
    const discountPercentage = data.discountPercentage
    let priceAfterDiscount = data.priceAfterDiscount
    if (discountPercentage !== undefined && discountPercentage !== null) {
      if (priceAfterDiscount === undefined || priceAfterDiscount === null) {
        priceAfterDiscount =
          data.originalPrice - (data.originalPrice * discountPercentage) / 100
      }
    }

    const updatedCar = await db
      .update(cars)
      .set({
        model: data.model,
        brand: data.brand,
        year: data.year,
        plateNumber: data.plateNumber,
        color: data.color,
        originalPrice: data.originalPrice.toString(),
        discountPercentage: discountPercentage ?? null,
        priceAfterDiscount:
          priceAfterDiscount !== undefined && priceAfterDiscount !== null
            ? priceAfterDiscount.toString()
            : null,
        isAvailable: data.isAvailable,
        images: data.images, // Ensure this matches your DB column type
        updatedAt: new Date(),
      })
      .where(eq(cars.id, id))
      .returning()

    revalidatePath("/agency/dashboard/cars")
    return { car: updatedCar[0] }
  } catch (error) {
    console.error(`Failed to update car with ID ${id}:`, error)

    // Duplicate plate number error handling
    const errorMessage = error instanceof Error ? error.message : String(error)
    if (
      errorMessage.toLowerCase().includes("duplicate") &&
      errorMessage.toLowerCase().includes("plate_number")
    ) {
      throw new Error(
        "Plate Number must be unique. This plate number is already registered."
      )
    }

    throw new Error("Failed to update car")
  }
}

export async function deleteCar(id: number) {
  try {
    // Ensure the user is authenticated before deleting
    await getSession()

    await db.delete(cars).where(eq(cars.id, id))
    revalidatePath("/agency/dashboard/cars")
    return { success: true }
  } catch (error) {
    console.error(`Failed to delete car with ID ${id}:`, error)
    throw new Error("Failed to delete car")
  }
}

export async function searchCars(
  pickupLocation: string,
  pickupDate: string,
  returnDate: string
) {
  try {
    // No authentication required if searching public data
    const availableCars = await db.query.cars.findMany({
      where: (cars, { eq }) => eq(cars.isAvailable, true),
    })

    return availableCars
  } catch (error) {
    console.error("Failed to search cars:", error)
    return []
  }
}

/**
 * Gets the availability information for a specific car.
 * Returns an array of booked date ranges that should be disabled in the calendar.
 */
export async function getCarAvailability(carId: number) {
  try {
    if (!carId) {
      throw new Error("Car ID is required")
    }

    // Ensure the user is authenticated before fetching bookings
    await getSession()

    // Get all bookings for this car
    const bookings = await db.query.carBookings.findMany({
      where: (carBookings, { eq }) => eq(carBookings.car_id, carId),
      orderBy: (carBookings, { asc }) => [asc(carBookings.start_date)],
    })

    // Format the bookings into date ranges that should be disabled
    const bookedDateRanges = bookings.map((booking) => ({
      startDate: new Date(booking.start_date),
      endDate: new Date(booking.end_date),
      bookingId: booking.id,
    }))

    return {
      success: true,
      bookedDateRanges,
    }
  } catch (error) {
    console.error(`Failed to get availability for car ${carId}:`, error)
    return {
      success: false,
      error: "Failed to get car availability information",
      bookedDateRanges: [],
    }
  }
}
