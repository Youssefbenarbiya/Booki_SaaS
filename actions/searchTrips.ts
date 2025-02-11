"use server"

import db from "@/db/drizzle"
import { trips } from "@/db/schema"
import { and, gte, like } from "drizzle-orm"

export async function searchTrips(destination: string, startDate: string) {
  try {
    const searchResults = await db.query.trips.findMany({
      where: and(
        like(trips.destination, `%${destination}%`),
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
