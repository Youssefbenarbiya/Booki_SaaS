"use server"

import db from "@/db/drizzle"
import { notifications, trips } from "@/db/schema"
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
    const trip = await db.query.trips.findFirst({
      where: eq(trips.id, tripId),
    })

    if (!trip) {
      console.error(`Trip not found with ID: ${tripId}`)
      return { success: false, message: "Trip not found" }
    }

    // Find the agency ID directly from the trip record
    const agencyId = trip.agencyId

    if (!agencyId) {
      console.error(
        `Trip found but no agency ID associated with trip ID: ${tripId}`
      )
      return { success: false, message: "No agency associated with trip" }
    }

    console.log(`Found trip: ${trip.name}, Agency ID: ${agencyId}`)

    const title = status === "approved" ? "Trip Approved" : "Trip Rejected"

    const message =
      status === "approved"
        ? `Your trip "${trip.name}" has been approved and is now available for booking.`
        : `Your trip "${trip.name}" has been rejected. Please review and update your trip or contact support for more information.`

    // Insert notification using the agencyId directly
    await db.insert(notifications).values({
      userId: agencyId,
      title,
      message,
      type: status === "approved" ? "success" : "warning",
      relatedItemType: "trip",
      relatedItemId: tripId,
      createdAt: new Date(),
    })

    console.log("Notification created successfully")
    return { success: true }
  } catch (error) {
    console.error("Error sending notification:", error)
    return { success: false, message: "Failed to send notification" }
  }
}
