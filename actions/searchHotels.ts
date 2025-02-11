"use server"

import db from "@/db/drizzle"
import { hotel } from "@/db/schema"
import { and, like } from "drizzle-orm"

export async function searchHotels(city: string, checkIn: string, checkOut: string) {
  try {
    const searchResults = await db.query.hotel.findMany({
      where: and(
        like(hotel.city, `%${city}%`)
      ),
      with: {
        rooms: {
          with: {
            availabilities: true
          }
        }
      }
    })

    // Filter hotels that have available rooms for the selected dates
    return searchResults.filter(hotel => 
      hotel.rooms.some(room => 
        room.availabilities.some(availability => 
          availability.isAvailable &&
          new Date(availability.startDate) <= new Date(checkIn) &&
          new Date(availability.endDate) >= new Date(checkOut)
        )
      )
    )
  } catch (error) {
    console.error("Error searching hotels:", error)
    throw error
  }
} 