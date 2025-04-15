import db from "@/db/drizzle"
import { roomBookings } from "@/db/schema"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { verifyPayment } from "@/services/roomFlouciPayment"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // Validate the webhook payload
    if (!body || !body.payment_id || !body.developer_tracking_id) {
      return new NextResponse("Invalid webhook payload", { status: 400 })
    }

    // Extract data from the webhook payload
    const paymentId = body.payment_id
    const developerTrackingId = body.developer_tracking_id
    
    console.log(`✅ Received Flouci webhook for payment ID: ${paymentId}`)
    console.log(`Developer tracking ID: ${developerTrackingId}`)
    
    // Extract booking ID from developer tracking ID
    // Format is typically: "room_booking_123" or just the booking ID number
    let bookingId: number
    
    if (developerTrackingId.includes("room_booking_")) {
      bookingId = parseInt(developerTrackingId.replace("room_booking_", ""))
    } else {
      bookingId = parseInt(developerTrackingId)
    }
    
    if (isNaN(bookingId)) {
      return new NextResponse("Invalid booking ID in developer tracking ID", { status: 400 })
    }
    
    // Verify the payment status with Flouci API
    const paymentData = await verifyPayment(paymentId)
    
    if (!paymentData || !paymentData.result) {
      return new NextResponse("Failed to verify payment with Flouci", { status: 500 })
    }
    
    // Check if the booking exists
    const [booking] = await db
      .select()
      .from(roomBookings)
      .where(eq(roomBookings.id, bookingId))
      .limit(1)
    
    if (!booking) {
      return new NextResponse("Room booking not found", { status: 404 })
    }
    
    // Update booking status based on payment status
    if (paymentData.result.status === "completed") {
      await db
        .update(roomBookings)
        .set({
          status: "confirmed",
          paymentStatus: "completed",
          paymentDate: new Date(),
          paymentMethod: "FLOUCI_TND", // Explicitly set payment method
          paymentCurrency: "TND", // Explicitly set payment currency
        })
        .where(eq(roomBookings.id, bookingId))
      
      console.log(`✅ Payment confirmed for room booking #${bookingId} (TND payment via Flouci)`)
    } else if (paymentData.result.status === "failed" || paymentData.result.status === "canceled") {
      await db
        .update(roomBookings)
        .set({
          status: "failed",
          paymentStatus: "failed",
        })
        .where(eq(roomBookings.id, bookingId))
      
      console.log(`⚠️ Payment failed for room booking #${bookingId}`)
    } else {
      console.log(`ℹ️ Payment status for room booking #${bookingId} is: ${paymentData.result.status}`)
    }
    
    return new NextResponse(null, { status: 200 })
  } catch (error) {
    console.error("Flouci webhook error:", error)
    return new NextResponse(
      `Webhook Error: ${error instanceof Error ? error.message : "Unknown Error"}`,
      { status: 500 }
    )
  }
} 