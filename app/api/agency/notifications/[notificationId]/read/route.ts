import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/auth"
import db from "@/db/drizzle"
import { notifications } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function POST(
  request: Request,
  { params }: { params: { notificationId: string } }
) {
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

    const notificationId = parseInt(params.notificationId, 10)
    if (isNaN(notificationId)) {
      return NextResponse.json(
        { success: false, message: "Invalid notification ID" },
        { status: 400 }
      )
    }

    // Make sure the notification belongs to the current user
    const notification = await db.query.notifications.findFirst({
      where: eq(notifications.id, notificationId),
    })

    if (!notification || notification.userId !== session.user.id) {
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
