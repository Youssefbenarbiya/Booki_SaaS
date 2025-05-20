/* eslint-disable @typescript-eslint/no-unused-vars */
"use server"

import db from "@/db/drizzle"
import { notifications, trips, cars, hotel, blogs, adminNotifications } from "@/db/schema"
import { eq, desc, and, count } from "drizzle-orm"

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

// Admin notification functions

/**
 * Create a notification for admin when an agency submits verification documents
 */
export async function createAgencyVerificationNotification(agencyId: string, agencyName: string) {
  try {
    await db.insert(adminNotifications).values({
      title: "New Agency Verification",
      message: `${agencyName} has submitted verification documents for review.`,
      type: "agency_verification",
      entityId: agencyId,
      entityType: "agency",
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return { success: true }
  } catch (error) {
    console.error("Failed to create admin notification:", error)
    return { success: false, message: "Failed to create admin notification" }
  }
}

/**
 * Create a notification for admin when a new trip is created
 */
export async function createNewTripNotification(tripId: number, tripName: string, agencyName: string) {
  try {
    await db.insert(adminNotifications).values({
      title: "New Trip Posted",
      message: `${agencyName} has posted a new trip: ${tripName}.`,
      type: "new_trip",
      entityId: tripId.toString(),
      entityType: "trip",
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return { success: true }
  } catch (error) {
    console.error("Failed to create admin notification:", error)
    return { success: false, message: "Failed to create admin notification" }
  }
}

/**
 * Create a notification for admin when a new car is created
 */
export async function createNewCarNotification(carId: number, carDetails: string, agencyName: string) {
  try {
    await db.insert(adminNotifications).values({
      title: "New Car Posted",
      message: `${agencyName} has posted a new car: ${carDetails}.`,
      type: "new_car",
      entityId: carId.toString(),
      entityType: "car",
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return { success: true }
  } catch (error) {
    console.error("Failed to create admin notification:", error)
    return { success: false, message: "Failed to create admin notification" }
  }
}

/**
 * Create a notification for admin when a new hotel is created
 */
export async function createNewHotelNotification(hotelId: string | number, hotelName: string, agencyName: string) {
  try {
    await db.insert(adminNotifications).values({
      title: "New Hotel Posted",
      message: `${agencyName} has posted a new hotel: ${hotelName}.`,
      type: "new_hotel",
      entityId: hotelId.toString(),
      entityType: "hotel",
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return { success: true }
  } catch (error) {
    console.error("Failed to create admin notification:", error)
    return { success: false, message: "Failed to create admin notification" }
  }
}

/**
 * Create a notification for admin when a new blog is created
 */
export async function createNewBlogNotification(blogId: number, blogTitle: string, agencyName: string) {
  try {
    await db.insert(adminNotifications).values({
      title: "New Blog Posted",
      message: `${agencyName} has posted a new blog: ${blogTitle}.`,
      type: "new_blog",
      entityId: blogId.toString(),
      entityType: "blog",
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return { success: true }
  } catch (error) {
    console.error("Failed to create admin notification:", error)
    return { success: false, message: "Failed to create admin notification" }
  }
}

/**
 * Fetch admin notifications
 */
export async function getAdminNotifications(page = 1, limit = 10) {
  try {
    const offset = (page - 1) * limit
    
    // Get total count
    const [countResult] = await db
      .select({ value: count() })
      .from(adminNotifications)
    
    const total = countResult?.value || 0
    
    // Get paginated notifications
    const notifications = await db.query.adminNotifications.findMany({
      orderBy: [desc(adminNotifications.createdAt)],
      limit,
      offset,
    })
    
    return {
      success: true,
      data: notifications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  } catch (error) {
    console.error("Failed to fetch admin notifications:", error)
    return { success: false, message: "Failed to fetch admin notifications" }
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount() {
  try {
    const [result] = await db
      .select({ count: count() })
      .from(adminNotifications)
      .where(eq(adminNotifications.isRead, false))
    
    return { success: true, count: result?.count || 0 }
  } catch (error) {
    console.error("Failed to get unread notification count:", error)
    return { success: false, message: "Failed to get unread notification count" }
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(id: number | string) {
  try {
    const notificationId = typeof id === 'string' ? parseInt(id, 10) : id;
    
    // Make sure we have a valid ID
    if (isNaN(notificationId)) {
      return { success: false, message: "Invalid notification ID" }
    }
    
    await db
      .update(adminNotifications)
      .set({ isRead: true, updatedAt: new Date() })
      .where(eq(adminNotifications.id, notificationId))
    
    return { success: true }
  } catch (error) {
    console.error("Failed to mark notification as read:", error)
    return { success: false, message: "Failed to mark notification as read" }
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead() {
  try {
    await db
      .update(adminNotifications)
      .set({ isRead: true, updatedAt: new Date() })
      .where(eq(adminNotifications.isRead, false))
    
    return { success: true }
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error)
    return { success: false, message: "Failed to mark all notifications as read" }
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
