// app/api/booking/[bookingId]/route.ts
import { NextResponse } from "next/server"
import { getCarBookingDetails } from "@/actions/get-car-booking"

export async function GET(
  request: Request,
  { params }: { params: { bookingId: string } }
) {
  const bookingId = parseInt(params.bookingId, 10)
  const result = await getCarBookingDetails(bookingId)

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 404 })
  }

  // Return the data directly
  return NextResponse.json(result.data)
}
