import { type NextRequest, NextResponse } from "next/server"
import { wallet, walletTransactions, tripBookings, trips, carBookings, cars, roomBookings, room, hotel, agencies } from "@/db/schema"
import { eq, sum, and } from "drizzle-orm"
import db from "@/db/drizzle"
import { auth } from "@/auth"
import { headers } from "next/headers"

// Helper function to extract error message
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

// Calculate total earnings from bookings
async function calculateEarnings(agencyId: string) {
  try {
    // Get sum of trip bookings for this agency with status "completed"
    const tripBookingsSum = await db
      .select({
        total: sum(tripBookings.totalPrice),
      })
      .from(tripBookings)
      .innerJoin(trips, eq(tripBookings.tripId, trips.id))
      .where(
        and(
          eq(trips.agencyId, agencyId),
          eq(tripBookings.paymentStatus, "completed")
        )
      )

    // Get sum of car bookings for this agency with status "completed"
    const carBookingsSum = await db
      .select({
        total: sum(carBookings.total_price),
      })
      .from(carBookings)
      .innerJoin(cars, eq(carBookings.car_id, cars.id))
      .where(
        and(
          eq(cars.agencyId, agencyId),
          eq(carBookings.paymentStatus, "completed")
        )
      )

    // Get sum of room bookings for this agency with status "completed"
    const roomBookingsSum = await db
      .select({
        total: sum(roomBookings.totalPrice),
      })
      .from(roomBookings)
      .innerJoin(room, eq(roomBookings.roomId, room.id))
      .innerJoin(hotel, eq(room.hotelId, hotel.id))
      .where(
        and(
          eq(hotel.agencyId, agencyId),
          eq(roomBookings.paymentStatus, "completed")
        )
      )

    // Parse values and handle nulls
    const tripTotal = tripBookingsSum[0]?.total 
      ? parseFloat(tripBookingsSum[0].total.toString()) 
      : 0
    
    const carTotal = carBookingsSum[0]?.total 
      ? parseFloat(carBookingsSum[0].total.toString()) 
      : 0
    
    const roomTotal = roomBookingsSum[0]?.total 
      ? parseFloat(roomBookingsSum[0].total.toString()) 
      : 0

    const totalEarnings = tripTotal + carTotal + roomTotal
    
    return {
      tripBookings: tripTotal,
      carBookings: carTotal,
      roomBookings: roomTotal,
      totalEarnings,
    }
  } catch (error) {
    console.error("Error calculating earnings:", error)
    throw error
  }
}

// Get wallet for a user
export async function GET(request: NextRequest) {
  try {
    // Get session from auth
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      console.log("No user ID in session:", session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    console.log("Getting wallet for user ID:", userId)

    try {
      // Find agency by user ID
      const agency = await db.query.agencies.findFirst({
        where: eq(agencies.userId, userId),
      })

      if (!agency) {
        console.log("Agency not found for user ID:", userId)
        return NextResponse.json({ error: "Agency not found" }, { status: 404 })
      }
      
      // Find or create wallet
      let userWallet = await db.query.wallet.findFirst({
        where: eq(wallet.userId, userId),
      })
      
      console.log("Found wallet:", userWallet)

      if (!userWallet) {
        console.log("No wallet found, creating one")
        try {
          const newWallet = await db
            .insert(wallet)
            .values({
              userId: userId,
            })
            .returning()
            
          console.log("Created new wallet:", newWallet)
          userWallet = newWallet[0]
        } catch (insertError) {
          console.error("Error creating wallet:", insertError)
          return NextResponse.json(
            { 
              error: "Failed to create wallet", 
              details: getErrorMessage(insertError)
            },
            { status: 500 }
          )
        }
      }

      // Calculate earnings from bookings
      const earnings = await calculateEarnings(agency.userId)
      console.log("Calculated earnings:", earnings)

      // Get sum of withdrawal amounts
      const withdrawalsSum = await db
        .select({
          total: sum(walletTransactions.amount),
        })
        .from(walletTransactions)
        .where(
          and(
            eq(walletTransactions.walletId, userWallet.id),
            eq(walletTransactions.type, "withdrawal"),
            eq(walletTransactions.status, "completed")
          )
        )

      const totalWithdrawals = withdrawalsSum[0]?.total
        ? parseFloat(withdrawalsSum[0].total.toString())
        : 0
        
      console.log("Total withdrawals:", totalWithdrawals)

      // Calculate the current balance
      const balance = earnings.totalEarnings - totalWithdrawals
      
      // Update the wallet balance
      const updatedWallet = await db
        .update(wallet)
        .set({
          balance: balance.toString(),
          updatedAt: new Date(),
        })
        .where(eq(wallet.id, userWallet.id))
        .returning()
        
      console.log("Updated wallet balance:", updatedWallet[0])

      return NextResponse.json({
        wallet: updatedWallet[0],
        calculations: {
          ...earnings,
          totalWithdrawals,
          balance
        }
      })
    } catch (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json(
        { 
          error: "Database error", 
          details: getErrorMessage(dbError)
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error in wallet API:", error)
    return NextResponse.json(
      { 
        error: "Failed to fetch wallet", 
        details: getErrorMessage(error)
      },
      { status: 500 }
    )
  }
}
