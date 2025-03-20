"use server"

import { headers } from "next/headers"
import { auth } from "@/auth"
import db from "@/db/drizzle"
import { notifications } from "@/db/schema"
import { eq, and, desc } from "drizzle-orm"

export async function getAgencyNotifications(limit = 10) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    
    if (!session?.user) {
      return { notifications: [], unreadCount: 0 }
    }

    const notificationsList = await db.query.notifications.findMany({
      where: eq(notifications.userId, session.user.id),
      orderBy: [desc(notifications.createdAt)],
      limit,
    })

    const unreadCount = await db
      .select({ count: notifications.id })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, session.user.id),
          eq(notifications.read, false)
        )
      )
      .then((result) => result.length)

    return { 
      notifications: notificationsList,
      unreadCount 
    }
  } catch (error) {
    console.error("Error fetching agency notifications:", error)
    return { notifications: [], unreadCount: 0 }
  }
}
