"use server"

import db from "../../db/drizzle"
import {
  hotel,
  room,
  roomAvailability,
  user,
  agencyEmployees,
  roomBookings,
} from "@/db/schema"
import { hotelSchema, type HotelInput } from "@/lib/validations/hotelSchema"
import { eq, inArray } from "drizzle-orm"
import { auth } from "@/auth"
import { headers } from "next/headers"
import { sendHotelApprovalRequest } from "../admin/adminNotifications"
import { createNewHotelNotification } from "../admin/notificationActions"

// Helper function to get agency ID
async function getAgencyId(userId: string) {
  // Check if user is an agency owner
  const userWithAgency = await db.query.user.findFirst({
    where: eq(user.id, userId),
    with: {
      agency: true,
    },
  })

  if (userWithAgency?.agency) {
    return userWithAgency.agency.userId
  }

  // Check if user is an employee
  const employeeRecord = await db.query.agencyEmployees.findFirst({
    where: eq(agencyEmployees.employeeId, userId),
  })

  if (employeeRecord) {
    return employeeRecord.agencyId
  }

  throw new Error("No agency found for this user - not an owner or employee")
}

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

    // Get the user's agency ID (works for both owners and employees)
    const agencyId = await getAgencyId(session.user.id)

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
        agencyId: agencyId, // Use the agencyId from our helper
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
          currency: roomData.currency || "TND",
          roomType: roomData.roomType,
          amenities: roomData.amenities,
          images: roomData.images || [],
          advancePaymentEnabled: roomData.advancePaymentEnabled || false,
          advancePaymentPercentage: roomData.advancePaymentEnabled ? roomData.advancePaymentPercentage || 20 : null,
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
    
    // If hotel status is pending, send notification to admin
    if (newHotel.status === "pending") {
      await sendHotelApprovalRequest(hotelId)

      // Also create in-app admin notification
      try {
        // Get agency name for the notification
        const agency = await db.query.user.findFirst({
          where: eq(user.id, agencyId),
          with: {
            agency: true,
          },
        })

        await createNewHotelNotification(
          hotelId,
          validatedData.name,
          agency?.agency?.agencyName || "Agency"
        )
      } catch (error) {
        console.error("Failed to create admin notification:", error)
        // Continue even if notification creation fails
      }
    }
    
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
            currency: roomData.currency || "TND",
            roomType: roomData.roomType,
            amenities: roomData.amenities,
            images: roomData.images || [],
            advancePaymentEnabled: roomData.advancePaymentEnabled || false,
            advancePaymentPercentage: roomData.advancePaymentEnabled ? roomData.advancePaymentPercentage || 20 : null,
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
            currency: roomData.currency || "TND",
            roomType: roomData.roomType,
            amenities: roomData.amenities,
            images: roomData.images || [],
            advancePaymentEnabled: roomData.advancePaymentEnabled || false,
            advancePaymentPercentage: roomData.advancePaymentEnabled ? roomData.advancePaymentPercentage || 20 : null,
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

export async function archiveHotel(hotelId: string) {
  try {
    const [archivedHotel] = await db
      .update(hotel)
      .set({
        status: "archived",
        updatedAt: new Date(),
      })
      .where(eq(hotel.id, hotelId))
      .returning()
    return archivedHotel
  } catch (error) {
    console.error("Error archiving hotel:", error)
    throw error
  }
}

export async function publishHotel(hotelId: string) {
  try {
    const [publishedHotel] = await db
      .update(hotel)
      .set({
        status: "pending", // Reset to pending for admin review
        updatedAt: new Date(),
      })
      .where(eq(hotel.id, hotelId))
      .returning()
      
    // Send notification email to admin
    await sendHotelApprovalRequest(hotelId)
      
    return publishedHotel
  } catch (error) {
    console.error("Error publishing hotel:", error)
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

    // Get the user's agency ID (works for both owners and employees)
    const agencyId = await getAgencyId(session.user.id)

    // Get hotels belonging to the user's agency
    const hotels = await db.query.hotel.findMany({
      where: eq(hotel.agencyId, agencyId),
      with: {
        rooms: true,
      },
    })
    
    // Check each hotel for bookings
    const hotelsWithBookingInfo = await Promise.all(
      hotels.map(async (hotel) => {
        // Get all room IDs for this hotel
        const roomIds = hotel.rooms.map(room => room.id)
        
        if (roomIds.length === 0) {
          return { ...hotel, hasBookings: false, bookings: [] }
        }
        
        // Check if any bookings exist for these rooms
        const bookings = await db.query.roomBookings.findMany({
          where: inArray(roomBookings.roomId, roomIds),
        })
        
        return {
          ...hotel,
          hasBookings: bookings.length > 0,
          bookings: bookings,
        }
      })
    )
    
    return hotelsWithBookingInfo
  } catch (error) {
    console.error("Error getting hotels:", error)
    throw error
  }
}

export async function getHotelById(hotelId: string) {
  try {
    const hotelData = await db.query.hotel.findFirst({
      where: eq(hotel.id, hotelId),
      with: {
        rooms: {
          with: {
            availabilities: true,
          },
        },
      },
    })

    if (!hotelData) {
      return null
    }

    // Get all room IDs for this hotel
    const roomIds = hotelData.rooms.map(room => room.id)
    
    // Check if any bookings exist for these rooms
    const bookings = await db.query.roomBookings.findMany({
      where: inArray(roomBookings.roomId, roomIds),
    })
    
    return {
      ...hotelData,
      hasBookings: bookings.length > 0,
      bookings: bookings,
    }
  } catch (error) {
    console.error("Error getting hotel by ID:", error)
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
