"use server"

import { revalidatePath } from "next/cache"
import { carBookings } from "@/db/schema"
import { eq, and, or, between } from "drizzle-orm"
import db from "@/db/drizzle"
import { generateCarPaymentLink } from "@/services/carPayment"

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
  paymentMethod?: "flouci"
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
}: BookCarParams): Promise<BookingResult> {
  try {
    if (!userId) {
      return { success: false, error: "User ID is required" }
    }

    // Add availability check like in hotel system
    const isAvailable = await checkCarAvailability(carId, startDate, endDate)
    if (!isAvailable) {
      return { success: false, error: "Car not available for selected dates" }
    }

    // Create booking
    const bookingResults = await db
      .insert(carBookings)
      .values({
        car_id: carId,
        user_id: userId,
        start_date: startDate,
        end_date: endDate,
        total_price: totalPrice.toString(),
        paymentDate: new Date(),
        status: "confirmed",
        paymentStatus: "confirmed",
        fullName: customerInfo?.fullName || null,
        email: customerInfo?.email || null,
        phone: customerInfo?.phone || null,
        address: customerInfo?.address || null,
        drivingLicense: customerInfo?.drivingLicense || null,
        paymentMethod: "flouci",
        createdAt: new Date(),
      })
      .returning()

    const newBooking = bookingResults[0]

    // Generate payment link
    const { paymentLink, paymentId } = await generateCarPaymentLink({
      amount: totalPrice,
      bookingId: newBooking.id,
    })

    // Update booking with payment ID
    await db
      .update(carBookings)
      .set({ paymentId })
      .where(eq(carBookings.id, newBooking.id))

    // Revalidate relevant paths
    revalidatePath(`/cars/${carId}`)
    revalidatePath("/dashboard/bookings")

    return {
      success: true,
      booking: { ...newBooking, paymentLink },
    }
  } catch (error) {
    console.error("Failed to book car:", error)
    return { success: false, error: "Payment failed - please try again" }
  }
}

// Add availability check function
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
