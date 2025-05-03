import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/auth"
import db from "@/db/drizzle"
import { trips } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> } 
) {
  try {
    // Await headers() since it's now async
    const hdrs = await headers()
    const session = await auth.api.getSession({ headers: hdrs })

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { status } = await request.json()
    if (!status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 }
      )
    }

    // Await params promise and extract tripId
    const { tripId: tripIdStr } = await params
    const parsedTripId = parseInt(tripIdStr, 10)
    if (isNaN(parsedTripId)) {
      return NextResponse.json(
        { success: false, message: "Invalid trip ID" },
        { status: 400 }
      )
    }

    const trip = await db.query.trips.findFirst({
      where: eq(trips.id, parsedTripId),
    })
    if (!trip) {
      return NextResponse.json(
        { success: false, message: "Trip not found" },
        { status: 404 }
      )
    }

    // Perform the update
    await db.update(trips).set({ status }).where(eq(trips.id, parsedTripId))

    console.log(`Trip ${parsedTripId} status updated to ${status}`)
    return NextResponse.json(
      { success: true, message: `Trip ${status} successfully` },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error updating trip status:", error)
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    )
  }
}
