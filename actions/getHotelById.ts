"use server"

import db from "@/db/drizzle"
import { hotel } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function getHotelById(id: string) {
  try {
    console.log("Fetching hotel with ID:", id)

    // Get the hotel with the specified ID
    const hotels = await db.query.hotel.findMany({
      where: eq(hotel.id, id),
      with: {
        rooms: true,
      },
    })

    console.log(
      "Hotel query result:",
      hotels.length > 0 ? "Found" : "Not found"
    )

    if (hotels.length === 0) {
      return null
    }

    return hotels[0]
  } catch (error) {
    console.error("Error fetching hotel by ID:", error)
    throw new Error("Failed to fetch hotel")
  }
}
