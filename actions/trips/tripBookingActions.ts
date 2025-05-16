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
  pricePerSeat?: number
  totalPrice?: number
  status?: string
  paymentMethod?: "flouci" | "stripe" | "STRIPE_USD" | "FLOUCI_TND"
  convertedPricePerSeat?: number
  paymentCurrency?: string
  paymentType?: "full" | "advance"
  advancePaymentPercentage?: number
}

export async function createBooking({
  tripId,
  userId,
  seatsBooked,
  totalPrice,
  status,
  paymentMethod,
  convertedPricePerSeat,
  paymentCurrency,
  pricePerSeat,
  paymentType = "full",
  advancePaymentPercentage = 0,
}: CreateBookingParams & {
  pricePerSeat: number
  convertedPricePerSeat?: number
  paymentCurrency?: string
  paymentMethod?: string
  paymentType?: "full" | "advance"
  advancePaymentPercentage?: number
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
    const fullTotalPrice = seatsBooked * effectivePricePerSeat

    // Calculate the actual amount to store based on payment type
    const isAdvancePayment = paymentType === "advance" && advancePaymentPercentage > 0
    const amountToStore = isAdvancePayment 
      ? fullTotalPrice * (advancePaymentPercentage / 100)
      : fullTotalPrice

    console.log(
      `Creating booking with price per seat: ${effectivePricePerSeat} ${
        paymentCurrency || trip.currency
      }`
    )
    console.log(
      `Total price: ${amountToStore} ${paymentCurrency || trip.currency}`
    )

    const [booking] = await db
      .insert(tripBookings)
      .values({
        tripId: tripId,
        userId: userId,
        seatsBooked: seatsBooked,
        totalPrice: sql`${amountToStore}::decimal`,
        status: isAdvancePayment ? "partially_paid" : "confirmed",
        bookingDate: new Date(),
        paymentCurrency: paymentCurrency || trip.currency,
        originalCurrency: trip.currency,
        originalPricePerSeat: sql`${pricePerSeat}::decimal`,
        paymentType: paymentType,
        advancePaymentPercentage: isAdvancePayment ? advancePaymentPercentage : undefined,
        fullPrice: sql`${fullTotalPrice}::decimal`,
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
  locale = "en", // Add locale parameter with default
  paymentType = "full", // Default to full payment
  advancePaymentPercentage = 0, // Default to 0 if not specified
}: {
  tripId: number;
  userId: string;
  seatsBooked: number;
  pricePerSeat: number;
  paymentMethod?: "flouci" | "stripe";
  locale?: string;
  paymentType?: "full" | "advance";
  advancePaymentPercentage?: number;
}) {
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

    console.log(
      `Trip currency: ${tripCurrency}, Price per seat: ${pricePerSeat}`
    )

    // Calculate total price in the trip's original currency
    const totalPriceInOriginalCurrency = seatsBooked * pricePerSeat
    
    // Calculate the payment amount based on payment type
    const isAdvancePayment = paymentType === "advance" && advancePaymentPercentage > 0
    
    // Amount to charge is the full price or just the advance amount
    const amountToCharge = isAdvancePayment 
      ? totalPriceInOriginalCurrency * (advancePaymentPercentage / 100)
      : totalPriceInOriginalCurrency
      
    console.log(`Payment type: ${paymentType}${isAdvancePayment ? `, Advance payment: ${advancePaymentPercentage}%` : ''}`)
    console.log(`Original full amount: ${totalPriceInOriginalCurrency} ${tripCurrency}, Amount to charge: ${amountToCharge} ${tripCurrency}`)

    // Handle payment based on selected method
    if (paymentMethod === "stripe") {
      try {
        // Convert price to USD for Stripe regardless of trip's currency
        const pricePerSeatInUSD = await convertCurrency(
          pricePerSeat,
          tripCurrency,
          "USD"
        )
        
        // Calculate the amount to charge in USD
        const amountToChargeInUSD = isAdvancePayment
          ? pricePerSeatInUSD * seatsBooked * (advancePaymentPercentage / 100)
          : pricePerSeatInUSD * seatsBooked
          
        console.log(
          `Converting from ${tripCurrency} to USD: ${pricePerSeat} -> ${pricePerSeatInUSD}`
        )
        console.log(
          `Amount to charge in USD: ${amountToChargeInUSD}`
        )

        // Create the initial booking with the CONVERTED USD price
        // Keep track of the full price and advance payment info
        const booking = await createBooking({
          tripId,
          userId,
          seatsBooked,
          pricePerSeat: pricePerSeat,
          convertedPricePerSeat: pricePerSeatInUSD,
          paymentCurrency: "USD",
          paymentMethod: "STRIPE_USD",
          paymentType: paymentType,
          advancePaymentPercentage: isAdvancePayment ? advancePaymentPercentage : undefined,
        })

        if (!booking) {
          throw new Error("Failed to create booking")
        }

        console.log(
          `Booking created: #${booking.id}, processing payment via Stripe in USD`
        )

        // Product name should indicate if it's an advance payment
        const productName = isAdvancePayment
          ? `${trip.name} - ${advancePaymentPercentage}% Advance Payment`
          : trip.name

        // Create Stripe checkout session with USD
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "usd", // Stripe payment always in USD
                product_data: {
                  name: productName,
                  description: `Trip to ${trip.destination}${isAdvancePayment ? ` - ${advancePaymentPercentage}% advance payment` : ''}`,
                },
                unit_amount: Math.round(amountToChargeInUSD * 100), // Stripe uses cents
              },
              quantity: 1, // Since we're using the total amount, quantity is 1
            },
          ],
          mode: "payment",
          success_url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/trips/payment/success?bookingId=${booking.id}`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/trips/payment/failed`,
          metadata: {
            bookingId: booking.id.toString(),
            originalCurrency: tripCurrency,
            convertedFromPrice: pricePerSeat.toString(),
            locale: locale, // Store locale in metadata
            paymentType: paymentType, // Store payment type
            advancePaymentPercentage: isAdvancePayment ? advancePaymentPercentage.toString() : null, // Store advance percentage
          },
        })

        console.log(`Stripe session created: ${session.id}`)

        // Update booking with additional metadata
        // Use a type that matches the database schema
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
      const pricePerSeatInTND = await convertCurrency(
        pricePerSeat,
        tripCurrency,
        "TND"
      )
      
      // Calculate the amount to charge in TND
      const amountToChargeInTND = isAdvancePayment
        ? pricePerSeatInTND * seatsBooked * (advancePaymentPercentage / 100)
        : pricePerSeatInTND * seatsBooked

      console.log(
        `Converting from ${tripCurrency} to TND: ${pricePerSeat} -> ${pricePerSeatInTND}`
      )
      console.log(
        `Amount to charge in TND: ${amountToChargeInTND}`
      )

      // Create the initial booking with the CONVERTED TND price
      const booking = await createBooking({
        tripId,
        userId,
        seatsBooked,
        pricePerSeat: pricePerSeat,
        convertedPricePerSeat: pricePerSeatInTND,
        paymentCurrency: "TND",
        paymentMethod: "FLOUCI_TND",
        paymentType: paymentType,
        advancePaymentPercentage: isAdvancePayment ? advancePaymentPercentage : undefined,
      })

      if (!booking) {
        throw new Error("Failed to create booking")
      }

      console.log(
        `Booking created: #${booking.id}, processing payment via Flouci in TND`
      )

      // Format the amount to ensure it's accepted by the payment API
      const formattedAmount = parseFloat(amountToChargeInTND.toFixed(2))

      // For Flouci payment
      const paymentData = await generateTripPaymentLink({
        amount: formattedAmount,
        bookingId: booking.id,
        locale: locale,
      })
      
      // Update the booking description when it's an advance payment
      if (isAdvancePayment) {
        // Store the payment type and percentage information in the booking
        await db
          .update(tripBookings)
          .set({
            paymentStatus: "pending", // Set as pending until callback
            status: "partially_paid", // Set the status to partially_paid
          })
          .where(eq(tripBookings.id, booking.id))
      }

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
