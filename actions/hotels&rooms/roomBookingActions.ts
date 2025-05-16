"use server"

import db from "../../db/drizzle"
import { room, roomBookings } from "@/db/schema"
import { eq, and, or, between, lte, gte } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { generatePaymentLink } from "@/services/roomFlouciPayment"
import { stripe } from "@/lib/stripe"
import { sql } from "drizzle-orm"
import { convertCurrency } from "@/lib/currencyUtils"
import { RoomBookingWithPayment } from "@/app/[locale]/hotels/[hotelId]/rooms/[roomId]/book/BookRoomForm"

interface CreateRoomBookingParams {
  roomId: string
  userId: string
  checkIn: Date
  checkOut: Date
  totalPrice?: number
  status?: string
  adultCount?: number
  childCount?: number
  infantCount?: number
  paymentMethod?: "flouci" | "stripe"
  paymentType?: "full" | "advance"
  advancePaymentPercentage?: number
}

interface CreateRoomBookingWithPaymentParams extends CreateRoomBookingParams {
  initiatePayment?: boolean
}

export async function createRoomBooking({
  roomId,
  userId,
  checkIn,
  checkOut,
  totalPrice,
  initiatePayment = true,
  adultCount = 1,
  childCount = 0,
  paymentMethod = "flouci", // default to flouci
  locale = "en", // Add locale parameter with default
  paymentType = "full", // Add payment type parameter with default
  advancePaymentPercentage = 0, // Add advance payment percentage parameter with default
}: CreateRoomBookingWithPaymentParams & {
  locale?: string
}): Promise<RoomBookingWithPayment> {
  try {
    // Check for overlapping bookings
    const existingBookings = await db.query.roomBookings.findMany({
      where: and(
        eq(roomBookings.roomId, roomId),
        or(
          between(
            roomBookings.checkIn,
            checkIn.toISOString(),
            checkOut.toISOString()
          ),
          between(
            roomBookings.checkOut,
            checkIn.toISOString(),
            checkOut.toISOString()
          )
        )
      ),
    })

    if (existingBookings.length > 0) {
      throw new Error("Room is not available for these dates")
    }

    // Get room details including currency
    const roomData = await db.query.room.findFirst({
      where: eq(room.id, roomId),
    })

    if (!roomData) {
      throw new Error("Room not found")
    }

    // Get the room's currency (default to TND if not specified)
    const roomCurrency = roomData.currency || "TND"

    // Calculate total price if not provided
    let finalTotalPrice = totalPrice
    if (!finalTotalPrice) {
      const nights = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
      )
      finalTotalPrice =
        (parseFloat(roomData.pricePerNightAdult) +
          parseFloat(roomData.pricePerNightChild)) *
        nights
    }

    console.log(
      `Creating booking with original total price: ${finalTotalPrice} ${roomCurrency}`
    )

    // Calculate the payment amount based on the payment type
    let paymentAmount = finalTotalPrice
    let fullPrice = finalTotalPrice
    
    // If it's an advance payment, calculate the amount to pay now
    if (paymentType === "advance" && advancePaymentPercentage > 0) {
      paymentAmount = (finalTotalPrice * advancePaymentPercentage) / 100
      console.log(
        `Advance payment (${advancePaymentPercentage}%): ${paymentAmount} ${roomCurrency}`
      )
    }

    // Handle different payment methods
    if (paymentMethod === "stripe") {
      // Convert price to USD for Stripe
      const paymentAmountInUSD = await convertCurrency(
        paymentAmount,
        roomCurrency,
        "USD"
      )
      console.log(
        `Converting room price from ${roomCurrency} to USD: ${paymentAmount} -> ${paymentAmountInUSD}`
      )

      // Insert booking record with USD price
      const [booking] = await db
        .insert(roomBookings)
        .values({
          roomId,
          userId,
          checkIn: checkIn.toISOString(),
          checkOut: checkOut.toISOString(),
          totalPrice: sql`${paymentAmountInUSD}::decimal`,
          status: "confirmed", // initial status until payment is confirmed
          paymentStatus: "completed",
          paymentMethod: "STRIPE_USD",
          paymentCurrency: "USD",
          originalPrice: `${finalTotalPrice}`,
          originalCurrency: roomCurrency,
          adultCount,
          childCount,
          paymentType,
          advancePaymentPercentage: paymentType === "advance" ? advancePaymentPercentage : null,
          fullPrice: paymentType === "advance" ? `${fullPrice}` : null,
        })
        .returning()

      console.log("Room booking created:", booking)

      if (initiatePayment) {
        // Retrieve room and hotel details for the payment description
        const roomDetails = await db.query.room.findFirst({
          where: eq(room.id, roomId),
          with: { hotel: true },
        })

        if (!roomDetails) {
          throw new Error("Room not found with hotel details")
        }

        // Define the base URL for success and cancel URLs
        const appUrl =
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        if (!appUrl.startsWith("http://") && !appUrl.startsWith("https://")) {
          throw new Error(
            "NEXT_PUBLIC_APP_URL must be a valid absolute URL including protocol"
          )
        }

        try {
          // Create a Stripe checkout session for the room booking
          const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
              {
                price_data: {
                  currency: "usd",
                  product_data: {
                    name: `${roomDetails.name} - ${roomDetails.hotel.name}`,
                    description: `${adultCount} Adult(s), ${childCount} Child(ren) - ${formatDateRange(
                      checkIn,
                      checkOut
                    )} ${paymentType === "advance" ? `(${advancePaymentPercentage}% Advance Payment)` : ""}`,
                  },
                  unit_amount: Math.round(paymentAmountInUSD * 100), // Stripe expects cents
                },
                quantity: 1,
              },
            ],
            mode: "payment",
            success_url: `${appUrl}/${locale}/hotels/payment/success?bookingId=${booking.id}`,
            cancel_url: `${appUrl}/${locale}/hotels/payment/failed?bookingId=${booking.id}`,
            metadata: {
              bookingId: booking.id.toString(),
              bookingType: "hotel",
              originalCurrency: roomCurrency,
              originalPrice: finalTotalPrice.toString(),
              paymentType,
              advancePaymentPercentage: paymentType === "advance" ? advancePaymentPercentage.toString() : null,
            },
          })

          console.log(`Stripe session created: ${session.id}`)

          // Update booking with Stripe payment details
          await db
            .update(roomBookings)
            .set({
              paymentId: session.id,
              paymentStatus: "completed",
              paymentMethod: "STRIPE_USD",
            })
            .where(eq(roomBookings.id, booking.id))

          return {
            ...booking,
            sessionId: session.id,
            url: session.url ?? undefined,
          }
        } catch (stripeError) {
          console.error("Stripe payment error:", stripeError)
          await db.delete(roomBookings).where(eq(roomBookings.id, booking.id))
          throw new Error(
            `Stripe payment failed: ${
              stripeError instanceof Error
                ? stripeError.message
                : "Unknown error"
            }`
          )
        }
      }
      
      return booking
    } else {
      // Flouci payment flow - convert price to TND
      const paymentAmountInTND = await convertCurrency(
        paymentAmount,
        roomCurrency,
        "TND"
      )
      console.log(
        `Converting room price from ${roomCurrency} to TND: ${paymentAmount} -> ${paymentAmountInTND}`
      )

      // Insert booking record with TND price
      const [booking] = await db
        .insert(roomBookings)
        .values({
          roomId,
          userId,
          checkIn: checkIn.toISOString(),
          checkOut: checkOut.toISOString(),
          totalPrice: sql`${paymentAmountInTND}::decimal`,
          status: "confirmed", // initial status until payment is confirmed
          paymentStatus: "completed",
          paymentMethod: "FLOUCI_TND",
          paymentCurrency: "TND",
          originalPrice: `${finalTotalPrice}`,
          originalCurrency: roomCurrency,
          adultCount,
          childCount,
          paymentType,
          advancePaymentPercentage: paymentType === "advance" ? advancePaymentPercentage : null,
          fullPrice: paymentType === "advance" ? `${fullPrice}` : null,
        })
        .returning()

      console.log("Room booking created:", booking)

      if (initiatePayment) {
        const paymentData = await generatePaymentLink({
          amount: paymentAmountInTND,
          bookingId: booking.id,
          developerTrackingId: `room_booking_${booking.id}`,
          locale: locale, // Pass locale to payment link generator
        })

        if (!paymentData || !paymentData.paymentId) {
          await db.delete(roomBookings).where(eq(roomBookings.id, booking.id))
          throw new Error("Failed to generate payment link")
        }

        console.log("Payment link generated:", paymentData.paymentLink)

        // Update booking with Flouci payment details
        await db
          .update(roomBookings)
          .set({
            paymentId: paymentData.paymentId,
            paymentStatus: "completed",
            paymentMethod: "FLOUCI_TND",
          })
          .where(eq(roomBookings.id, booking.id))

        return {
          ...booking,
          paymentLink: paymentData.paymentLink,
          paymentId: paymentData.paymentId,
        }
      }
      
      // Return booking if payment is not initiated
      return booking
    }
  } catch (error) {
    console.error("Error creating room booking:", error)
    throw error
  }
}

// Helper function to format date ranges for the payment description
function formatDateRange(checkIn: Date, checkOut: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  }
  const checkInStr = checkIn.toLocaleDateString("en-US", options)
  const checkOutStr = checkOut.toLocaleDateString("en-US", options)
  return `${checkInStr} to ${checkOutStr}`
}

// (Rest of your functions remain unchanged)

export async function updateBookingPaymentStatus(
  bookingId: number,
  paymentStatus: string,
  paymentMethod?: string
) {
  try {
    const [updatedBooking] = await db
      .update(roomBookings)
      .set({
        paymentStatus,
        paymentMethod,
        paymentDate: new Date(),
        status: paymentStatus === "completed" ? "confirmed" : "pending",
      })
      .where(eq(roomBookings.id, bookingId))
      .returning()

    return updatedBooking
  } catch (error) {
    console.error("Error updating booking payment status:", error)
    throw error
  }
}

export async function revalidateBookingPages(roomId: string) {
  "use server"
  revalidatePath(`/hotels/${roomId}`)
  revalidatePath("/dashboard/bookings")
}

export async function getRoomBookingsByUserId(userId: string) {
  try {
    const bookings = await db.query.roomBookings.findMany({
      where: eq(roomBookings.userId, userId),
      with: {
        room: {
          with: {
            hotel: true,
          },
        },
      },
    })
    return bookings
  } catch (error) {
    console.error("Error getting room bookings:", error)
    throw error
  }
}

export async function checkRoomAvailability(
  roomId: string,
  checkIn: Date,
  checkOut: Date
) {
  try {
    const checkInStr = checkIn.toISOString()
    const checkOutStr = checkOut.toISOString()

    const existingBookings = await db.query.roomBookings.findMany({
      where: and(
        eq(roomBookings.roomId, roomId),
        or(
          and(
            lte(roomBookings.checkIn, checkOutStr),
            gte(roomBookings.checkOut, checkInStr)
          ),
          and(
            lte(roomBookings.checkIn, checkOutStr),
            gte(roomBookings.checkIn, checkInStr)
          ),
          and(
            lte(roomBookings.checkOut, checkOutStr),
            gte(roomBookings.checkOut, checkInStr)
          )
        )
      ),
    })

    return existingBookings.length === 0
  } catch (error) {
    console.error("Error checking room availability:", error)
    throw error
  }
}

export async function getBookedDatesForRoom(roomId: string) {
  try {
    const bookings = await db.query.roomBookings.findMany({
      where: and(
        eq(roomBookings.roomId, roomId),
        eq(roomBookings.status, "confirmed") // Only confirmed bookings
      ),
      columns: {
        checkIn: true,
        checkOut: true,
      },
    })

    return bookings.map((booking) => ({
      start: new Date(booking.checkIn),
      end: new Date(booking.checkOut),
    }))
  } catch (error) {
    console.error("Error getting booked dates:", error)
    throw error
  }
}
