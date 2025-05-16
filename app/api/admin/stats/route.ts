import { NextResponse } from "next/server"
import db from "@/db/drizzle"
import { cars, carBookings, trips, tripBookings, hotel, room, roomBookings, user, agencies } from "@/db/schema"
import { count, sql, eq, and, gte, desc } from "drizzle-orm"
import { auth } from "@/auth"
import { headers } from "next/headers"

export async function GET() {
  try {
    // Verify admin access
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      )
    }

    // Get current date info for filtering
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1 // JavaScript months are 0-indexed
    
    // Calculate first day of current month for monthly comparisons
    const firstDayOfMonth = new Date(currentYear, now.getMonth(), 1)
    
    // Calculate 7 days ago for weekly data
    const oneWeekAgo = new Date(now)
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    // Calculate first day of previous month for revenue comparison
    const firstDayOfPrevMonth = new Date(currentYear, now.getMonth() - 1, 1)
    const lastDayOfPrevMonth = new Date(currentYear, now.getMonth(), 0)

    // Revenue calculations for current month
    const currentMonthRevenue = await db
      .select({ 
        sum: sql<number>`COALESCE(SUM(CAST(${carBookings.total_price} AS DECIMAL)), 0) + 
                        COALESCE(SUM(CAST(${tripBookings.totalPrice} AS DECIMAL)), 0) +
                        COALESCE(SUM(CAST(${roomBookings.totalPrice} AS DECIMAL)), 0)` 
      })
      .from(carBookings)
      .fullJoin(tripBookings, sql`1=1`)
      .fullJoin(roomBookings, sql`1=1`)
      .where(
        sql`(${carBookings.paymentStatus} = 'completed' AND ${carBookings.paymentDate} >= ${firstDayOfMonth.toISOString()}) OR 
            (${tripBookings.paymentStatus} = 'completed' AND ${tripBookings.paymentDate} >= ${firstDayOfMonth.toISOString()}) OR
            (${roomBookings.paymentStatus} = 'completed' AND ${roomBookings.paymentDate} >= ${firstDayOfMonth.toISOString()})`
      )

    // Revenue calculations for previous month for comparison
    const previousMonthRevenue = await db
      .select({ 
        sum: sql<number>`COALESCE(SUM(CAST(${carBookings.total_price} AS DECIMAL)), 0) + 
                        COALESCE(SUM(CAST(${tripBookings.totalPrice} AS DECIMAL)), 0) +
                        COALESCE(SUM(CAST(${roomBookings.totalPrice} AS DECIMAL)), 0)` 
      })
      .from(carBookings)
      .fullJoin(tripBookings, sql`1=1`)
      .fullJoin(roomBookings, sql`1=1`)
      .where(
        sql`(${carBookings.paymentStatus} = 'completed' AND 
             ${carBookings.paymentDate} >= ${firstDayOfPrevMonth.toISOString()} AND 
             ${carBookings.paymentDate} <= ${lastDayOfPrevMonth.toISOString()}) OR 
            (${tripBookings.paymentStatus} = 'completed' AND 
             ${tripBookings.paymentDate} >= ${firstDayOfPrevMonth.toISOString()} AND 
             ${tripBookings.paymentDate} <= ${lastDayOfPrevMonth.toISOString()}) OR
            (${roomBookings.paymentStatus} = 'completed' AND 
             ${roomBookings.paymentDate} >= ${firstDayOfPrevMonth.toISOString()} AND 
             ${roomBookings.paymentDate} <= ${lastDayOfPrevMonth.toISOString()})`
      )
    
    // Calculate total all-time revenue
    const totalRevenue = await db
      .select({ 
        sum: sql<number>`COALESCE(SUM(CAST(${carBookings.total_price} AS DECIMAL)), 0) + 
                        COALESCE(SUM(CAST(${tripBookings.totalPrice} AS DECIMAL)), 0) +
                        COALESCE(SUM(CAST(${roomBookings.totalPrice} AS DECIMAL)), 0)` 
      })
      .from(carBookings)
      .fullJoin(tripBookings, sql`1=1`)
      .fullJoin(roomBookings, sql`1=1`)
      .where(
        sql`${carBookings.paymentStatus} = 'completed' OR 
            ${tripBookings.paymentStatus} = 'completed' OR
            ${roomBookings.paymentStatus} = 'completed'`
      )

    // Calculate percent change from previous month
    const prevMonthRevenueValue = Number(previousMonthRevenue[0]?.sum || 0)
    const currentMonthRevenueValue = Number(currentMonthRevenue[0]?.sum || 0)
    
    let percentChange = 0
    if (prevMonthRevenueValue > 0) {
      percentChange = ((currentMonthRevenueValue - prevMonthRevenueValue) / prevMonthRevenueValue) * 100
    }

    // User counts
    const userCount = await db
      .select({ count: count(user.id) })
      .from(user)
    
    const newUsersThisMonth = await db
      .select({ count: count(user.id) })
      .from(user)
      .where(
        gte(user.createdAt, firstDayOfMonth)
      )

    // Agency counts
    const agencyCount = await db
      .select({ count: count(agencies.id) })
      .from(agencies)
    
    const pendingVerificationCount = await db
      .select({ count: count(agencies.id) })
      .from(agencies)
      .where(
        eq(agencies.verificationStatus, "pending")
      )

    // Booking counts
    const carBookingCount = await db
      .select({ count: count(carBookings.id) })
      .from(carBookings)
    
    const tripBookingCount = await db
      .select({ count: count(tripBookings.id) })
      .from(tripBookings)
    
    const roomBookingCount = await db
      .select({ count: count(roomBookings.id) })
      .from(roomBookings)
    
    const totalBookings = (carBookingCount[0]?.count || 0) + 
                          (tripBookingCount[0]?.count || 0) + 
                          (roomBookingCount[0]?.count || 0)

    // Get bookings this week
    const carBookingsThisWeek = await db
      .select({ count: count(carBookings.id) })
      .from(carBookings)
      .where(
        gte(carBookings.createdAt, oneWeekAgo)
      )
    
    const tripBookingsThisWeek = await db
      .select({ count: count(tripBookings.id) })
      .from(tripBookings)
      .where(
        gte(tripBookings.bookingDate, oneWeekAgo)
      )
    
    const roomBookingsThisWeek = await db
      .select({ count: count(roomBookings.id) })
      .from(roomBookings)
      .where(
        gte(roomBookings.bookingDate, oneWeekAgo)
      )
    
    const thisWeekBookings = (carBookingsThisWeek[0]?.count || 0) + 
                            (tripBookingsThisWeek[0]?.count || 0) + 
                            (roomBookingsThisWeek[0]?.count || 0)

    // Cars data
    const carCount = await db
      .select({ count: count(cars.id) })
      .from(cars)
    
    const pendingCarsCount = await db
      .select({ count: count(cars.id) })
      .from(cars)
      .where(
        eq(cars.status, "pending")
      )
    
    // Find the most booked car
    const mostBookedCar = await db
      .select({
        carId: carBookings.car_id,
        bookingCount: count(carBookings.id),
        brand: cars.brand,
        model: cars.model,
      })
      .from(carBookings)
      .innerJoin(cars, eq(carBookings.car_id, cars.id))
      .groupBy(carBookings.car_id, cars.brand, cars.model)
      .orderBy(desc(sql`count(*)`))
      .limit(1)

    // Trips data
    const tripCount = await db
      .select({ count: count(trips.id) })
      .from(trips)
    
    const pendingTripsCount = await db
      .select({ count: count(trips.id) })
      .from(trips)
      .where(
        eq(trips.status, "pending")
      )
    
    // Find the most popular destination
    const popularDestination = await db
      .select({
        destination: trips.destination,
        bookingCount: count(tripBookings.id),
      })
      .from(tripBookings)
      .innerJoin(trips, eq(tripBookings.tripId, trips.id))
      .groupBy(trips.destination)
      .orderBy(desc(sql`count(*)`))
      .limit(1)

    // Hotels data
    const hotelCount = await db
      .select({ count: count(hotel.id) })
      .from(hotel)
    
    const pendingHotelsCount = await db
      .select({ count: count(hotel.id) })
      .from(hotel)
      .where(
        eq(hotel.status, "pending")
      )
    
    // Count total rooms across all hotels
    const totalRoomsCount = await db
      .select({ count: count(room.id) })
      .from(room)

    // Format all stats
    const stats = {
      revenue: {
        total: Math.round(Number(totalRevenue[0]?.sum || 0)),
        percentChange: percentChange ? Number(percentChange.toFixed(1)) : 0
      },
      users: {
        total: userCount[0]?.count || 0,
        newThisMonth: newUsersThisMonth[0]?.count || 0
      },
      agencies: {
        total: agencyCount[0]?.count || 0,
        pendingVerification: pendingVerificationCount[0]?.count || 0
      },
      bookings: {
        total: totalBookings,
        thisWeek: thisWeekBookings
      },
      cars: {
        total: carCount[0]?.count || 0,
        pending: pendingCarsCount[0]?.count || 0,
        mostBooked: mostBookedCar.length > 0 
          ? `${mostBookedCar[0].brand} ${mostBookedCar[0].model}`
          : "N/A"
      },
      trips: {
        total: tripCount[0]?.count || 0,
        pending: pendingTripsCount[0]?.count || 0,
        popularDestination: popularDestination.length > 0 
          ? popularDestination[0].destination
          : "N/A"
      },
      hotels: {
        total: hotelCount[0]?.count || 0,
        pending: pendingHotelsCount[0]?.count || 0,
        totalRooms: totalRoomsCount[0]?.count || 0
      }
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error getting admin stats:", error)
    return NextResponse.json(
      { error: "Failed to retrieve admin stats" },
      { status: 500 }
    )
  }
} 