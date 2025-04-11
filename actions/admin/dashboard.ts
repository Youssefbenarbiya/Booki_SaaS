import db from "@/db/drizzle"
import {
  user,
  trips,
  tripBookings,
  hotel,
  roomBookings,
  cars,
  carBookings,
  blogs,
} from "@/db/schema"
import { count, eq, desc, sql } from "drizzle-orm"

// Get overview stats for the dashboard
export async function getDashboardStats() {
  // User stats
  const totalUsers = await db.select({ count: count() }).from(user)
  const customerCount = await db
    .select({ count: count() })
    .from(user)
    .where(eq(user.role, "customer"))
  const agencyCount = await db
    .select({ count: count() })
    .from(user)
    .where(eq(user.role, "agency"))

  // Content stats
  const totalTrips = await db.select({ count: count() }).from(trips)
  const totalHotels = await db.select({ count: count() }).from(hotel)
  const totalCars = await db.select({ count: count() }).from(cars)
  const totalBlogs = await db.select({ count: count() }).from(blogs)

  // Pending approvals
  const pendingTrips = await db
    .select({ count: count() })
    .from(trips)
    .where(eq(trips.status, "pending"))
  const pendingHotels = await db
    .select({ count: count() })
    .from(hotel)
    .where(eq(hotel.status, "pending"))
  const pendingCars = await db
    .select({ count: count() })
    .from(cars)
    .where(eq(cars.status, "pending"))
  const pendingBlogs = await db
    .select({ count: count() })
    .from(blogs)
    .where(eq(blogs.status, "pending"))

  // Booking stats
  const totalTripBookings = await db
    .select({ count: count() })
    .from(tripBookings)
  const totalRoomBookings = await db
    .select({ count: count() })
    .from(roomBookings)
  const totalCarBookings = await db.select({ count: count() }).from(carBookings)

  // Revenue calculations
  const tripRevenue = await db
    .select({
      total: sql<number>`sum(cast(total_price as numeric))`,
    })
    .from(tripBookings)
    .where(eq(tripBookings.paymentStatus, "completed"))

  const roomRevenue = await db
    .select({
      total: sql<number>`sum(cast(total_price as numeric))`,
    })
    .from(roomBookings)
    .where(eq(roomBookings.paymentStatus, "completed"))

  const carRevenue = await db
    .select({
      total: sql<number>`sum(cast(total_price as numeric))`,
    })
    .from(carBookings)
    .where(eq(carBookings.paymentStatus, "completed"))

  // Ensure all values are converted to numbers and handle nulls
  const tripsTotal = Number(tripRevenue[0]?.total || 0)
  const roomsTotal = Number(roomRevenue[0]?.total || 0)
  const carsTotal = Number(carRevenue[0]?.total || 0)
  const revenueTotal = tripsTotal + roomsTotal + carsTotal

  return {
    users: {
      total: totalUsers[0].count,
      customers: customerCount[0].count,
      agencies: agencyCount[0].count,
    },
    content: {
      trips: totalTrips[0].count,
      hotels: totalHotels[0].count,
      cars: totalCars[0].count,
      blogs: totalBlogs[0].count,
    },
    pending: {
      trips: pendingTrips[0].count,
      hotels: pendingHotels[0].count,
      cars: pendingCars[0].count,
      blogs: pendingBlogs[0].count,
      total:
        pendingTrips[0].count +
        pendingHotels[0].count +
        pendingCars[0].count +
        pendingBlogs[0].count,
    },
    bookings: {
      trips: totalTripBookings[0].count,
      rooms: totalRoomBookings[0].count,
      cars: totalCarBookings[0].count,
      total:
        totalTripBookings[0].count +
        totalRoomBookings[0].count +
        totalCarBookings[0].count,
    },
    revenue: {
      trips: tripsTotal,
      rooms: roomsTotal,
      cars: carsTotal,
      total: revenueTotal,
    },
  }
}

// Get recent activities
export async function getRecentActivities() {
  // Recent users
  const recentUsers = await db.query.user.findMany({
    orderBy: [desc(user.createdAt)],
    limit: 5,
  })

  // Recent trip bookings
  const recentTripBookings = await db.query.tripBookings.findMany({
    orderBy: [desc(tripBookings.bookingDate)],
    limit: 5,
    with: {
      trip: true,
      user: true,
    },
  })

  // Recent room bookings
  const recentRoomBookings = await db.query.roomBookings.findMany({
    orderBy: [desc(roomBookings.bookingDate)],
    limit: 5,
    with: {
      room: true,
      user: true,
    },
  })

  return {
    users: recentUsers,
    tripBookings: recentTripBookings,
    roomBookings: recentRoomBookings,
  }
}

// Get booking statistics by status
export async function getBookingStatistics() {
  // Trip bookings by status
  const tripBookingsByStatus = await db
    .select({
      status: tripBookings.status,
      count: count(),
    })
    .from(tripBookings)
    .groupBy(tripBookings.status)

  // Room bookings by status
  const roomBookingsByStatus = await db
    .select({
      status: roomBookings.status,
      count: count(),
    })
    .from(roomBookings)
    .groupBy(roomBookings.status)

  // Car bookings by status
  const carBookingsByStatus = await db
    .select({
      status: carBookings.status,
      count: count(),
    })
    .from(carBookings)
    .groupBy(carBookings.status)

  return {
    tripBookings: tripBookingsByStatus,
    roomBookings: roomBookingsByStatus,
    carBookings: carBookingsByStatus,
  }
}
