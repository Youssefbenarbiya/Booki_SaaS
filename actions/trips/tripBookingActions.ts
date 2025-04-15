"use server"

import { tripBookings, trips } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { generateTripPaymentLink } from "@/services/tripPaymentFlouci"
import { sql } from "drizzle-orm"
import { stripe } from "@/lib/stripe"
import db from "@/db/drizzle"
import { convertCurrency } from "@/lib/currencyUtils"

interface CreateBookingParams {
  tripId: number
  userId: string
  seatsBooked: number
  totalPrice?: number
  status?: string
  paymentMethod?: "flouci" | "stripe"
  convertedPricePerSeat?: number
  paymentCurrency?: string
}

export async function createBooking({
  tripId,
  userId,
  seatsBooked,
  pricePerSeat,
  convertedPricePerSeat,
  paymentCurrency,
  paymentMethod,
}: CreateBookingParams & { 
  pricePerSeat: number,
  convertedPricePerSeat?: number,
  paymentCurrency?: string,
  paymentMethod?: string
}) {
  try {
    // Get trip to check capacity
    const trip = await db.query.trips.findFirst({
      where: eq(trips.id, tripId),
    })

    if (!trip) {
      throw new Error("Trip not found")
    }

    if (!trip.isAvailable) {
      throw new Error("Trip is not available for booking")
    }

    if (seatsBooked > trip.capacity) {
      throw new Error("Not enough seats available")
    }

    // Use the converted price for calculating total if provided
    const effectivePricePerSeat = convertedPricePerSeat || pricePerSeat
    const totalPrice = seatsBooked * effectivePricePerSeat
    
    console.log(`Creating booking with price per seat: ${effectivePricePerSeat} ${paymentCurrency || trip.currency}`)
    console.log(`Total price: ${totalPrice} ${paymentCurrency || trip.currency}`)

    const [booking] = await db
      .insert(tripBookings)
      .values({
        tripId: tripId,
        userId: userId,
        seatsBooked: seatsBooked,
        totalPrice: sql`${totalPrice}::decimal`,
        status: "pending", // Start as pending until payment is confirmed
        bookingDate: new Date(),
        paymentCurrency: paymentCurrency || trip.currency, // Store the payment currency
        originalCurrency: trip.currency, // Store the original currency for reference
        originalPricePerSeat: sql`${pricePerSeat}::decimal`, // Store the original price
      })
      .returning()

    // Update trip capacity
    await db
      .update(trips)
      .set({
        capacity: trip.capacity - seatsBooked,
      })
      .where(eq(trips.id, tripId))

    revalidatePath(`/trips/${tripId}`)
    return booking
  } catch (error) {
    console.error("Error creating booking:", error)
    throw error
  }
}

export async function createBookingWithPayment({
  tripId,
  userId,
  seatsBooked,
  pricePerSeat,
  paymentMethod = "flouci", // Default to flouci if not specified
}: CreateBookingParams & { pricePerSeat: number }) {
  try {
    // Get trip to check details
    const trip = await db.query.trips.findFirst({
      where: eq(trips.id, tripId),
    })

    if (!trip) {
      throw new Error("Trip not found")
    }

    // Get the trip's original currency from the database
    const tripCurrency = trip.currency || "TND" // Default to TND if not specified
    
    console.log(`Trip currency: ${tripCurrency}, Price per seat: ${pricePerSeat}`)

    // Calculate total price in the trip's original currency
    const totalPriceInOriginalCurrency = seatsBooked * pricePerSeat

    // Handle payment based on selected method
    if (paymentMethod === "stripe") {
      try {
        // Convert price to USD for Stripe regardless of trip's currency
        const pricePerSeatInUSD = await convertCurrency(pricePerSeat, tripCurrency, "USD")
        console.log(`Converting from ${tripCurrency} to USD: ${pricePerSeat} -> ${pricePerSeatInUSD}`)
        
        // Create the initial booking with the CONVERTED USD price
        const booking = await createBooking({
          tripId,
          userId,
          seatsBooked,
          pricePerSeat,
          convertedPricePerSeat: pricePerSeatInUSD,
          paymentCurrency: "USD",
          paymentMethod: "STRIPE_USD",
        })

        if (!booking) {
          throw new Error("Failed to create booking")
        }

        console.log(`Booking created: #${booking.id}, processing payment via Stripe in USD`)
        
        // Create Stripe checkout session with USD
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "usd", // Stripe payment always in USD
                product_data: {
                  name: trip.name,
                  description: `Trip to ${trip.destination}`,
                },
                unit_amount: Math.round(pricePerSeatInUSD * 100), // Stripe uses cents
              },
              quantity: seatsBooked,
            },
          ],
          mode: "payment",
          success_url: `${process.env.NEXT_PUBLIC_APP_URL}/trips/payment/success?bookingId=${booking.id}`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/trips/payment/failed`,
          metadata: {
            bookingId: booking.id.toString(),
            originalCurrency: tripCurrency,
            convertedFromPrice: pricePerSeat.toString(),
          },
        })

        console.log(`Stripe session created: ${session.id}`)

        // Update booking with Stripe payment ID
        await db
          .update(tripBookings)
          .set({
            paymentId: session.id,
            paymentStatus: "pending",
            paymentMethod: "STRIPE_USD",
          })
          .where(eq(tripBookings.id, booking.id))

        return {
          booking,
          sessionId: session.id,
          url: session.url,
        }
      } catch (stripeError) {
        console.error("Stripe payment error:", stripeError)
        // Don't delete the booking here - instead, we'll handle failures via webhook
        throw new Error(
          `Stripe payment failed: ${
            stripeError instanceof Error ? stripeError.message : "Unknown error"
          }`
        )
      }
    } else {
      // For Flouci, ensure the amount is in TND
      const totalPriceInTND = await convertCurrency(totalPriceInOriginalCurrency, tripCurrency, "TND")
      const pricePerSeatInTND = await convertCurrency(pricePerSeat, tripCurrency, "TND")
      
      console.log(`Converting from ${tripCurrency} to TND: ${pricePerSeat} -> ${pricePerSeatInTND}`)
      
      // Create the initial booking with the CONVERTED TND price
      const booking = await createBooking({
        tripId,
        userId,
        seatsBooked,
        pricePerSeat,
        convertedPricePerSeat: pricePerSeatInTND,
        paymentCurrency: "TND",
        paymentMethod: "FLOUCI_TND",
      })

      if (!booking) {
        throw new Error("Failed to create booking")
      }

      console.log(`Booking created: #${booking.id}, processing payment via Flouci in TND`)
      
      // Format the amount to ensure it's accepted by the payment API
      const formattedAmount = parseFloat(totalPriceInTND.toFixed(2))

      const paymentData = await generateTripPaymentLink({
        amount: formattedAmount,
        bookingId: booking.id,
      })

      if (!paymentData || !paymentData.paymentId) {
        throw new Error("Failed to generate payment link")
      }

      await db
        .update(tripBookings)
        .set({
          paymentId: paymentData.paymentId,
          paymentStatus: "pending",
          paymentMethod: "FLOUCI_TND",
        })
        .where(eq(tripBookings.id, booking.id))

      return {
        booking,
        paymentLink: paymentData.paymentLink,
        paymentId: paymentData.paymentId,
      }
    }
  } catch (error) {
    console.error("Error creating booking with payment:", error)
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to process booking payment"
    )
  }
}

export async function updateTripBookingPaymentStatus(
  bookingId: number,
  status: string,
  method: string
) {
  try {
    await db
      .update(tripBookings)
      .set({
        paymentStatus: status,
        paymentMethod: method,
        paymentDate: new Date(),
        status: status === "completed" ? "confirmed" : "failed",
      })
      .where(eq(tripBookings.id, bookingId))
  } catch (error) {
    console.error("Error updating payment status:", error)
    throw error
  }
}
