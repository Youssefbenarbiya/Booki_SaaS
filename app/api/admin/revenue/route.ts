import { NextResponse } from "next/server"
import db from "@/db/drizzle"
import { carBookings, tripBookings, roomBookings } from "@/db/schema"
import { sql } from "drizzle-orm"
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

    // Get current year
    const currentYear = new Date().getFullYear()
    
    // Generate months array
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ]

    // Get revenue data by month for car bookings
    const carRevenueByMonth = await db
      .select({
        month: sql<number>`EXTRACT(MONTH FROM ${carBookings.paymentDate})`,
        total: sql<number>`SUM(CAST(${carBookings.total_price} AS DECIMAL))`
      })
      .from(carBookings)
      .where(
        sql`${carBookings.paymentStatus} = 'completed' AND 
            EXTRACT(YEAR FROM ${carBookings.paymentDate}) = ${currentYear}`
      )
      .groupBy(sql`EXTRACT(MONTH FROM ${carBookings.paymentDate})`)

    // Get revenue data by month for trip bookings
    const tripRevenueByMonth = await db
      .select({
        month: sql<number>`EXTRACT(MONTH FROM ${tripBookings.paymentDate})`,
        total: sql<number>`SUM(CAST(${tripBookings.totalPrice} AS DECIMAL))`
      })
      .from(tripBookings)
      .where(
        sql`${tripBookings.paymentStatus} = 'completed' AND 
            EXTRACT(YEAR FROM ${tripBookings.paymentDate}) = ${currentYear}`
      )
      .groupBy(sql`EXTRACT(MONTH FROM ${tripBookings.paymentDate})`)

    // Get revenue data by month for room bookings
    const roomRevenueByMonth = await db
      .select({
        month: sql<number>`EXTRACT(MONTH FROM ${roomBookings.paymentDate})`,
        total: sql<number>`SUM(CAST(${roomBookings.totalPrice} AS DECIMAL))`
      })
      .from(roomBookings)
      .where(
        sql`${roomBookings.paymentStatus} = 'completed' AND 
            EXTRACT(YEAR FROM ${roomBookings.paymentDate}) = ${currentYear}`
      )
      .groupBy(sql`EXTRACT(MONTH FROM ${roomBookings.paymentDate})`)

    // Combine and aggregate all revenue data
    const revenueData: Record<number, number> = {}
    
    // Initialize all months with 0
    for (let i = 1; i <= 12; i++) {
      revenueData[i] = 0
    }

    // Add car revenue
    carRevenueByMonth.forEach(item => {
      if (item.month && item.total) {
        revenueData[item.month] = (revenueData[item.month] || 0) + Number(item.total)
      }
    })

    // Add trip revenue
    tripRevenueByMonth.forEach(item => {
      if (item.month && item.total) {
        revenueData[item.month] = (revenueData[item.month] || 0) + Number(item.total)
      }
    })

    // Add room revenue
    roomRevenueByMonth.forEach(item => {
      if (item.month && item.total) {
        revenueData[item.month] = (revenueData[item.month] || 0) + Number(item.total)
      }
    })
    
    // Format data for the chart
    const chartData = months.map((name, idx) => {
      const monthNum = idx + 1
      return {
        name,
        total: Math.round(revenueData[monthNum] || 0)
      }
    })
    
    return NextResponse.json({ data: chartData })
  } catch (error) {
    console.error("Error getting revenue data:", error)
    return NextResponse.json(
      { error: "Failed to retrieve revenue data" },
      { status: 500 }
    )
  }
} 