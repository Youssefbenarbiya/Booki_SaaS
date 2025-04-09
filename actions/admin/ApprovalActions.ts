"use server"

import { revalidatePath } from "next/cache"
import db from "@/db/drizzle"
import { trips, cars, hotel, blogs } from "@/db/schema"
import { eq } from "drizzle-orm"
import {
  sendTripStatusNotification,
  sendCarStatusNotification,
  sendHotelStatusNotification,
  sendBlogStatusNotification,
} from "./notificationActions"

export async function approveTrip(tripId: number) {
  try {
    await db
      .update(trips)
      .set({
        status: "approved",
        updatedAt: new Date(),
      })
      .where(eq(trips.id, tripId))

    // Send notification to agency
    await sendTripStatusNotification(tripId, "approved")

    revalidatePath("/admin/dashboard")
    return { success: true, message: "Trip approved successfully" }
  } catch (error) {
    console.error("Error approving trip:", error)
    return { success: false, message: "Failed to approve trip" }
  }
}

export async function rejectTrip(tripId: number) {
  try {
    await db
      .update(trips)
      .set({
        status: "rejected",
        isAvailable: false,
        updatedAt: new Date(),
      })
      .where(eq(trips.id, tripId))

    // Send notification to agency
    await sendTripStatusNotification(tripId, "rejected")

    revalidatePath("/admin/dashboard")
    return { success: true, message: "Trip rejected successfully" }
  } catch (error) {
    console.error("Error rejecting trip:", error)
    return { success: false, message: "Failed to reject trip" }
  }
}

export async function approveCar(carId: number) {
  try {
    await db
      .update(cars)
      .set({
        status: "approved",
        updatedAt: new Date(),
      })
      .where(eq(cars.id, carId))

    // Send notification to agency
    await sendCarStatusNotification(carId, "approved")

    revalidatePath("/admin/dashboard")
    return { success: true, message: "Car approved successfully" }
  } catch (error) {
    console.error("Error approving car:", error)
    return { success: false, message: "Failed to approve car" }
  }
}

export async function rejectCar(carId: number) {
  try {
    await db
      .update(cars)
      .set({
        status: "rejected",
        isAvailable: false,
        updatedAt: new Date(),
      })
      .where(eq(cars.id, carId))

    // Send notification to agency
    await sendCarStatusNotification(carId, "rejected")

    revalidatePath("/admin/dashboard")
    return { success: true, message: "Car rejected successfully" }
  } catch (error) {
    console.error("Error rejecting car:", error)
    return { success: false, message: "Failed to reject car" }
  }
}

export async function approveHotel(hotelId: string | number) {
  try {
    // Convert the hotelId to string if it's a number
    const hotelIdString = typeof hotelId === 'number' ? String(hotelId) : hotelId;
    
    console.log(`Approving hotel with ID: ${hotelIdString}`);
    
    await db
      .update(hotel)
      .set({
        status: "approved",
        updatedAt: new Date(),
      })
      .where(eq(hotel.id, hotelIdString));

    // Send notification to agency
    await sendHotelStatusNotification(hotelId, "approved");

    // Revalidate all relevant paths
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/verify-offers");
    revalidatePath(`/admin/hotels/${hotelIdString}`);
    revalidatePath("/");
    
    console.log(`Successfully approved hotel with ID: ${hotelIdString}`);
    return { success: true, message: "Hotel approved successfully" };
  } catch (error) {
    console.error("Error approving hotel:", error);
    return { success: false, message: "Failed to approve hotel" };
  }
}

export async function rejectHotel(hotelId: string | number) {
  try {
    // Convert the hotelId to string if it's a number
    const hotelIdString = typeof hotelId === 'number' ? String(hotelId) : hotelId;
    
    console.log(`Rejecting hotel with ID: ${hotelIdString}`);
    
    await db
      .update(hotel)
      .set({
        status: "rejected",
        updatedAt: new Date(),
      })
      .where(eq(hotel.id, hotelIdString));

    // Send notification to agency
    await sendHotelStatusNotification(hotelId, "rejected");

    // Revalidate all relevant paths
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/verify-offers");
    revalidatePath(`/admin/hotels/${hotelIdString}`);
    revalidatePath("/");
    
    console.log(`Successfully rejected hotel with ID: ${hotelIdString}`);
    return { success: true, message: "Hotel rejected successfully" };
  } catch (error) {
    console.error("Error rejecting hotel:", error);
    return { success: false, message: "Failed to reject hotel" };
  }
}

export async function approveBlog(blogId: number) {
  try {
    // Get blog details to check if it was marked for publishing
    const blog = await db.query.blogs.findFirst({
      where: eq(blogs.id, blogId),
      columns: {
        published: true,
      },
    })

    await db
      .update(blogs)
      .set({
        status: "approved",
        // Only set published to true if admin approves AND agency wanted it published
        published: blog?.published ?? false,
        publishedAt: blog?.published ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(blogs.id, blogId))

    // Send notification to agency
    await sendBlogStatusNotification(blogId, "approved")

    revalidatePath("/admin/dashboard")
    revalidatePath("/admin/verify-blogs")
    revalidatePath("/blogs")
    return { success: true, message: "Blog approved successfully" }
  } catch (error) {
    console.error("Error approving blog:", error)
    return { success: false, message: "Failed to approve blog" }
  }
}

export async function rejectBlog(blogId: number) {
  try {
    await db
      .update(blogs)
      .set({
        status: "rejected",
        published: false,
        publishedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(blogs.id, blogId))

    // Send notification to agency
    await sendBlogStatusNotification(blogId, "rejected")

    revalidatePath("/admin/dashboard")
    revalidatePath("/admin/verify-blogs")
    return { success: true, message: "Blog rejected successfully" }
  } catch (error) {
    console.error("Error rejecting blog:", error)
    return { success: false, message: "Failed to reject blog" }
  }
}
