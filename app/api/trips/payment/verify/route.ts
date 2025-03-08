"use server"

import { updateTripBookingPaymentStatus } from "@/actions/tripBookingActions"
import { verifyTripPayment } from "@/services/tripPayment"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const paymentId = searchParams.get("paymentId")
  const bookingId = searchParams.get("bookingId")

  if (!paymentId || !bookingId) {
    return NextResponse.redirect(new URL("/trips/payment/failed", request.url))
  }

  try {
    // Verify payment status
    const paymentData = await verifyTripPayment(paymentId)

    if (!paymentData || !paymentData.result) {
      throw new Error("Invalid payment response")
    }

    if (paymentData.result.status === "succeeded") {
      await updateTripBookingPaymentStatus(
        parseInt(bookingId),
        "completed",
        "flouci"
      )
      return NextResponse.redirect(
        new URL(`/trips/payment/success?bookingId=${bookingId}`, request.url)
      )
    } else {
      await updateTripBookingPaymentStatus(
        parseInt(bookingId),
        "failed",
        "flouci"
      )
      return NextResponse.redirect(
        new URL("/trips/payment/failed", request.url)
      )
    }
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.redirect(new URL("/trips/payment/failed", request.url))
  }
}
