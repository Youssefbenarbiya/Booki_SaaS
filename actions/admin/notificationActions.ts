"use server"

import db from "@/db/drizzle"
import { notifications, trips } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function sendTripStatusNotification(
  tripId: number,
  status: "approved" | "rejected"
) {
  try {
    // Get trip details with agency user ID
    const trip = await db.query.trips.findFirst({
      where: eq(trips.id, tripId),
      with: {
        agency: true,
      },
    })

    if (!trip || !trip.agency) {
      console.error("Trip not found or no agency associated with trip")
      return { success: false, message: "Trip or agency not found" }
    }

    const title = status === "approved" ? "Trip Approved" : "Trip Rejected"

    const message =
      status === "approved"
        ? `Your trip "${trip.name}" has been approved and is now available for booking.`
        : `Your trip "${trip.name}" has been rejected. Please review and update your trip or contact support for more information.`

    // Insert notification
    await db.insert(notifications).values({
      userId: trip.agency.userId,
      title,
      message,
      type: status === "approved" ? "success" : "warning",
      relatedItemType: "trip",
      relatedItemId: tripId,
    })

    return { success: true }
  } catch (error) {
    console.error("Error sending notification:", error)
    return { success: false, message: "Failed to send notification" }
  }
}
