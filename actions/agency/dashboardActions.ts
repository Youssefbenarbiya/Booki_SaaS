"use server"

import db from "@/db/drizzle"
import {
  tripBookings,
  roomBookings,
  hotel,
  user,
  trips,
  room,
  agencyEmployees,
  blogs,
  notifications,
  carBookings,
  cars,
} from "@/db/schema"
import { eq, and, gt, sql, desc } from "drizzle-orm"
import { cache } from "react"
import { auth } from "@/auth"
import { headers } from "next/headers"

interface DashboardStats {
  totalRevenue: number
  totalBookings: number
  activeUsers: number
  newHotels: number

  // Booking breakdowns
  revenueBreakdown: {
    trips: number
    rooms: number
    cars: number
  }
  bookingBreakdown: {
    trips: number
    rooms: number
    cars: number
  }

  // Blog stats
  blogStats: {
    total: number
    published: number
    pending: number
  }

  // Employee stats
  employeeCount: number

  // Notification stats
  unreadNotifications: number

  // Recent booking stats
  recentBookingsCount: number

  // Performance indicators
  occupancyRate: number
  cancelRatio: number

  // Chart data
  monthlySales: Array<{
    name: string
    total: number
  }>

  // Sales breakdown for pie chart
  salesBreakdown: Array<{
    name: string
    value: number
  }>

  recentSales: Array<{
    id: string
    name: string
    email: string
    amount: number
    date: Date
    avatar?: string | null
    type?: string
  }>

  // Top performing offerings
  topPerformers: Array<{
    id: string | number
    name: string
    type: "hotel" | "trip" | "room"
    bookings: number
    revenue: number
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

    // Get the user
    const currentUser = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
    })

    if (!currentUser) {
      throw new Error("User not found")
    }

    let agencyId: string

    // Check if the user is an agency owner
    const userWithAgency = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
      with: {
        agency: true,
      },
    })

    if (userWithAgency?.agency) {
      // User is an agency owner
      agencyId = userWithAgency.agency.userId
    } else {
      // User might be an employee, check agencyEmployees table
      const employeeRecord = await db.query.agencyEmployees.findFirst({
        where: eq(agencyEmployees.employeeId, session.user.id),
      })

      if (!employeeRecord) {
        throw new Error(
          "No agency found for this user - not an owner or employee"
        )
      }

      agencyId = employeeRecord.agencyId
    }

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

    // Calculate revenue from car bookings - filtered by agency
    const carBookingsRevenueResult = await db
      .select({
        revenue: sql<number>`SUM(${carBookings.total_price})`,
      })
      .from(carBookings)
      .innerJoin(cars, eq(carBookings.car_id, cars.id))
      .where(eq(cars.agencyId, agencyId))

    const tripRevenue = Number(tripBookingsRevenueResult[0]?.revenue || 0)
    const roomRevenue = Number(roomBookingsRevenueResult[0]?.revenue || 0)
    const carRevenue = Number(carBookingsRevenueResult[0]?.revenue || 0)

    const totalRevenue = tripRevenue + roomRevenue + carRevenue

    // Get total bookings count - filtered by agency for all booking types
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

    const carBookingsCountResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(carBookings)
      .innerJoin(cars, eq(carBookings.car_id, cars.id))
      .where(eq(cars.agencyId, agencyId))

    const tripBookingsCount = Number(tripBookingsCountResult[0]?.count || 0)
    const roomBookingsCount = Number(roomBookingsCountResult[0]?.count || 0)
    const carBookingsCount = Number(carBookingsCountResult[0]?.count || 0)

    const totalBookings =
      tripBookingsCount + roomBookingsCount + carBookingsCount

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

    // Get blog stats for the agency
    const blogStatsResult = await db
      .select({
        total: sql<number>`COUNT(*)`,
        published: sql<number>`SUM(CASE WHEN ${blogs.published} = true THEN 1 ELSE 0 END)`,
        pending: sql<number>`SUM(CASE WHEN ${blogs.status} = 'pending' THEN 1 ELSE 0 END)`,
      })
      .from(blogs)
      .where(eq(blogs.agencyId, agencyId))

    const blogStats = {
      total: Number(blogStatsResult[0]?.total || 0),
      published: Number(blogStatsResult[0]?.published || 0),
      pending: Number(blogStatsResult[0]?.pending || 0),
    }

    // Get employee count
    const employeeCountResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(agencyEmployees)
      .where(eq(agencyEmployees.agencyId, agencyId))

    const employeeCount = Number(employeeCountResult[0]?.count || 0)

    // Get unread notifications
    const unreadNotificationsResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(notifications)
      .where(
        and(eq(notifications.userId, agencyId), eq(notifications.read, false))
      )

    const unreadNotifications = Number(unreadNotificationsResult[0]?.count || 0)

    // Calculate occupancy rate for rooms (rough approximation)
    // This is a placeholder - proper occupancy calculation would be more complex
    const occupancyRate = Math.min(70 + Math.random() * 15, 100) // Placeholder between 70-85%

    // Calculate cancellation ratio (placeholder)
    const cancelRatio = Math.random() * 10 // Placeholder 0-10%

    // Recent bookings (in last 7 days)
    const recentBookingsResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(roomBookings)
      .innerJoin(room, eq(roomBookings.roomId, room.id))
      .innerJoin(hotel, eq(room.hotelId, hotel.id))
      .where(
        and(
          eq(hotel.agencyId, agencyId),
          gt(roomBookings.bookingDate, sevenDaysAgo)
        )
      )

    const recentBookingsCount = Number(recentBookingsResult[0]?.count || 0)

    // Get recent sales from trip bookings - filtered by agency
    const recentTripSales = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        amount: sql<number>`(${tripBookings.seatsBooked} * ${trips.priceAfterDiscount})`,
        date: tripBookings.bookingDate,
        avatar: user.image,
        type: sql<string>`'trip'`,
      })
      .from(tripBookings)
      .innerJoin(user, eq(tripBookings.userId, user.id))
      .innerJoin(trips, eq(tripBookings.tripId, trips.id))
      .where(eq(trips.agencyId, agencyId))
      .limit(10)

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
        type: sql<string>`'room'`,
      })
      .from(roomBookings)
      .innerJoin(user, eq(roomBookings.userId, user.id))
      .innerJoin(room, eq(roomBookings.roomId, room.id))
      .innerJoin(hotel, eq(room.hotelId, hotel.id))
      .where(eq(hotel.agencyId, agencyId)) // Filter by agency
      .limit(10)

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

    // Get top performing hotels and trips
    // Top performing rooms
    const topRooms = await db
      .select({
        id: room.id,
        name: room.name,
        bookings: sql<number>`COUNT(${roomBookings.id})`,
        revenue: sql<number>`SUM(${roomBookings.totalPrice})`,
      })
      .from(roomBookings)
      .innerJoin(room, eq(roomBookings.roomId, room.id))
      .innerJoin(hotel, eq(room.hotelId, hotel.id))
      .where(eq(hotel.agencyId, agencyId))
      .groupBy(room.id, room.name)
      .orderBy(desc(sql<number>`SUM(${roomBookings.totalPrice})`))
      .limit(3)

    // Top performing trips
    const topTrips = await db
      .select({
        id: trips.id,
        name: trips.name,
        bookings: sql<number>`COUNT(${tripBookings.id})`,
        revenue: sql<number>`SUM(${tripBookings.totalPrice})`,
      })
      .from(tripBookings)
      .innerJoin(trips, eq(tripBookings.tripId, trips.id))
      .where(eq(trips.agencyId, agencyId))
      .groupBy(trips.id, trips.name)
      .orderBy(desc(sql<number>`SUM(${tripBookings.totalPrice})`))
      .limit(3)

    // Format top performers
    const topPerformers = [
      ...topRooms.map((room) => ({
        id: room.id,
        name: room.name,
        type: "room" as const,
        bookings: Number(room.bookings || 0),
        revenue: Number(room.revenue || 0),
      })),
      ...topTrips.map((trip) => ({
        id: trip.id,
        name: trip.name,
        type: "trip" as const,
        bookings: Number(trip.bookings || 0),
        revenue: Number(trip.revenue || 0),
      })),
    ]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Generate monthly sales data from actual database records
    const now = new Date()
    const currentYear = now.getFullYear()
    const monthNames = [
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

    // Get 12 months of data (current month and 11 previous months)
    const months = Array(12)
      .fill(0)
      .map((_, i) => {
        const monthIndex = (now.getMonth() - 11 + i + 12) % 12
        const year = currentYear - (now.getMonth() < monthIndex ? 1 : 0)
        return {
          monthIndex,
          year,
          monthName: monthNames[monthIndex],
          startDate: new Date(year, monthIndex, 1),
          endDate: new Date(year, monthIndex + 1, 0, 23, 59, 59),
        }
      })

    // Query trip booking revenue by month
    const tripRevenueByMonth = await Promise.all(
      months.map(async ({ startDate, endDate, monthName }) => {
        const result = await db
          .select({
            total: sql<number>`COALESCE(SUM(${tripBookings.seatsBooked} * ${trips.priceAfterDiscount}), 0)`,
          })
          .from(tripBookings)
          .innerJoin(trips, eq(tripBookings.tripId, trips.id))
          .where(
            and(
              eq(trips.agencyId, agencyId),
              sql`${tripBookings.bookingDate} >= ${startDate} AND ${tripBookings.bookingDate} <= ${endDate}`
            )
          )

        return {
          name: monthName,
          tripRevenue: Number(result[0]?.total || 0),
        }
      })
    )

    // Query room booking revenue by month
    const roomRevenueByMonth = await Promise.all(
      months.map(async ({ startDate, endDate, monthName }) => {
        const result = await db
          .select({
            total: sql<number>`
              COALESCE(SUM(
                DATE_PART('day', ${roomBookings.checkOut}::timestamp - ${roomBookings.checkIn}::timestamp) * 
                ${room.pricePerNightAdult}::decimal
              ), 0)
            `,
          })
          .from(roomBookings)
          .innerJoin(room, eq(roomBookings.roomId, room.id))
          .innerJoin(hotel, eq(room.hotelId, hotel.id))
          .where(
            and(
              eq(hotel.agencyId, agencyId),
              sql`${roomBookings.bookingDate} >= ${startDate} AND ${roomBookings.bookingDate} <= ${endDate}`
            )
          )

        return {
          name: monthName,
          roomRevenue: Number(result[0]?.total || 0),
        }
      })
    )

    // Query car booking revenue by month
    const carRevenueByMonth = await Promise.all(
      months.map(async ({  monthName }) => {
        const result = await db
          .select({
            total: sql<number>`COALESCE(SUM(${carBookings.total_price}), 0)`,
          })
          .from(carBookings)
          .innerJoin(cars, eq(carBookings.car_id, cars.id))
          .where(
            and(
              eq(cars.agencyId, agencyId),
            )
          )

        return {
          name: monthName,
          carRevenue: Number(result[0]?.total || 0),
        }
      })
    )

    // Combine all revenue streams by month
    const monthlySales = months.map(({ monthName }, index) => {
      const tripRev = tripRevenueByMonth[index]?.tripRevenue || 0
      const roomRev = roomRevenueByMonth[index]?.roomRevenue || 0
      const carRev = carRevenueByMonth[index]?.carRevenue || 0

      return {
        name: monthName,
        total: tripRev + roomRev + carRev,
      }
    })

    // Create sales breakdown for pie chart
    const salesBreakdown = [
      { name: "Rooms", value: roomRevenue },
      { name: "Trips", value: tripRevenue },
      { name: "Cars", value: carRevenue },
    ]

    return {
      totalRevenue,
      totalBookings,
      activeUsers,
      newHotels,
      revenueBreakdown: {
        trips: tripRevenue,
        rooms: roomRevenue,
        cars: carRevenue,
      },
      bookingBreakdown: {
        trips: tripBookingsCount,
        rooms: roomBookingsCount,
        cars: carBookingsCount,
      },
      blogStats,
      employeeCount,
      unreadNotifications,
      recentBookingsCount,
      occupancyRate,
      cancelRatio,
      monthlySales, // Now using real data
      salesBreakdown,
      recentSales,
      topPerformers,
    }
  } catch (error) {
    console.error("Error getting dashboard stats:", error)
    throw error
  }
})
