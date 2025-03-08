import { updateTripBookingPaymentStatus } from "@/actions/tripBookingActions"
import { verifyTripPayment } from "@/services/tripPaymentService"
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
    console.log("Verifying payment ID:", paymentId, "for booking ID:", bookingId);
    const paymentData = await verifyTripPayment(paymentId)
    console.log("Payment verification response:", paymentData);

    if (!paymentData || !paymentData.result) {
      return NextResponse.json(
        { error: "Invalid payment verification response" },
        { status: 500 }
      )
    }

    // Update booking payment status
    console.log("Payment status:", paymentData.result?.status);
    if (paymentData.result?.status === "completed") {
      await updateTripBookingPaymentStatus(
        parseInt(bookingId),
        "completed",
        "flouci"
      )
      return NextResponse.json({ success: true, status: "completed" })
    } else {
      await updateTripBookingPaymentStatus(
        parseInt(bookingId), 
        "failed", 
        "flouci"
      )
      return NextResponse.json({ success: false, status: "failed" })
    }
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json(
      { error: `Failed to verify payment: ${error.message}` },
      { status: 500 }
    )
  }
}
