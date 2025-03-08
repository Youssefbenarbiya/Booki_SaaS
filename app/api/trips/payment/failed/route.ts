import { updateTripBookingPaymentStatus } from "@/actions/tripBookingActions"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const bookingId = searchParams.get("bookingId")

  if (bookingId) {
    try {
      await updateTripBookingPaymentStatus(
        parseInt(bookingId),
        "failed",
        "flouci"
      )
    } catch (error) {
      console.error("Error updating payment status:", error)
    }
  }

  return NextResponse.redirect(new URL("/trips/payment/failed", request.url))
}
