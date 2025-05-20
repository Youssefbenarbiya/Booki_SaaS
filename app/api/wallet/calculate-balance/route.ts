/* eslint-disable @typescript-eslint/no-unused-vars */
import { type NextRequest, NextResponse } from "next/server"
import { tripBookings, trips, carBookings, cars, roomBookings, room, hotel, agencies, user, wallet, walletTransactions } from "@/db/schema"
import { eq, sum, and } from "drizzle-orm"
import db from "@/db/drizzle"
import { auth } from "@/auth"
import { headers } from "next/headers"

// Helper function to extract error message
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

// Calculate and update wallet balance from completed bookings
export async function POST(request: NextRequest) {
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
    console.log("Calculating balance for user ID:", userId)

    try {
      // Find agency by user ID
      const agency = await db.query.agencies.findFirst({
        where: eq(agencies.userId, userId),
      })

      if (!agency) {
        console.log("Agency not found for user ID:", userId)
        return NextResponse.json({ error: "Agency not found" }, { status: 404 })
      }
      
      console.log("Found agency:", agency.agencyName)

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
              eq(trips.agencyId, agency.userId),
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
              eq(cars.agencyId, agency.userId),
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
              eq(hotel.agencyId, agency.userId),
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
        
        console.log("Total earnings calculated:", {
          tripTotal,
          carTotal,
          roomTotal,
          totalEarnings
        })

        // Find or create wallet for this user
        let userWallet = await db.query.wallet.findFirst({
          where: eq(wallet.userId, userId),
        })

        if (!userWallet) {
          console.log("No wallet found, creating one")
          const newWallet = await db
            .insert(wallet)
            .values({
              userId: userId,
            })
            .returning()
            
          userWallet = newWallet[0]
          console.log("Created wallet:", userWallet)
        }

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
        const balance = totalEarnings - totalWithdrawals
        
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
          success: true, 
          wallet: updatedWallet[0],
          calculations: {
            tripBookings: tripTotal,
            carBookings: carTotal,
            roomBookings: roomTotal,
            totalEarnings,
            totalWithdrawals,
            balance
          }
        })
      } catch (queryError) {
        console.error("Error in balance calculation:", queryError)
        return NextResponse.json(
          { 
            error: "Failed to calculate balance", 
            details: getErrorMessage(queryError) 
          },
          { status: 500 }
        )
      }
    } catch (agencyError) {
      console.error("Error finding agency:", agencyError)
      return NextResponse.json(
        { 
          error: "Error finding agency", 
          details: getErrorMessage(agencyError) 
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error in calculate balance API:", error)
    return NextResponse.json(
      { 
        error: "Failed to calculate balance", 
        details: getErrorMessage(error) 
      },
      { status: 500 }
    )
  }
} 