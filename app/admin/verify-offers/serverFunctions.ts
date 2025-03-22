import db from "@/db/drizzle"
import { trips } from "@/db/schema"
import { eq } from "drizzle-orm"

// Fetch counts for each trip status sequentially
export async function getStatusCounts() {
  const pendingTrips = await db.query.trips.findMany({
    where: eq(trips.status, "pending"),
  })
  const pendingCount = pendingTrips.length

  const approvedTrips = await db.query.trips.findMany({
    where: eq(trips.status, "approved"),
  })
  const approvedCount = approvedTrips.length

  const rejectedTrips = await db.query.trips.findMany({
    where: eq(trips.status, "rejected"),
  })
  const rejectedCount = rejectedTrips.length

  return {
    pending: pendingCount,
    approved: approvedCount,
    rejected: rejectedCount,
  }
}

// Fetch trips for a given status sequentially
export async function getTripsByStatus(status: string) {
  const tripsData = await db.query.trips.findMany({
    where: eq(trips.status, status),
  })
  return tripsData
}
