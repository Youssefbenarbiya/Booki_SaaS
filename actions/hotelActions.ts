"use server"

import db from "../db/drizzle"
import { hotel, room, roomAvailability } from "@/db/schema"
import { hotelSchema, type HotelInput } from "@/lib/validations/hotelSchema"
import { eq } from "drizzle-orm"

export async function createHotel(data: HotelInput) {
  try {
    const validatedData = hotelSchema.parse(data)
    const hotelId = crypto.randomUUID()

    const [newHotel] = await db
      .insert(hotel)
      .values({
        id: hotelId,
        name: validatedData.name,
        description: validatedData.description,
        address: validatedData.address,
        city: validatedData.city,
        country: validatedData.country,
        rating: validatedData.rating,
        amenities: validatedData.amenities,
        images: validatedData.images || [],
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
          pricePerNight: roomData.pricePerNight.toString(),
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
            pricePerNight: roomData.pricePerNight.toString(),
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
            pricePerNight: roomData.pricePerNight.toString(),
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
  return await db.query.hotel.findMany({
    with: {
      rooms: true,
    },
  })
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
