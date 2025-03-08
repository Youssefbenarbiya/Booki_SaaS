import { updateTripBookingPaymentStatus } from "@/actions/tripBookingActions"
import { verifyTripPayment } from "@/services/tripPayment"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const paymentId = searchParams.get("payment_id") // Flouci returns payment_id
  const bookingId = searchParams.get("bookingId")

  if (!paymentId || !bookingId) {
    console.error("Missing payment or booking ID", { paymentId, bookingId })
    return NextResponse.redirect(new URL("/trips/payment/failed", request.url))
  }

  try {
    console.log(`Verifying payment: ${paymentId} for booking: ${bookingId}`)

    // Update the booking status immediately to avoid payment timeouts
    await updateTripBookingPaymentStatus(
      parseInt(bookingId),
      "completed",
      "flouci"
    )

    // Then verify the payment (non-blocking)
    verifyTripPayment(paymentId)
      .then((data) => {
        console.log("Payment verification result:", data)
      })
      .catch((err) => {
        console.error("Payment verification error:", err)
      })

    // Redirect to success page with the correct path
    return NextResponse.redirect(
      new URL(`/trips/payment/success?bookingId=${bookingId}`, request.url)
    )
  } catch (error) {
    console.error("Error processing payment success:", error)
    return NextResponse.redirect(new URL("/trips/payment/failed", request.url))
  }
}
