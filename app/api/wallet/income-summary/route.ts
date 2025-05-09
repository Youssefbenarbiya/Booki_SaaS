import { type NextRequest, NextResponse } from "next/server"
import { tripBookings, trips, carBookings, cars, roomBookings, room, hotel, agencies, user } from "@/db/schema"
import { eq, sum, and } from "drizzle-orm"
import db from "@/db/drizzle"
import { auth } from "@/auth"
import { headers } from "next/headers"

// Helper function to extract error message
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

// Get income summary for an agency
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
    console.log("Getting income summary for user ID:", userId)

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
        // Get sum of trip bookings for this agency
        const tripBookingsSum = await db
          .select({
            total: sum(tripBookings.totalPrice),
          })
          .from(tripBookings)
          .innerJoin(trips, eq(tripBookings.tripId, trips.id))
          .where(
            and(
              eq(trips.agencyId, agency.userId),
              eq(tripBookings.status, "completed")
            )
          )

        // Get sum of car bookings for this agency
        const carBookingsSum = await db
          .select({
            total: sum(carBookings.total_price),
          })
          .from(carBookings)
          .innerJoin(cars, eq(carBookings.car_id, cars.id))
          .where(
            and(
              eq(cars.agencyId, agency.userId),
              eq(carBookings.status, "completed")
            )
          )

        // Get sum of room bookings for this agency
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
              eq(roomBookings.status, "completed")
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

        const total = tripTotal + carTotal + roomTotal

        const summary = {
          tripBookings: tripTotal,
          carBookings: carTotal,
          roomBookings: roomTotal,
          total,
        }
        
        console.log("Income summary calculated:", summary)

        return NextResponse.json({ summary })
      } catch (queryError) {
        console.error("Error in income summary queries:", queryError)
        return NextResponse.json(
          { 
            error: "Failed to calculate income summary", 
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
    console.error("Error in income summary API:", error)
    return NextResponse.json(
      { 
        error: "Failed to fetch income summary", 
        details: getErrorMessage(error) 
      },
      { status: 500 }
    )
  }
} 