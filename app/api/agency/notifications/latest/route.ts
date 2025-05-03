/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/auth"
import db from "@/db/drizzle"
import { notifications, user, agencyEmployees } from "@/db/schema"
import { eq, and, desc, count } from "drizzle-orm"

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Get the user's details including their role
    const currentUser = await db.query.user.findFirst({
      where: eq(user.id, userId),
    })

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      )
    }

    // Variable to store the ID whose notifications we'll be showing
    let notificationsUserId = userId

    // Fix: Check for "employee" role (lowercase) instead of "AGENCY_EMPLOYEE"
    if (currentUser.role === "employee") {
      const agencyMapping = await db.query.agencyEmployees.findFirst({
        where: eq(agencyEmployees.employeeId, userId),
      })

      if (agencyMapping) {
        notificationsUserId = agencyMapping.agencyId
      } else {
        const allMappings = await db.query.agencyEmployees.findMany({})
      }
    }

    // Get the latest notifications for the resolved user ID
    const latestNotifications = await db.query.notifications.findMany({
      where: eq(notifications.userId, notificationsUserId),
      orderBy: [desc(notifications.createdAt)],
      limit: 5,
    })

    // Count unread notifications
    const unreadResult = await db
      .select({ value: count() })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, notificationsUserId),
          eq(notifications.read, false)
        )
      )

    const unreadCount = unreadResult[0]?.value || 0

    return NextResponse.json({
      success: true,
      notifications: latestNotifications,
      unreadCount,
    })
  } catch (error) {
    console.error("Error fetching latest notifications:", error)
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    )
  }
}
