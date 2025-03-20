"use server"

import { headers } from "next/headers"
import { auth } from "@/auth"
import db from "@/db/drizzle"
import { notifications } from "@/db/schema"
import { eq, and, desc, count } from "drizzle-orm"

export async function getAgencyNotifications(limit = 10) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      console.log("No authenticated user found")
      return { notifications: [], unreadCount: 0 }
    }

    const userId = session.user.id
    console.log(
      `Getting notifications for user ID: ${userId}, role: ${session.user.role}`
    )

    // First check if any notifications exist for this user
    const allNotifications = await db.query.notifications.findMany({
      where: eq(notifications.userId, userId),
    })

    console.log(
      `Total notifications in database for user ${userId}: ${allNotifications.length}`
    )

    if (allNotifications.length === 0) {
      console.log("No notifications found for this user")
    } else {
      console.log(
        "Sample notification:",
        JSON.stringify(allNotifications[0], null, 2)
      )
    }

    // Get paginated notifications
    const notificationsList = await db.query.notifications.findMany({
      where: eq(notifications.userId, userId),
      orderBy: [desc(notifications.createdAt)],
      limit,
    })

    // Count unread notifications
    const unreadResult = await db
      .select({ value: count() })
      .from(notifications)
      .where(
        and(eq(notifications.userId, userId), eq(notifications.read, false))
      )

    const unreadCount = unreadResult[0]?.value || 0
    console.log(
      `Unread count: ${unreadCount} out of ${notificationsList.length} retrieved`
    )

    return {
      notifications: notificationsList,
      unreadCount,
    }
  } catch (error) {
    console.error("Error fetching agency notifications:", error)
    return { notifications: [], unreadCount: 0 }
  }
}
