// app/api/trip-booking/route.ts
import { NextResponse } from "next/server"
import { tripBookings, trips, user } from "@/db/schema" // ensure you import your user schema too
import { eq } from "drizzle-orm"
import db from "@/db/drizzle"

// GET /api/trip-booking?bookingId=123
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const bookingId = searchParams.get("bookingId")

  if (!bookingId) {
    return NextResponse.json({ error: "Missing bookingId" }, { status: 400 })
  }

  // Fetch the booking details
  const booking = await db.query.tripBookings.findFirst({
    where: eq(tripBookings.id, Number(bookingId)),
  })

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 })
  }

  // Fetch the corresponding trip data
  const trip = await db.query.trips.findFirst({
    where: eq(trips.id, booking.tripId),
  })

  // Fetch the user details based on booking.userId
  const userData = await db.query.user.findFirst({
    where: eq(user.id, booking.userId),
  })

  return NextResponse.json({
    booking: { ...booking, user: userData },
    trip,
  })
}
