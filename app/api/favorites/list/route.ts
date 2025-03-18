import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/db"
import {
  favorites,
  trips,
  tripImages,
  tripActivities,
  hotel,
  room,
  cars,
} from "@/db/schema"
import { eq, inArray } from "drizzle-orm"

export async function GET(request: NextRequest) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get all favorites for the user
    const userFavorites = await db.query.favorites.findMany({
      where: eq(favorites.userId, session.user.id),
    })

    const tripIds = userFavorites
      .filter((fav) => fav.itemType === "trip")
      .map((fav) => parseInt(fav.itemId))

    const hotelIds = userFavorites
      .filter((fav) => fav.itemType === "hotel")
      .map((fav) => fav.itemId)

    const carIds = userFavorites
      .filter((fav) => fav.itemType === "car")
      .map((fav) => parseInt(fav.itemId))

    // Fetch trip details
    const favoriteTrips =
      tripIds.length > 0
        ? await db.query.trips.findMany({
            where: inArray(trips.id, tripIds),
            with: {
              images: true,
              activities: true,
            },
          })
        : []

    // Fetch hotel details
    const favoriteHotels =
      hotelIds.length > 0
        ? await db.query.hotel.findMany({
            where: inArray(hotel.id, hotelIds),
            with: {
              rooms: true,
            },
          })
        : []

    // Fetch car details
    const favoriteCars =
      carIds.length > 0
        ? await db.query.cars.findMany({
            where: inArray(cars.id, carIds),
          })
        : []

    return NextResponse.json({
      trips: favoriteTrips,
      hotels: favoriteHotels,
      cars: favoriteCars,
    })
  } catch (error) {
    console.error("Error fetching favorites:", error)
    return NextResponse.json(
      { message: "Failed to fetch favorites" },
      { status: 500 }
    )
  }
}
