"use server"

import { cars } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { CarFormValues } from "../../app/agency/dashboard/cars/types"
import db from "@/db/drizzle"

export async function getCars() {
  try {
    const allCars = await db.query.cars.findMany({
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
    const newCar = await db
      .insert(cars)
      .values({
        model: data.model,
        brand: data.brand,
        year: data.year,
        plateNumber: data.plateNumber,
        color: data.color,
        price: data.price,
        isAvailable: data.isAvailable,
        images: data.images || [], // Make sure this matches your DB column type
      })
      .returning()

    revalidatePath("/agency/dashboard/cars")
    return { car: newCar[0] }
  } catch (error) {
    console.error("Failed to create car:", error)
    throw new Error("Failed to create car")
  }
}

export async function updateCar(id: number, data: CarFormValues) {
  try {
    const updatedCar = await db
      .update(cars)
      .set({
        model: data.model,
        brand: data.brand,
        year: data.year,
        plateNumber: data.plateNumber,
        color: data.color,
        price: data.price,
        isAvailable: data.isAvailable,
        images: data.images, // Make sure this matches your DB column type
        updatedAt: new Date(),
      })
      .where(eq(cars.id, id))
      .returning()

    revalidatePath("/agency/dashboard/cars")
    return { car: updatedCar[0] }
  } catch (error) {
    console.error(`Failed to update car with ID ${id}:`, error)
    throw new Error("Failed to update car")
  }
}

export async function deleteCar(id: number) {
  try {
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
 * Gets the availability information for a specific car
 * Returns an array of booked date ranges that should be disabled in the calendar
 */
export async function getCarAvailability(carId: number) {
  try {
    if (!carId) {
      throw new Error("Car ID is required")
    }

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
