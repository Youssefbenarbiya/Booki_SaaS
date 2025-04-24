/* eslint-disable @typescript-eslint/no-unused-vars */
"use server"

import db from "@/db/drizzle"
import { notifications, trips, cars, hotel, blogs } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function sendTripStatusNotification(
  tripId: number,
  status: "approved" | "rejected"
) {
  try {
    // Get trip details
    const tripRecord = await db.query.trips.findFirst({
      where: eq(trips.id, tripId),
    })

    if (!tripRecord) {
      return { success: false, message: "Trip not found" }
    }

    // Get the agency user ID directly from the trip
    const agencyId = tripRecord.agencyId

    if (!agencyId) {
      return {
        success: false,
        message: "No agency associated with trip. Unable to send notification.",
      }
    }

    const title = status === "approved" ? "Trip Approved" : "Trip Rejected"

    const message =
      status === "approved"
        ? `Your trip "${tripRecord.name}" has been approved and is now available for booking.`
        : `Your trip "${tripRecord.name}" has been rejected. Please review and update your trip or contact support for more information.`

    // Create notification with explicit values for all required fields
    try {
      await db.insert(notifications).values({
        userId: agencyId,
        title,
        message,
        type: status === "approved" ? "success" : "warning",
        relatedItemType: "trip",
        relatedItemId: tripId,
        createdAt: new Date(),
        read: false,
      })

      return { success: true }
    } catch (insertError) {
      throw insertError // Re-throw to be caught by outer catch block
    }
  } catch (error) {
    return { success: false, message: "Failed to send notification" }
  }
}

export async function sendCarStatusNotification(
  carId: number,
  status: "approved" | "rejected"
) {
  try {
    // Get car details
    const carRecord = await db.query.cars.findFirst({
      where: eq(cars.id, carId),
    })

    if (!carRecord) {
      return { success: false, message: "Car not found" }
    }

    // Get the agency user ID directly from the car
    const agencyId = carRecord.agencyId

    if (!agencyId) {
      return {
        success: false,
        message: "No agency associated with car. Unable to send notification.",
      }
    }

    const title = status === "approved" ? "Car Approved" : "Car Rejected"

    const message =
      status === "approved"
        ? `Your car "${carRecord.brand} ${carRecord.model}" has been approved and is now available for booking.`
        : `Your car "${carRecord.brand} ${carRecord.model}" has been rejected. Please review and update your listing or contact support for more information.`

    // Create notification with explicit values for all required fields
    try {
      await db.insert(notifications).values({
        userId: agencyId,
        title,
        message,
        type: status === "approved" ? "success" : "warning",
        relatedItemType: "car",
        relatedItemId: carId,
        createdAt: new Date(),
        read: false,
      })

      return { success: true }
    } catch (insertError) {
      throw insertError // Re-throw to be caught by outer catch block
    }
  } catch (error) {
    return { success: false, message: "Failed to send car notification" }
  }
}

export async function sendHotelStatusNotification(
  hotelId: number | string, // Accept either number or string
  status: "approved" | "rejected"
) {
  try {
    // Get hotel details - handle the ID properly based on its type in the schema
    const hotelRecord = await db.query.hotel.findFirst({
      where: eq(hotel.id, String(hotelId)), // Converting to string is correct since hotel.id is varchar
    })

    if (!hotelRecord) {
      return { success: false, message: "Hotel not found" }
    }

    // Get the agency user ID directly from the hotel
    const agencyId = hotelRecord.agencyId

    if (!agencyId) {
      return {
        success: false,
        message:
          "No agency associated with hotel. Unable to send notification.",
      }
    }

    const title = status === "approved" ? "Hotel Approved" : "Hotel Rejected"

    const message =
      status === "approved"
        ? `Your hotel "${hotelRecord.name}" has been approved and is now available for booking.`
        : `Your hotel "${hotelRecord.name}" has been rejected. Please review and update your listing or contact support for more information.`

    // Create notification with explicit values for all required fields
    try {
      await db.insert(notifications).values({
        userId: agencyId,
        title,
        message,
        type: status === "approved" ? "success" : "warning",
        relatedItemType: "hotel",
        // Convert hotelId to number for the notification - relatedItemId is integer in schema
        relatedItemId:
          typeof hotelId === "string" ? parseInt(hotelId, 10) : hotelId,
        createdAt: new Date(),
        read: false,
      })

      return { success: true }
    } catch (insertError) {
      throw insertError // Re-throw to be caught by outer catch block
    }
  } catch (error) {
    return { success: false, message: "Failed to send hotel notification" }
  }
}

export async function sendBlogStatusNotification(
  blogId: number,
  status: "approved" | "rejected"
) {
  try {
    // Get blog details
    const blogRecord = await db.query.blogs.findFirst({
      where: eq(blogs.id, blogId),
    })

    if (!blogRecord) {
      return { success: false, message: "Blog not found" }
    }

    // Get the agency user ID directly from the blog
    const agencyId = blogRecord.agencyId

    if (!agencyId) {
      return {
        success: false,
        message: "No agency associated with blog. Unable to send notification.",
      }
    }

    const title = status === "approved" ? "Blog Approved" : "Blog Rejected"

    const message =
      status === "approved"
        ? `Your blog post "${blogRecord.title}" has been approved and is now ${
            blogRecord.published ? "published" : "ready to be published"
          }.`
        : `Your blog post "${blogRecord.title}" has been rejected. Please review and update your content or contact support for more information.`

    // Create notification with explicit values for all required fields
    try {
      await db.insert(notifications).values({
        userId: agencyId,
        title,
        message,
        type: status === "approved" ? "success" : "warning",
        relatedItemType: "blog",
        relatedItemId: blogId,
        createdAt: new Date(),
        read: false,
      })

      return { success: true }
    } catch (insertError) {
      throw insertError // Re-throw to be caught by outer catch block
    }
  } catch (error) {
    return { success: false, message: "Failed to send blog notification" }
  }
}
