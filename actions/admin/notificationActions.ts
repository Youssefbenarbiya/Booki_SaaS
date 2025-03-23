"use server"

import db from "@/db/drizzle"
import { notifications, trips, cars, hotel } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function sendTripStatusNotification(
  tripId: number,
  status: "approved" | "rejected"
) {
  try {
    console.log(
      `Sending notification for trip ID: ${tripId} with status: ${status}`
    )

    // Get trip details
    const tripRecord = await db.query.trips.findFirst({
      where: eq(trips.id, tripId),
    })

    console.log("Trip record:", JSON.stringify(tripRecord, null, 2))

    if (!tripRecord) {
      console.error(`Trip not found with ID: ${tripId}`)
      return { success: false, message: "Trip not found" }
    }

    // Get the agency user ID directly from the trip
    const agencyId = tripRecord.agencyId

    if (!agencyId) {
      console.error(
        `No agency ID found for trip ID: ${tripId}. This trip may have been created without an agency association.`
      )
      return {
        success: false,
        message: "No agency associated with trip. Unable to send notification.",
      }
    }

    console.log(`Using agency ID: ${agencyId} for notification`)

    const title = status === "approved" ? "Trip Approved" : "Trip Rejected"

    const message =
      status === "approved"
        ? `Your trip "${tripRecord.name}" has been approved and is now available for booking.`
        : `Your trip "${tripRecord.name}" has been rejected. Please review and update your trip or contact support for more information.`

    // Create notification with explicit values for all required fields
    try {
      const insertResult = await db.insert(notifications).values({
        userId: agencyId,
        title,
        message,
        type: status === "approved" ? "success" : "warning",
        relatedItemType: "trip",
        relatedItemId: tripId,
        createdAt: new Date(),
        read: false,
      })

      console.log("Notification insert result:", insertResult)
      return { success: true }
    } catch (insertError) {
      console.error("Failed to insert notification:", insertError)
      throw insertError // Re-throw to be caught by outer catch block
    }
  } catch (error) {
    console.error("Error in sendTripStatusNotification:", error)
    return { success: false, message: "Failed to send notification" }
  }
}

export async function sendCarStatusNotification(
  carId: number,
  status: "approved" | "rejected"
) {
  try {
    console.log(
      `[START] Sending notification for car ID: ${carId} with status: ${status}`
    )

    // Get car details
    const carRecord = await db.query.cars.findFirst({
      where: eq(cars.id, carId),
    })

    console.log("Car record found:", !!carRecord)
    if (carRecord) {
      console.log("Car agency ID:", carRecord.agencyId)
    }

    if (!carRecord) {
      console.error(`Car not found with ID: ${carId}`)
      return { success: false, message: "Car not found" }
    }

    // Get the agency user ID directly from the car
    const agencyId = carRecord.agencyId

    if (!agencyId) {
      console.error(
        `No agency ID found for car ID: ${carId}. This car may have been created without an agency association.`
      )
      return {
        success: false,
        message: "No agency associated with car. Unable to send notification.",
      }
    }

    console.log(`Using agency ID: ${agencyId} for car notification`)

    const title = status === "approved" ? "Car Approved" : "Car Rejected"

    const message =
      status === "approved"
        ? `Your car "${carRecord.brand} ${carRecord.model}" has been approved and is now available for booking.`
        : `Your car "${carRecord.brand} ${carRecord.model}" has been rejected. Please review and update your listing or contact support for more information.`

    console.log(`Preparing to insert car notification with title: "${title}"`)

    // Create notification with explicit values for all required fields
    try {
      const insertResult = await db.insert(notifications).values({
        userId: agencyId,
        title,
        message,
        type: status === "approved" ? "success" : "warning",
        relatedItemType: "car",
        relatedItemId: carId,
        createdAt: new Date(),
        read: false,
      })

      console.log("Car notification insert result:", insertResult)
      console.log(`[SUCCESS] Car notification sent for car ID: ${carId}`)
      return { success: true }
    } catch (insertError) {
      console.error("Failed to insert car notification:", insertError)
      throw insertError // Re-throw to be caught by outer catch block
    }
  } catch (error) {
    console.error("Error in sendCarStatusNotification:", error)
    return { success: false, message: "Failed to send car notification" }
  }
}

export async function sendHotelStatusNotification(
  hotelId: number,
  status: "approved" | "rejected"
) {
  try {
    console.log(
      `[START] Sending notification for hotel ID: ${hotelId} with status: ${status}`
    )

    // Get hotel details
    const hotelRecord = await db.query.hotel.findFirst({
      where: eq(hotel.id, String(hotelId)),
    })

    console.log("Hotel record found:", !!hotelRecord)
    if (hotelRecord) {
      console.log("Hotel agency ID:", hotelRecord.agencyId)
    }

    if (!hotelRecord) {
      console.error(`Hotel not found with ID: ${hotelId}`)
      return { success: false, message: "Hotel not found" }
    }

    // Get the agency user ID directly from the hotel
    const agencyId = hotelRecord.agencyId

    if (!agencyId) {
      console.error(
        `No agency ID found for hotel ID: ${hotelId}. This hotel may have been created without an agency association.`
      )
      return {
        success: false,
        message:
          "No agency associated with hotel. Unable to send notification.",
      }
    }

    console.log(`Using agency ID: ${agencyId} for hotel notification`)

    const title = status === "approved" ? "Hotel Approved" : "Hotel Rejected"

    const message =
      status === "approved"
        ? `Your hotel "${hotelRecord.name}" has been approved and is now available for booking.`
        : `Your hotel "${hotelRecord.name}" has been rejected. Please review and update your listing or contact support for more information.`

    console.log(`Preparing to insert hotel notification with title: "${title}"`)

    // Create notification with explicit values for all required fields
    try {
      const insertResult = await db.insert(notifications).values({
        userId: agencyId,
        title,
        message,
        type: status === "approved" ? "success" : "warning",
        relatedItemType: "hotel",
        relatedItemId: hotelId,
        createdAt: new Date(),
        read: false,
      })

      console.log("Hotel notification insert result:", insertResult)
      console.log(`[SUCCESS] Hotel notification sent for hotel ID: ${hotelId}`)
      return { success: true }
    } catch (insertError) {
      console.error("Failed to insert hotel notification:", insertError)
      throw insertError // Re-throw to be caught by outer catch block
    }
  } catch (error) {
    console.error("Error in sendHotelStatusNotification:", error)
    return { success: false, message: "Failed to send hotel notification" }
  }
}
