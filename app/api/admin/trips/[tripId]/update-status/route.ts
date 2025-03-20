import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/auth"
import db from "@/db/drizzle"
import { trips } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function POST(
  request: Request,
  { params }: { params: { tripId: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    // Check if user is authorized (admin role)
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get request body
    const body = await request.json()
    const { status } = body

    if (!status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 }
      )
    }

    // Properly handle params in async function
    const tripId = params.tripId
    const parsedTripId = parseInt(tripId, 10)

    if (isNaN(parsedTripId)) {
      return NextResponse.json(
        { success: false, message: "Invalid trip ID" },
        { status: 400 }
      )
    }

    // Check if trip exists
    const trip = await db.query.trips.findFirst({
      where: eq(trips.id, parsedTripId),
    })

    if (!trip) {
      return NextResponse.json(
        { success: false, message: "Trip not found" },
        { status: 404 }
      )
    }

    // Update trip status
    try {
      await db.update(trips).set({ status }).where(eq(trips.id, parsedTripId))
      console.log(`Trip ${parsedTripId} status updated to ${status}`)

      return NextResponse.json(
        { success: true, message: `Trip ${status} successfully` },
        { status: 200 }
      )
    } catch (updateError) {
      console.error("Error updating trip status:", updateError)
      return NextResponse.json(
        { success: false, message: "Database error while updating trip" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error updating trip status:", error)
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    )
  }
}
