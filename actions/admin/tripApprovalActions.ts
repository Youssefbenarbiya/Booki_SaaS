"use server"

import { revalidatePath } from "next/cache"
import db from "@/db/drizzle"
import { trips } from "@/db/schema"
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
