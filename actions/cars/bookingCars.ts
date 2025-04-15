/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { carBookings, cars } from "@/db/schema"
import { eq, and, or, between } from "drizzle-orm"
import db from "@/db/drizzle"
import { generateCarPaymentLink } from "@/services/carPayment"
import { stripe } from "@/lib/stripe"
import { convertCurrency } from "@/lib/currencyUtils"

interface CustomerInfo {
  fullName: string
  email: string
  phone: string
  address: string
  drivingLicense: string
}

interface BookCarParams {
  carId: number
  userId: string
  startDate: Date
  endDate: Date
  totalPrice: number
  customerInfo?: CustomerInfo
  paymentMethod?: "flouci" | "stripe"
}

interface BookingResult {
  success: boolean
  booking?: any
  error?: string
}

export async function bookCar({
  carId,
  userId,
  startDate,
  endDate,
  totalPrice,
  customerInfo,
  paymentMethod = "flouci", // Default to flouci if not specified
}: BookCarParams): Promise<BookingResult> {
  try {
    if (!userId) {
      return { success: false, error: "User ID is required" }
    }

    // Check car availability
    const isAvailable = await checkCarAvailability(carId, startDate, endDate)
    if (!isAvailable) {
      return { success: false, error: "Car not available for selected dates" }
    }

    // Get car to determine its currency
    const car = await db.query.cars.findFirst({
      where: eq(cars.id, carId)
    });

    if (!car) {
      return { success: false, error: "Car not found" }
    }

    // Get the original currency of the car
    const carCurrency = car.currency || "TND";
    
    console.log(`Car currency: ${carCurrency}, Original total price: ${totalPrice}`);

    // Handle payment based on selected method
    if (paymentMethod === "stripe") {
      // Convert price to USD for Stripe
      const totalPriceInUSD = await convertCurrency(totalPrice, carCurrency, "USD");
      console.log(`Converting car price from ${carCurrency} to USD: ${totalPrice} -> ${totalPriceInUSD}`);

      // Create booking with the USD price
      const bookingResults = await db
        .insert(carBookings)
        .values({
          car_id: carId,
          user_id: userId,
          start_date: startDate,
          end_date: endDate,
          total_price: totalPriceInUSD.toString(),
          paymentDate: new Date(),
          status: "pending",
          paymentStatus: "pending",
          fullName: customerInfo?.fullName || null,
          email: customerInfo?.email || null,
          phone: customerInfo?.phone || null,
          address: customerInfo?.address || null,
          drivingLicense: customerInfo?.drivingLicense || null,
          paymentMethod: "STRIPE_USD",
          paymentCurrency: "USD",
          originalCurrency: carCurrency,
          originalPrice: totalPrice.toString(),
          createdAt: new Date(),
        })
        .returning()

      const newBooking = bookingResults[0]
      console.log(`Car booking created: #${newBooking.id}, processing payment via Stripe in USD`);

      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "usd", // Always USD for Stripe
                product_data: {
                  name: `Car Rental #${carId}`,
                  description: `Rental from ${startDate.toDateString()} to ${endDate.toDateString()}`,
                },
                unit_amount: Math.round(totalPriceInUSD * 100), // Stripe uses cents
              },
              quantity: 1,
            },
          ],
          mode: "payment",
          success_url: `${process.env.NEXT_PUBLIC_APP_URL}/cars/payment/success?bookingId=${newBooking.id}`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cars/payment/failed`,
          metadata: {
            bookingId: newBooking.id.toString(),
            bookingType: "car",
            originalCurrency: carCurrency,
            convertedFromPrice: totalPrice.toString(),
          },
        })

        // Update booking with payment ID
        await db
          .update(carBookings)
          .set({ paymentId: session.id })
          .where(eq(carBookings.id, newBooking.id))

        return {
          success: true,
          booking: { ...newBooking, sessionId: session.id, url: session.url },
        }
      } catch (stripeError) {
        console.error("Stripe payment error:", stripeError)
        // Don't delete the booking - we'll track the failed status
        return { success: false, error: "Stripe payment failed" }
      }
    } else {
      // Convert to TND for Flouci
      const totalPriceInTND = await convertCurrency(totalPrice, carCurrency, "TND");
      console.log(`Converting car price from ${carCurrency} to TND: ${totalPrice} -> ${totalPriceInTND}`);

      // Create booking with the TND price
      const bookingResults = await db
        .insert(carBookings)
        .values({
          car_id: carId,
          user_id: userId,
          start_date: startDate,
          end_date: endDate,
          total_price: totalPriceInTND.toString(),
          paymentDate: new Date(),
          status: "pending",
          paymentStatus: "pending",
          fullName: customerInfo?.fullName || null,
          email: customerInfo?.email || null,
          phone: customerInfo?.phone || null,
          address: customerInfo?.address || null,
          drivingLicense: customerInfo?.drivingLicense || null,
          paymentMethod: "FLOUCI_TND",
          paymentCurrency: "TND",
          originalCurrency: carCurrency,
          originalPrice: totalPrice.toString(),
          createdAt: new Date(),
        })
        .returning()

      const newBooking = bookingResults[0]
      console.log(`Car booking created: #${newBooking.id}, processing payment via Flouci in TND`);

      const { paymentLink, paymentId } = await generateCarPaymentLink({
        amount: totalPriceInTND,
        bookingId: newBooking.id,
      })

      await db
        .update(carBookings)
        .set({ paymentId })
        .where(eq(carBookings.id, newBooking.id))

      return {
        success: true,
        booking: { ...newBooking, paymentLink },
      }
    }
  } catch (error) {
    console.error("Failed to book car:", error)
    return { success: false, error: "Booking failed - please try again" }
  }
}

async function checkCarAvailability(
  carId: number,
  startDate: Date,
  endDate: Date
) {
  try {
    const existing = await db.query.carBookings.findMany({
      where: and(
        eq(carBookings.car_id, carId),
        or(
          between(carBookings.start_date, startDate, endDate),
          between(carBookings.end_date, startDate, endDate)
        )
      ),
    })
    return existing.length === 0
  } catch (error) {
    console.error("Availability check failed:", error)
    return false
  }
}
