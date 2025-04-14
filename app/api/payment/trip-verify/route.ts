import { updateTripBookingPaymentStatus } from "@/actions/trips/tripBookingActions"
import { verifyTripPayment } from "@/services/tripPaymentFlouci"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const paymentId = searchParams.get("paymentId")
  const bookingId = searchParams.get("bookingId")

  if (!paymentId || !bookingId) {
    return NextResponse.json(
      { error: "Missing paymentId or bookingId" },
      { status: 400 }
    )
  }

  try {
    // Verify payment status
    const paymentData = await verifyTripPayment(paymentId)

    // Update booking payment status
    if (paymentData.result.status === "completed") {
      await updateTripBookingPaymentStatus(
        parseInt(bookingId),
        "completed",
        "FLOUCI_TND" // Mark as TND payment via Flouci
      )
      return NextResponse.json({ success: true, status: "completed" })
    } else {
      await updateTripBookingPaymentStatus(
        parseInt(bookingId), 
        "failed", 
        "FLOUCI_TND"
      )
      return NextResponse.json({ success: false, status: "failed" })
    }
  } catch (error) {
    console.error("Error verifying trip payment:", error)
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    )
  }
} 