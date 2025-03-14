import { updateBookingPaymentStatus } from "@/actions/roomBookingActions"
import { verifyPayment } from "@/services/roomFlouciPayment"
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
    const paymentData = await verifyPayment(paymentId)

    // Update booking payment status
    if (paymentData.result.status === "completed") {
      await updateBookingPaymentStatus(
        parseInt(bookingId),
        "completed",
        "flouci"
      )
      return NextResponse.json({ success: true, status: "completed" })
    } else {
      await updateBookingPaymentStatus(parseInt(bookingId), "failed", "flouci")
      return NextResponse.json({ success: false, status: "failed" })
    }
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    )
  }
}
