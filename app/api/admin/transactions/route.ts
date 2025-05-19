import { NextResponse } from "next/server"
import db from "@/db/drizzle"
import { carBookings, tripBookings, roomBookings, user } from "@/db/schema"
import { sql, desc, eq } from "drizzle-orm"
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

    // Combine recent transactions from all booking types
    // First, get car bookings with payment info
    const recentCarBookings = await db
      .select({
        id: carBookings.id,
        amount: carBookings.total_price,
        status: carBookings.paymentStatus,
        date: carBookings.paymentDate,
        type: sql<string>`'car'`,
        userId: carBookings.user_id,
        email: user.email,
        name: user.name,
      })
      .from(carBookings)
      .leftJoin(user, eq(carBookings.user_id, user.id))
      .where(sql`${carBookings.paymentStatus} IS NOT NULL`)
      .orderBy(desc(carBookings.paymentDate))
      .limit(10)

    // Get trip bookings with payment info
    const recentTripBookings = await db
      .select({
        id: tripBookings.id,
        amount: tripBookings.totalPrice,
        status: tripBookings.paymentStatus,
        date: tripBookings.paymentDate,
        type: sql<string>`'trip'`,
        userId: tripBookings.userId,
        email: user.email,
        name: user.name,
      })
      .from(tripBookings)
      .leftJoin(user, eq(tripBookings.userId, user.id))
      .where(sql`${tripBookings.paymentStatus} IS NOT NULL`)
      .orderBy(desc(tripBookings.paymentDate))
      .limit(10)

    // Get room bookings with payment info
    const recentRoomBookings = await db
      .select({
        id: roomBookings.id,
        amount: roomBookings.totalPrice,
        status: roomBookings.paymentStatus,
        date: roomBookings.paymentDate,
        type: sql<string>`'hotel'`,
        userId: roomBookings.userId,
        email: user.email,
        name: user.name,
      })
      .from(roomBookings)
      .leftJoin(user, eq(roomBookings.userId, user.id))
      .where(sql`${roomBookings.paymentStatus} IS NOT NULL`)
      .orderBy(desc(roomBookings.paymentDate))
      .limit(10)

    // Combine and sort all bookings
    const allTransactions = [
      ...recentCarBookings,
      ...recentTripBookings,
      ...recentRoomBookings,
    ]
      .sort((a, b) => {
        // Sort by date descending (most recent first)
        const dateA = a.date ? new Date(a.date).getTime() : 0
        const dateB = b.date ? new Date(b.date).getTime() : 0
        return dateB - dateA
      })
      .slice(0, 5) // Only return the 5 most recent transactions

    // Format transactions for the frontend
    const formattedTransactions = allTransactions.map((transaction) => ({
      id: String(transaction.id),
      amount: Number(transaction.amount) || 0,
      status: transaction.status || "pending",
      email: transaction.email || "user@example.com",
      name: transaction.name || "Unknown User",
      type: transaction.type,
      date: transaction.date?.toISOString() || new Date().toISOString(),
    }))

    return NextResponse.json({ data: formattedTransactions })
  } catch (error) {
    console.error("Error getting transaction data:", error)
    return NextResponse.json(
      { error: "Failed to retrieve transaction data" },
      { status: 500 }
    )
  }
} 