"use server"

import { revalidatePath } from "next/cache"
import db from "@/db/drizzle"
import { trips, cars, hotel } from "@/db/schema"
import { eq } from "drizzle-orm"
import { sendTripStatusNotification } from "./notificationActions"

export async function approveTrip(tripId: number) {
  try {
    await db
      .update(trips)
      .set({
        status: "approved",
        updatedAt: new Date(),
      })
      .where(eq(trips.id, tripId))

    // Send notification to agency
    await sendTripStatusNotification(tripId, "approved")

    revalidatePath("/admin/dashboard")
    return { success: true, message: "Trip approved successfully" }
  } catch (error) {
    console.error("Error approving trip:", error)
    return { success: false, message: "Failed to approve trip" }
  }
}

export async function rejectTrip(tripId: number) {
  try {
    await db
      .update(trips)
      .set({
        status: "rejected",
        isAvailable: false,
        updatedAt: new Date(),
      })
      .where(eq(trips.id, tripId))

    // Send notification to agency
    await sendTripStatusNotification(tripId, "rejected")

    revalidatePath("/admin/dashboard")
    return { success: true, message: "Trip rejected successfully" }
  } catch (error) {
    console.error("Error rejecting trip:", error)
    return { success: false, message: "Failed to reject trip" }
  }
}

export async function approveCar(carId: number) {
  try {
    await db
      .update(cars)
      .set({
        status: "approved",
        updatedAt: new Date(),
      })
      .where(eq(cars.id, carId))

    revalidatePath("/admin/dashboard")
    return { success: true, message: "Car approved successfully" }
  } catch (error) {
    console.error("Error approving car:", error)
    return { success: false, message: "Failed to approve car" }
  }
}

export async function rejectCar(carId: number) {
  try {
    await db
      .update(cars)
      .set({
        status: "rejected",
        isAvailable: false,
        updatedAt: new Date(),
      })
      .where(eq(cars.id, carId))

    revalidatePath("/admin/dashboard")
    return { success: true, message: "Car rejected successfully" }
  } catch (error) {
    console.error("Error rejecting car:", error)
    return { success: false, message: "Failed to reject car" }
  }
}

export async function approveHotel(hotelId: number) {
  try {
    await db
      .update(hotel)
      .set({
        status: "approved",
        updatedAt: new Date(),
      })
      .where(eq(hotel.id, String(hotelId)))

    revalidatePath("/admin/dashboard")
    return { success: true, message: "Hotel approved successfully" }
  } catch (error) {
    console.error("Error approving hotel:", error)
    return { success: false, message: "Failed to approve hotel" }
  }
}

export async function rejectHotel(hotelId: number) {
  try {
    await db
      .update(hotel)
      .set({
        status: "rejected",
        updatedAt: new Date(),
      })
      .where(eq(hotel.id, String(hotelId)))

    revalidatePath("/admin/dashboard")
    return { success: true, message: "Hotel rejected successfully" }
  } catch (error) {
    console.error("Error rejecting hotel:", error)
    return { success: false, message: "Failed to reject hotel" }
  }
}
