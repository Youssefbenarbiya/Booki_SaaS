"use server"

import { headers } from "next/headers"
import { auth } from "@/auth"
import { favorites, trips, hotel, cars } from "@/db/schema"
import { and, eq, inArray } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import db from "@/db/drizzle"

export async function toggleFavorite(
  itemId: string | number,
  itemType: string
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    return { error: "Unauthorized", success: false }
  }

  try {
    // Check if the item is already favorited
    const existingFavorite = await db.query.favorites.findFirst({
      where: and(
        eq(favorites.userId, session.user.id),
        eq(favorites.itemType, itemType),
        eq(favorites.itemId, itemId.toString())
      ),
    })

    if (existingFavorite) {
      // Remove from favorites
      await db
        .delete(favorites)
        .where(
          and(
            eq(favorites.userId, session.user.id),
            eq(favorites.itemType, itemType),
            eq(favorites.itemId, itemId.toString())
          )
        )
      revalidatePath("/user/profile/favorites")
      return { isFavorite: false, success: true }
    } else {
      // Add to favorites
      await db.insert(favorites).values({
        userId: session.user.id,
        itemType,
        itemId: itemId.toString(),
      })
      revalidatePath("/user/profile/favorites")
      return { isFavorite: true, success: true }
    }
  } catch (error) {
    console.error("Error toggling favorite:", error)
    return { error: "Failed to update favorite", success: false }
  }
}

export async function checkFavoriteStatus(
  itemId: string | number,
  itemType: string
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    return { isFavorite: false }
  }

  try {
    const favorite = await db.query.favorites.findFirst({
      where: and(
        eq(favorites.userId, session.user.id),
        eq(favorites.itemType, itemType),
        eq(favorites.itemId, itemId.toString())
      ),
    })

    return { isFavorite: !!favorite }
  } catch (error) {
    console.error("Error checking favorite status:", error)
    return { isFavorite: false }
  }
}

export async function getUserFavorites() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    return { trips: [], hotels: [], cars: [], error: "Unauthorized" }
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

    return {
      trips: favoriteTrips,
      hotels: favoriteHotels,
      cars: favoriteCars,
    }
  } catch (error) {
    console.error("Error fetching favorites:", error)
    return {
      trips: [],
      hotels: [],
      cars: [],
      error: "Failed to fetch favorites",
    }
  }
}
