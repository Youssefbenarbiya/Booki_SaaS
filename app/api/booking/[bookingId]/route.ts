// app/api/booking/[bookingId]/route.ts
import { NextResponse } from "next/server"
import { getCarBookingDetails } from "@/actions/cars/get-car-booking"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  // Await the params promise before destructuring
  const { bookingId } = await params
  const bookingIdNum = parseInt(bookingId, 10)
  const result = await getCarBookingDetails(bookingIdNum)

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 404 })
  }

  return NextResponse.json(result.data)
}
