"use server"

import db from "@/db/drizzle"
import { trips } from "@/db/schema"
import { and, gte, sql, eq } from "drizzle-orm"

export async function searchTrips(destination: string, startDate: string) {
  try {
    // Add logging to debug the search parameters
    console.log("Searching trips with params:", { destination, startDate })

    // Convert the destination to lowercase for case-insensitive search
    const lowercaseDestination = destination.toLowerCase()

    // Validate startDate
    let validStartDate = startDate
    if (!startDate || isNaN(Date.parse(startDate))) {
      console.log("Invalid start date, using current date")
      validStartDate = new Date().toISOString().split("T")[0] // Use today's date
    }

    console.log(
      "Using destination:",
      lowercaseDestination,
      "and startDate:",
      validStartDate
    )

    // Search for trips matching the destination and with start date >= requested date
    const searchResults = await db.query.trips.findMany({
      where: and(
        // Use SQL LOWER function to convert database value to lowercase before comparison
        sql`LOWER(${trips.destination}) LIKE ${`%${lowercaseDestination}%`}`,
        gte(trips.startDate, validStartDate),
        eq(trips.status, "approved") // Only show approved trips
      ),
      with: {
        images: true,
        activities: true,
      },
    })

    console.log(`Found ${searchResults.length} trips matching the criteria`)

    // If we found no trips, try a fallback search without the date constraint
    if (searchResults.length === 0) {
      console.log(
        "No trips found with date constraint, trying without date filter"
      )
      const fallbackResults = await db.query.trips.findMany({
        where: and(
          sql`LOWER(${trips.destination}) LIKE ${`%${lowercaseDestination}%`}`,
          eq(trips.status, "approved") // Only show approved trips
        ),
        with: {
          images: true,
          activities: true,
        },
      })

      console.log(`Found ${fallbackResults.length} trips in fallback search`)
      return fallbackResults
    }

    return searchResults
  } catch (error) {
    console.error("Error searching trips:", error)
    // Instead of throwing, return empty array to prevent breaking the UI
    return []
  }
}
