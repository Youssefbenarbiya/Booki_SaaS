"use server"

import db from "../../db/drizzle"
import { hotel, room, roomAvailability, user } from "@/db/schema"
import { hotelSchema, type HotelInput } from "@/lib/validations/hotelSchema"
import { eq } from "drizzle-orm"
import { auth } from "@/auth"
import { headers } from "next/headers"

export async function createHotel(data: HotelInput) {
  try {
    const validatedData = hotelSchema.parse(data)
    const hotelId = crypto.randomUUID()

    // Get the current user's session
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      throw new Error("Unauthorized: You must be logged in to create a hotel")
    }

    // Get the user's agency
    const userWithAgency = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
      with: {
        agency: true,
      },
    })

    if (!userWithAgency?.agency) {
      throw new Error("No agency found for this user")
    }

    const [newHotel] = await db
      .insert(hotel)
      .values({
        id: hotelId,
        name: validatedData.name,
        description: validatedData.description,
        address: validatedData.address,
        city: validatedData.city,
        country: validatedData.country,
        latitude: validatedData.latitude?.toString(),
        longitude: validatedData.longitude?.toString(),
        rating: validatedData.rating,
        amenities: validatedData.amenities,
        images: validatedData.images || [],
        agencyId: userWithAgency.agency.userId, // Set agency ID
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    // Create rooms with images
    const roomPromises = validatedData.rooms.map(async (roomData) => {
      const roomId = crypto.randomUUID()
      const [newRoom] = await db
        .insert(room)
        .values({
          id: roomId,
          hotelId: hotelId,
          name: roomData.name,
          description: roomData.description,
          capacity: roomData.capacity,
          pricePerNightAdult: roomData.pricePerNightAdult.toString(),
          pricePerNightChild: roomData.pricePerNightChild.toString(),
          roomType: roomData.roomType,
          amenities: roomData.amenities,
          images: roomData.images || [],
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()

      // Create room availabilities if provided
      if (roomData.availabilities?.length) {
        await db.insert(roomAvailability).values(
          roomData.availabilities.map((availability) => ({
            id: crypto.randomUUID(),
            roomId: roomId,
            startDate: availability.startDate.toISOString(),
            endDate: availability.endDate.toISOString(),
            isAvailable: availability.isAvailable,
            createdAt: new Date(),
            updatedAt: new Date(),
          }))
        )
      }

      return newRoom
    })

    const rooms = await Promise.all(roomPromises)
    return { ...newHotel, rooms }
  } catch (error) {
    console.error("Error creating hotel:", error)
    throw error
  }
}

export async function updateHotel(hotelId: string, data: HotelInput) {
  try {
    const validatedData = hotelSchema.parse(data)

    // Update hotel
    const [updatedHotel] = await db
      .update(hotel)
      .set({
        name: validatedData.name,
        description: validatedData.description,
        address: validatedData.address,
        city: validatedData.city,
        country: validatedData.country,
        latitude: validatedData.latitude?.toString(),
        longitude: validatedData.longitude?.toString(),
        rating: validatedData.rating,
        amenities: validatedData.amenities,
        images: validatedData.images || [],
        updatedAt: new Date(),
      })
      .where(eq(hotel.id, hotelId))
      .returning()

    // Update rooms
    const roomPromises = validatedData.rooms.map(async (roomData) => {
      if (roomData.id) {
        // Update existing room with images
        const [updatedRoom] = await db
          .update(room)
          .set({
            name: roomData.name,
            description: roomData.description,
            capacity: roomData.capacity,
            pricePerNightAdult: roomData.pricePerNightAdult.toString(),
            pricePerNightChild: roomData.pricePerNightChild.toString(),
            roomType: roomData.roomType,
            amenities: roomData.amenities,
            images: roomData.images || [],
            updatedAt: new Date(),
          })
          .where(eq(room.id, roomData.id))
          .returning()
        return updatedRoom
      } else {
        // Create new room with images
        const [newRoom] = await db
          .insert(room)
          .values({
            id: crypto.randomUUID(),
            hotelId: hotelId,
            name: roomData.name,
            description: roomData.description,
            capacity: roomData.capacity,
            pricePerNightAdult: roomData.pricePerNightAdult.toString(),
            pricePerNightChild: roomData.pricePerNightChild.toString(),
            roomType: roomData.roomType,
            amenities: roomData.amenities,
            images: roomData.images || [],
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning()
        return newRoom
      }
    })

    const rooms = await Promise.all(roomPromises)
    return { ...updatedHotel, rooms }
  } catch (error) {
    console.error("Error updating hotel:", error)
    throw error
  }
}

export async function deleteHotel(hotelId: string) {
  try {
    const [deletedHotel] = await db
      .delete(hotel)
      .where(eq(hotel.id, hotelId))
      .returning()
    return deletedHotel
  } catch (error) {
    console.error("Error deleting hotel:", error)
    throw error
  }
}

export async function getHotels() {
  try {
    // Get the current user's session
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      console.log("No authenticated user found when getting hotels")
      return []
    }

    // Get the user's agency
    const userWithAgency = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
      with: {
        agency: true,
      },
    })

    if (!userWithAgency?.agency) {
      console.log("No agency found for this user")
      return []
    }

    // Get hotels belonging to the user's agency
    return await db.query.hotel.findMany({
      where: eq(hotel.agencyId, userWithAgency.agency.userId),
      with: {
        rooms: true,
      },
    })
  } catch (error) {
    console.error("Error getting hotels:", error)
    throw error
  }
}

export async function getHotelById(hotelId: string) {
  try {
    const result = await db.query.hotel.findFirst({
      where: (hotels) => eq(hotels.id, hotelId),
      with: {
        rooms: {
          with: {
            availabilities: true,
          },
        },
      },
    })
    return result
  } catch (error) {
    console.error("Error getting hotel:", error)
    throw error
  }
}

export async function getRoomById(roomId: string) {
  try {
    const result = await db.query.room.findFirst({
      where: eq(room.id, roomId),
      with: {
        hotel: true,
        availabilities: true,
      },
    })
    return result
  } catch (error) {
    console.error("Error getting room:", error)
    throw error
  }
}
