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
import { eq, gt, sql } from "drizzle-orm"
import { cache } from "react"

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
    // Calculate revenue from trip bookings
    const tripBookingsRevenueResult = await db
      .select({
        revenue: sql<number>`SUM(${tripBookings.seatsBooked} * ${trips.price})`,
      })
      .from(tripBookings)
      .innerJoin(trips, eq(tripBookings.tripId, trips.id))

    // Calculate revenue from room bookings
    const roomBookingsRevenueResult = await db
      .select({
        revenue: sql<number>`
          SUM(
            DATE_PART('day', ${roomBookings.checkOut}::timestamp - ${roomBookings.checkIn}::timestamp) * 
            ${room.pricePerNight}::decimal
          )
        `,
      })
      .from(roomBookings)
      .innerJoin(room, eq(roomBookings.roomId, room.id))

    const totalRevenue =
      Number(tripBookingsRevenueResult[0]?.revenue || 0) +
      Number(roomBookingsRevenueResult[0]?.revenue || 0)

    // Get total bookings count from both trip and room bookings
    const [tripBookingsCountResult, roomBookingsCountResult] =
      await Promise.all([
        db.select({ count: sql<number>`COUNT(*)` }).from(tripBookings),
        db.select({ count: sql<number>`COUNT(*)` }).from(roomBookings),
      ])
    const totalBookings =
      Number(tripBookingsCountResult[0]?.count || 0) +
      Number(roomBookingsCountResult[0]?.count || 0)

    // Get active users (with bookings in the last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const activeUsersResult = await db
      .select({
        count: sql<number>`COUNT(DISTINCT ${tripBookings.userId})`,
      })
      .from(tripBookings)
      .where(gt(tripBookings.bookingDate, thirtyDaysAgo))

    const activeUsers = Number(activeUsersResult[0]?.count || 0)

    // Get new hotels count (created in the last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const newHotelsResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(hotel)
      .where(gt(hotel.createdAt, sevenDaysAgo))

    const newHotels = Number(newHotelsResult[0]?.count || 0)

    // Get recent sales from trip bookings
    const recentTripSales = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        amount: sql<number>`(${tripBookings.seatsBooked} * ${trips.price})`,
        date: tripBookings.bookingDate,
        avatar: user.image,
      })
      .from(tripBookings)
      .innerJoin(user, eq(tripBookings.userId, user.id))
      .innerJoin(trips, eq(tripBookings.tripId, trips.id))

    // Get recent sales from room bookings
    const recentRoomSales = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        amount: sql<number>`
          DATE_PART('day', ${roomBookings.checkOut}::timestamp - ${roomBookings.checkIn}::timestamp) * ${room.pricePerNight}::decimal
        `,
        date: roomBookings.bookingDate,
        avatar: user.image,
      })
      .from(roomBookings)
      .innerJoin(user, eq(roomBookings.userId, user.id))
      .innerJoin(room, eq(roomBookings.roomId, room.id))

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
