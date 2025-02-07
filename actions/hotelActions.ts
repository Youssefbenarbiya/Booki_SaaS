"use server"

import db from "../db/drizzle"
import { hotel, room, roomAvailability } from "@/db/schema"
import { hotelSchema, type HotelInput } from "@/lib/validations/hotelSchema"
import { eq } from "drizzle-orm"

export async function createHotel(data: HotelInput) {
  try {
    const validatedData = hotelSchema.parse(data)
    const hotelId = crypto.randomUUID()

    // Start a transaction to create hotel and rooms
    return await db.transaction(async (tx) => {
      // Create hotel
      const [newHotel] = await tx
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

      // Create rooms
      const roomPromises = validatedData.rooms.map(async (roomData) => {
        const roomId = crypto.randomUUID()
        const [newRoom] = await tx
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
          await tx.insert(roomAvailability).values(
            roomData.availabilities.map((availability) => ({
              id: crypto.randomUUID(),
              roomId: roomId,
              startDate: availability.startDate,
              endDate: availability.endDate,
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
    })
  } catch (error) {
    console.error("Error creating hotel:", error)
    throw error
  }
}

export async function updateHotel(hotelId: string, data: HotelInput) {
  try {
    const validatedData = hotelSchema.parse(data)

    return await db.transaction(async (tx) => {
      // Update hotel
      const [updatedHotel] = await tx
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
          // Update existing room
          const [updatedRoom] = await tx
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
          // Create new room
          const [newRoom] = await tx
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
    })
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
    const hotels = await db.query.hotel.findMany({
      with: {
        rooms: true,
      },
    })
    return hotels
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
