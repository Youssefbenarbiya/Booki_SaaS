import db from "@/db/drizzle"
import { tripBookings, trips } from "@/db/schema"
import { eq } from "drizzle-orm"
import { sql } from "drizzle-orm" // Add missing sql import
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { Stripe } from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = (await headers()).get("Stripe-Signature")

    if (!signature) {
      return new NextResponse("Missing Stripe signature", { status: 400 })
    }

    let event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error(
        `⚠️ Webhook signature verification failed: ${
          err instanceof Error ? err.message : err
        }`
      )
      return new NextResponse(
        `Webhook Error: ${
          err instanceof Error ? err.message : "Unknown Error"
        }`,
        { status: 400 }
      )
    }

    console.log(`✅ Success: Received Stripe webhook: ${event.type}`)

    // Handle successful payments
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session

      if (!session?.metadata?.bookingId) {
        return new NextResponse("Missing booking ID in metadata", {
          status: 400,
        })
      }

      const bookingId = parseInt(session.metadata.bookingId)

      // Get the booking to check trip details
      const [booking] = await db
        .select()
        .from(tripBookings)
        .where(eq(tripBookings.id, bookingId))
        .limit(1)

      if (!booking) {
        return new NextResponse("Booking not found", { status: 404 })
      }

      // Update booking status to confirmed
      await db
        .update(tripBookings)
        .set({
          status: "confirmed",
          paymentStatus: "completed",
          paymentDate: new Date(),
        })
        .where(eq(tripBookings.id, bookingId))

      console.log(`✅ Payment confirmed for booking #${bookingId}`)
    }

    // Handle payment failures if needed
    if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session

      if (session?.metadata?.bookingId) {
        const bookingId = parseInt(session.metadata.bookingId)

        // Update booking status to failed
        await db
          .update(tripBookings)
          .set({
            status: "failed",
            paymentStatus: "failed",
          })
          .where(eq(tripBookings.id, bookingId))

        // Get the booking details to restore trip capacity
        const [booking] = await db
          .select()
          .from(tripBookings)
          .where(eq(tripBookings.id, bookingId))
          .limit(1)

        if (booking) {
          // Restore trip capacity
          await db
            .update(trips)
            .set({
              capacity: sql`${trips.capacity} + ${booking.seatsBooked}`,
            })
            .where(eq(trips.id, booking.tripId))
        }

        console.log(
          `⚠️ Payment failed for booking #${bookingId}, capacity restored`
        )
      }
    }

    return new NextResponse(null, { status: 200 })
  } catch (error) {
    console.error("Stripe webhook error:", error)
    return new NextResponse(
      `Webhook Error: ${
        error instanceof Error ? error.message : "Unknown Error"
      }`,
      { status: 400 }
    )
  }
}
