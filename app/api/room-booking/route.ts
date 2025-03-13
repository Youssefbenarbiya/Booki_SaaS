import { NextResponse } from "next/server"
import db from "@/db/drizzle" // Adjust the path to your DB instance
import { roomBookings, room, hotel, user } from "@/db/schema"
import { eq } from "drizzle-orm"

// GET /api/room-booking?bookingId=123
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const bookingId = searchParams.get("bookingId")

  if (!bookingId) {
    return NextResponse.json({ error: "Missing bookingId" }, { status: 400 })
  }

  // Fetch the room booking record
  const booking = await db.query.roomBookings.findFirst({
    where: eq(roomBookings.id, Number(bookingId)),
  })
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 })
  }

  // Fetch the related room record
  const roomRecord = await db.query.room.findFirst({
    where: eq(room.id, booking.roomId),
  })
  if (!roomRecord) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 })
  }

  // Fetch the hotel record using the room's hotelId
  const hotelRecord = await db.query.hotel.findFirst({
    where: eq(hotel.id, roomRecord.hotelId),
  })
  if (!hotelRecord) {
    return NextResponse.json({ error: "Hotel not found" }, { status: 404 })
  }

  // Fetch the user record
  const userRecord = await db.query.user.findFirst({
    where: eq(user.id, booking.userId),
  })
  if (!userRecord) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  return NextResponse.json({
    booking: { ...booking, user: userRecord },
    room: roomRecord,
    hotel: hotelRecord,
  })
}
