"use server"

import { auth } from "@/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import db from "@/db/drizzle"
import {
  user,
  account,
  tripBookings,
  roomBookings,
  session,
  carBookings,
  blogs,
} from "@/db/schema"
import { eq } from "drizzle-orm"

export async function banUser(userId: string) {
  const authSession = await auth.api.getSession({
    headers: await headers(),
  })

  if (authSession?.user?.role !== "admin") {
    throw new Error("Unauthorized")
  }

  try {
    // Revoke all sessions
    await db.delete(session).where(eq(session.userId, userId))

    // Update status of car bookings to 'banned'
    await db
      .update(carBookings)
      .set({
        status: "canceled",
        updatedAt: new Date(),
      })
      .where(eq(carBookings.user_id, userId))

    // Ban the user
    await db
      .update(user)
      .set({
        banned: true,
        banReason: "Banned by admin",
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId))

    // Revalidate both agency and admin dashboard paths
    revalidatePath("/agency/dashboard/users")
    revalidatePath("/admin/users")
  } catch (error) {
    console.error("Error banning user:", error)
    throw new Error("Failed to ban user")
  }
}

export async function unbanUser(userId: string) {
  const authSession = await auth.api.getSession({
    headers: await headers(),
  })

  if (authSession?.user?.role !== "admin") {
    throw new Error("Unauthorized")
  }

  try {
    await db
      .update(user)
      .set({
        banned: false,
        banReason: null,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId))

    // Revalidate both agency and admin dashboard paths
    revalidatePath("/agency/dashboard/users")
    revalidatePath("/admin/users")
  } catch (error) {
    console.error("Error unbanning user:", error)
    throw new Error("Failed to unban user")
  }
}

export async function setUserRole(userId: string, role: string) {
  const authSession = await auth.api.getSession({
    headers: await headers(),
  })

  if (authSession?.user?.role !== "admin") {
    throw new Error("Unauthorized")
  }

  try {
    await db
      .update(user)
      .set({
        role,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId))

    // Revalidate both agency and admin dashboard paths
    revalidatePath("/agency/dashboard/users")
    revalidatePath("/admin/users")
  } catch (error) {
    console.error("Error setting user role:", error)
    throw new Error("Failed to set user role")
  }
}

export async function deleteUser(userId: string) {
  const authSession = await auth.api.getSession({
    headers: await headers(),
  })

  if (authSession?.user?.role !== "admin") {
    throw new Error("Unauthorized")
  }

  try {
    // Delete all trip bookings related to the user
    await db.delete(tripBookings).where(eq(tripBookings.userId, userId))

    // Delete all room bookings related to the user
    await db.delete(roomBookings).where(eq(roomBookings.userId, userId))

    // Delete all car bookings related to the user
    await db.delete(carBookings).where(eq(carBookings.user_id, userId))

    // Set blog authorId to null rather than deleting them
    await db
      .update(blogs)
      .set({
        authorId: null,
      })
      .where(eq(blogs.authorId, userId))

    // Delete sessions
    await db.delete(session).where(eq(session.userId, userId))

    // Delete accounts
    await db.delete(account).where(eq(account.userId, userId))

    // Finally delete the user
    await db.delete(user).where(eq(user.id, userId))

    // Revalidate both agency and admin dashboard paths
    revalidatePath("/agency/dashboard/users")
    revalidatePath("/admin/users")
  } catch (error) {
    console.error("Error deleting user:", error)
    throw new Error("Failed to delete user")
  }
}
