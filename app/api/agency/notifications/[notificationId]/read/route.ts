import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/auth"
import db from "@/db/drizzle"
import { notifications, user, agencyEmployees } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ notificationId: string }> } // ← now a Promise
) {
  try {
    // 1. Await headers() since it's async
    const hdrs = await headers()
    const session = await auth.api.getSession({ headers: hdrs })

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    // 2. Await params to extract notificationId
    const { notificationId: notifIdStr } = await params
    const notificationId = parseInt(notifIdStr, 10)
    if (isNaN(notificationId)) {
      return NextResponse.json(
        { success: false, message: "Invalid notification ID" },
        { status: 400 }
      )
    }

    const userId = session.user.id

    // Fetch current user to check role
    const currentUser = await db.query.user.findFirst({
      where: eq(user.id, userId),
    })
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      )
    }

    // Determine whose notifications we should check
    let notificationsUserId = userId
    if (currentUser.role === "employee") {
      const agencyMapping = await db.query.agencyEmployees.findFirst({
        where: eq(agencyEmployees.employeeId, userId),
      })
      if (agencyMapping) {
        notificationsUserId = agencyMapping.agencyId
      }
    }

    // Verify that notification belongs to this user/agency
    const notification = await db.query.notifications.findFirst({
      where: eq(notifications.id, notificationId),
    })
    if (!notification || notification.userId !== notificationsUserId) {
      return NextResponse.json(
        { success: false, message: "Notification not found" },
        { status: 404 }
      )
    }

    // Mark as read
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, notificationId))

    return NextResponse.json(
      { success: true, message: "Notification marked as read" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    )
  }
}
