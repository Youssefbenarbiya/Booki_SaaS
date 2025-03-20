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
