"use server"

import db from "@/db/drizzle"
import { hotel } from "@/db/schema"
import { and, sql } from "drizzle-orm"

export async function searchHotels(
  city: string,
  checkIn: string,
  checkOut: string
) {
  console.log("Searching hotels with params:", { city, checkIn, checkOut })

  try {
    // Convert the city to lowercase for case-insensitive search
    const lowercaseCity = city.toLowerCase()
    console.log("Lowercase city:", lowercaseCity)

    // First get all hotels that match the city
    const searchResults = await db.query.hotel.findMany({
      where: and(
        // Use SQL LOWER function to convert database value to lowercase before comparison
        sql`LOWER(${hotel.city}) LIKE ${`%${lowercaseCity}%`}`
      ),
      with: {
        rooms: {
          with: {
            availabilities: true,
          },
        },
      },
    })

    console.log(
      `Found ${searchResults.length} hotels matching city before filtering dates`
    )

    // If no dates are provided or dates are invalid, return all hotels matching the city
    if (
      !checkIn ||
      !checkOut ||
      isNaN(Date.parse(checkIn)) ||
      isNaN(Date.parse(checkOut))
    ) {
      console.log(
        "Invalid dates or no dates provided, returning all matching hotels"
      )
      return searchResults
    }

    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)

    // Filter hotels that have available rooms for the selected dates
    const filteredResults = searchResults.filter((hotel) =>
      hotel.rooms.some((room) =>
        room.availabilities.some((availability) => {
          const availStartDate = new Date(availability.startDate)
          const availEndDate = new Date(availability.endDate)

          const isAvailable =
            availability.isAvailable &&
            availStartDate <= checkInDate &&
            availEndDate >= checkOutDate

          return isAvailable
        })
      )
    )

    console.log(
      `After date filtering, found ${filteredResults.length} available hotels`
    )

    return filteredResults.length > 0 ? filteredResults : searchResults
  } catch (error) {
    console.error("Error searching hotels:", error)
    throw error
  }
}
