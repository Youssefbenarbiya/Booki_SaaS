import { verifyCarPayment } from "@/services/carPayment"
import { NextRequest, NextResponse } from "next/server"
import db from "@/db/drizzle"
import { carBookings } from "@/db/schema"
import { eq } from "drizzle-orm"

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
    const paymentData = await verifyCarPayment(paymentId)

    // Check if booking exists
    const bookingIdNumber = parseInt(bookingId)
    const [booking] = await db
      .select()
      .from(carBookings)
      .where(eq(carBookings.id, bookingIdNumber))
      .limit(1)

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Update booking payment status
    if (paymentData.result.status === "completed") {
      // Confirm the booking with TND payment
      await db
        .update(carBookings)
        .set({
          status: "confirmed",
          paymentStatus: "completed",
          paymentMethod: "FLOUCI_TND",
          paymentCurrency: "TND",
          paymentDate: new Date(),
        })
        .where(eq(carBookings.id, bookingIdNumber))

      console.log(`✅ Flouci Payment confirmed for car booking #${bookingId} (TND payment)`)
      return NextResponse.json({ success: true, status: "completed" })
    } else {
      // Mark as failed if payment failed
      await db
        .update(carBookings)
        .set({
          status: "failed",
          paymentStatus: "failed",
          paymentMethod: "FLOUCI_TND",
        })
        .where(eq(carBookings.id, bookingIdNumber))

      console.log(`❌ Flouci Payment failed for car booking #${bookingId}`)
      return NextResponse.json({ success: false, status: "failed" })
    }
  } catch (error) {
    console.error("Error verifying car payment:", error)
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    )
  }
} 