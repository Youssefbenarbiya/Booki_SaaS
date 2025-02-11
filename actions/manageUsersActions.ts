"use server"

import { auth } from "@/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import db from "@/db/drizzle"
import { user, account, tripBookings, roomBookings, session } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function banUser(userId: string) {
  const authSession = await auth.api.getSession({
    headers: await headers(),
  })

  if (authSession?.user?.role !== "admin") {
    throw new Error("Unauthorized")
  }

  try {
    await db.transaction(async (tx) => {
      // First revoke all sessions
      await tx.delete(session).where(eq(session.userId, userId))

      // Then ban the user
      await tx
        .update(user)
        .set({
          banned: true,
          banReason: "Banned by admin",
          updatedAt: new Date(),
        })
        .where(eq(user.id, userId))
    })

    revalidatePath("/admin/dashboard/users")
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

    revalidatePath("/admin/dashboard/users")
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

    revalidatePath("/admin/dashboard/users")
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
    await db.transaction(async (tx) => {
      // Delete all related records first
      await tx.delete(tripBookings).where(eq(tripBookings.userId, userId))
      await tx.delete(roomBookings).where(eq(roomBookings.userId, userId))
      await tx.delete(session).where(eq(session.userId, userId))
      await tx.delete(account).where(eq(account.userId, userId))

      // Finally delete the user
      await tx.delete(user).where(eq(user.id, userId))
    })

    revalidatePath("/admin/dashboard/users")
  } catch (error) {
    console.error("Error deleting user:", error)
    throw new Error("Failed to delete user")
  }
}
