/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { eq } from "drizzle-orm"
import {
  tripBookings,
  roomBookings,
  carBookings,
  tripActivities,
} from "@/db/schema"
import db from "@/db/drizzle"

// Define the activity type to fix implicit any error
type TripActivity = typeof tripActivities.$inferSelect

export type BookingDetailType = {
  id: number
  type: "trip" | "stay" | "car"
  image: string
  name: string
  startDate: string
  endDate: string
  status: string
  totalPrice: string
  description?: string
  location?: string
  additionalInfo?: Record<string, any>
  advancePaymentPercentage?: number
  discountPercentage?: number
}

export async function getBookingDetail(
  type: string,
  bookingId: number,
  userId: string
): Promise<BookingDetailType | null> {
  try {
    switch (type) {
      case "trip": {
        const booking = await db.query.tripBookings.findFirst({
          where: eq(tripBookings.id, bookingId),
          with: {
            trip: {
              columns: {
                name: true,
                description: true,
                destination: true,
                startDate: true,
                endDate: true,
                originalPrice: true,
                priceAfterDiscount: true,
                capacity: true,
                isAvailable: true,
                discountPercentage: true,
                advancePaymentEnabled: true,
                advancePaymentPercentage: true,
              },
              with: {
                images: true,
                activities: true,
              },
            },
          },
        })

        if (!booking || booking.userId !== userId) return null

        // Get trip activities with proper type annotation
        const activities = booking.trip.activities.map(
          (activity: TripActivity) => ({
            name: activity.activityName,
            description: activity.description,
            date: activity.scheduledDate,
          })
        )

        // Use priceAfterDiscount if available, otherwise use originalPrice
        const price =
          booking.trip.priceAfterDiscount || booking.trip.originalPrice

        return {
          id: booking.id,
          type: "trip",
          image: booking.trip.images[0]?.imageUrl || "/default-trip.jpg",
          name: booking.trip.name,
          startDate: booking.trip.startDate,
          endDate: booking.trip.endDate,
          status: booking.status,
          totalPrice: booking.totalPrice,
          description: booking.trip.description ?? undefined,
          location: booking.trip.destination,
          additionalInfo: {
            bookingDate: booking.bookingDate,
            participants: booking.seatsBooked,
            capacity: booking.trip.capacity,
            price: price,
            paymentStatus: booking.paymentStatus,
            paymentMethod: booking.paymentMethod,
            activities: activities.length > 0 ? activities : undefined,
            advancePaymentPercentage: booking.trip.advancePaymentPercentage,
            discountPercentage: booking.trip.discountPercentage,
          },
          advancePaymentPercentage: booking.trip.advancePaymentPercentage,
          discountPercentage: booking.trip.discountPercentage,
        }
      }

      case "stay": {
        const booking = await db.query.roomBookings.findFirst({
          where: eq(roomBookings.id, bookingId),
          with: {
            room: {
              columns: {
                name: true,
                description: true,
                capacity: true,
                pricePerNightAdult: true,
                pricePerNightChild: true,
                roomType: true,
                amenities: true,
                images: true,
              },
              with: {
                hotel: {
                  columns: {
                    name: true,
                    address: true,
                    city: true,
                    country: true,
                    rating: true,
                    amenities: true,
                    images: true,
                  },
                },
              },
            },
          },
        })

        if (!booking || booking.userId !== userId) return null

        const hotelLocation = `${booking.room.hotel.address}, ${booking.room.hotel.city}, ${booking.room.hotel.country}`

        return {
          id: booking.id,
          type: "stay",
          image:
            booking.room.images[0] ||
            booking.room.hotel.images[0] ||
            "/default-room.jpg",
          name: `${booking.room.hotel.name} - ${booking.room.name}`,
          startDate: booking.checkIn,
          endDate: booking.checkOut,
          status: booking.status,
          totalPrice: booking.totalPrice,
          description: booking.room.description,
          location: hotelLocation,
          additionalInfo: {
            bookingDate: booking.bookingDate,
            roomType: booking.room.roomType,
            roomCapacity: booking.room.capacity,
            hotelRating: booking.room.hotel.rating,
            roomAmenities: booking.room.amenities,
            hotelAmenities: booking.room.hotel.amenities,
            pricePerNightAdult: booking.room.pricePerNightAdult,
            pricePerNightChild: booking.room.pricePerNightChild,
            paymentStatus: booking.paymentStatus,
            paymentMethod: booking.paymentMethod,
          },
          advancePaymentPercentage: undefined,
          discountPercentage: undefined,
        }
      }

      case "car": {
        const booking = await db.query.carBookings.findFirst({
          where: eq(carBookings.id, bookingId),
          with: {
            car: {
              columns: {
                brand: true,
                model: true,
                year: true,
                color: true,
                plateNumber: true,
                originalPrice: true,
                discountPercentage: true,
                images: true,
                advancePaymentEnabled: true,
                advancePaymentPercentage: true,
              },
            },
          },
        })

        if (!booking || booking.user_id !== userId) return null

        // Format location info - use proper property access
        const pickupLocation = booking.address || "Not specified"
        const dropoffLocation = booking.address || "Same as pickup"

        return {
          id: booking.id,
          type: "car",
          image: booking.car.images[0] || "/default-car.jpg",
          name: `${booking.car.brand} ${booking.car.model} (${booking.car.year})`,
          startDate: booking.start_date.toISOString(),
          endDate: booking.end_date.toISOString(),
          status: booking.status,
          totalPrice: booking.total_price.toString(),
          description: `${booking.car.color} ${booking.car.brand} ${booking.car.model}, Year: ${booking.car.year}`,
          location: `Pickup: ${pickupLocation}`,
          additionalInfo: {
            bookingDate: booking.createdAt,
            renter: booking.fullName,
            contactEmail: booking.email,
            contactPhone: booking.phone,
            drivingLicense: booking.drivingLicense,
            plateNumber: booking.car.plateNumber,
            dropoffLocation: dropoffLocation,
            dailyRate: booking.car.originalPrice,
            paymentStatus: booking.paymentStatus,
            paymentMethod: booking.paymentMethod,
            discountPercentage: booking.car.discountPercentage,
            advancePaymentPercentage: booking.car.advancePaymentPercentage,
          },
          advancePaymentPercentage: booking.car.advancePaymentPercentage,
          discountPercentage: booking.car.discountPercentage,
        }
      }

      default:
        return null
    }
  } catch (error) {
    console.error("Error fetching booking detail:", error)
    return null
  }
}
