"use server"

import db from "@/db/drizzle"
import {
  tripBookings,
  roomBookings,
  hotel,
  user,
  trips,
  room,
} from "@/db/schema"
import { eq, and, gt, sql } from "drizzle-orm"
import { cache } from "react"
import { auth } from "@/auth"
import { headers } from "next/headers"

interface DashboardStats {
  totalRevenue: number
  totalBookings: number
  activeUsers: number
  newHotels: number
  monthlySales: Array<{
    name: string
    total: number
  }>
  recentSales: Array<{
    id: string
    name: string
    email: string
    amount: number
    date: Date
    avatar?: string | null
  }>
}

export const getDashboardStats = cache(async (): Promise<DashboardStats> => {
  try {
    // Get the current user's session
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      throw new Error("Unauthorized: User not authenticated")
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

    const agencyId = userWithAgency.agency.userId

    // Calculate revenue from trip bookings - filtered by agency
    const tripBookingsRevenueResult = await db
      .select({
        revenue: sql<number>`SUM(${tripBookings.seatsBooked} * ${trips.priceAfterDiscount})`,
      })
      .from(tripBookings)
      .innerJoin(trips, eq(tripBookings.tripId, trips.id))
      .where(eq(trips.agencyId, agencyId)) // Filter by agency

    // Calculate revenue from room bookings - filtered by agency
    const roomBookingsRevenueResult = await db
      .select({
        revenue: sql<number>`
          SUM(
            DATE_PART('day', ${roomBookings.checkOut}::timestamp - ${roomBookings.checkIn}::timestamp) * 
            ${room.pricePerNightAdult}::decimal
          )
        `,
      })
      .from(roomBookings)
      .innerJoin(room, eq(roomBookings.roomId, room.id))
      .innerJoin(hotel, eq(room.hotelId, hotel.id))
      .where(eq(hotel.agencyId, agencyId)) // Filter by agency

    const totalRevenue =
      Number(tripBookingsRevenueResult[0]?.revenue || 0) +
      Number(roomBookingsRevenueResult[0]?.revenue || 0)

    // Get total bookings count - filtered by agency for both trip and room bookings
    const tripBookingsCountResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(tripBookings)
      .innerJoin(trips, eq(tripBookings.tripId, trips.id))
      .where(eq(trips.agencyId, agencyId))

    const roomBookingsCountResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(roomBookings)
      .innerJoin(room, eq(roomBookings.roomId, room.id))
      .innerJoin(hotel, eq(room.hotelId, hotel.id))
      .where(eq(hotel.agencyId, agencyId)) // Filter by agency

    const totalBookings =
      Number(tripBookingsCountResult[0]?.count || 0) +
      Number(roomBookingsCountResult[0]?.count || 0)

    // Get active users (with bookings in the last 30 days) - filtered by agency
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const activeUsersResult = await db
      .select({
        count: sql<number>`COUNT(DISTINCT ${tripBookings.userId})`,
      })
      .from(tripBookings)
      .innerJoin(trips, eq(tripBookings.tripId, trips.id))
      .where(
        and(
          eq(trips.agencyId, agencyId),
          gt(tripBookings.bookingDate, thirtyDaysAgo)
        )
      )

    const activeUsers = Number(activeUsersResult[0]?.count || 0)

    // Get new hotels count (created in the last 7 days) - filtered by agency
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const newHotelsResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(hotel)
      .where(
        and(eq(hotel.agencyId, agencyId), gt(hotel.createdAt, sevenDaysAgo))
      )

    const newHotels = Number(newHotelsResult[0]?.count || 0)

    // Get recent sales from trip bookings - filtered by agency
    const recentTripSales = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        amount: sql<number>`(${tripBookings.seatsBooked} * ${trips.priceAfterDiscount})`,
        date: tripBookings.bookingDate,
        avatar: user.image,
      })
      .from(tripBookings)
      .innerJoin(user, eq(tripBookings.userId, user.id))
      .innerJoin(trips, eq(tripBookings.tripId, trips.id))
      .where(eq(trips.agencyId, agencyId))

    // Get recent sales from room bookings - filtered by agency
    const recentRoomSales = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        amount: sql<number>`
          DATE_PART('day', ${roomBookings.checkOut}::timestamp - ${roomBookings.checkIn}::timestamp) * ${room.pricePerNightAdult}::decimal
        `,
        date: roomBookings.bookingDate,
        avatar: user.image,
      })
      .from(roomBookings)
      .innerJoin(user, eq(roomBookings.userId, user.id))
      .innerJoin(room, eq(roomBookings.roomId, room.id))
      .innerJoin(hotel, eq(room.hotelId, hotel.id))
      .where(eq(hotel.agencyId, agencyId)) // Filter by agency

    // Combine sales results from both trip and room bookings
    const combinedSales = [...recentTripSales, ...recentRoomSales]

    // Ensure that each sale has a non-null date
    const sanitizedCombinedSales = combinedSales.map((sale) => ({
      ...sale,
      date: sale.date ?? new Date(), // fallback if date is null
    }))

    // Sort combined sales by date (newest first) and pick the top 5
    sanitizedCombinedSales.sort((a, b) => b.date.getTime() - a.date.getTime())
    const recentSales = sanitizedCombinedSales.slice(0, 5)

    // Generate placeholder monthly sales data
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ]
    const monthlySales = months.map((name) => ({
      name,
      total: Math.floor(Math.random() * 5000) + 1000, // Placeholder data
    }))

    return {
      totalRevenue,
      totalBookings,
      activeUsers,
      newHotels,
      monthlySales,
      recentSales,
    }
  } catch (error) {
    console.error("Error getting dashboard stats:", error)
    throw error
  }
})
