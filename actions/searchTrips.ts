"use server"

import db from "@/db/drizzle"
import { trips } from "@/db/schema"
import { and, gte, sql } from "drizzle-orm"

export async function searchTrips(destination: string, startDate: string) {
  try {
    // Convert the destination to lowercase for case-insensitive search
    const lowercaseDestination = destination.toLowerCase()

    const searchResults = await db.query.trips.findMany({
      where: and(
        // Use SQL LOWER function to convert database value to lowercase before comparison
        sql`LOWER(${trips.destination}) LIKE ${`%${lowercaseDestination}%`}`,
        gte(trips.startDate, startDate)
      ),
      with: {
        images: true,
        activities: true,
      },
    })

    return searchResults
  } catch (error) {
    console.error("Error searching trips:", error)
    throw error
  }
}
