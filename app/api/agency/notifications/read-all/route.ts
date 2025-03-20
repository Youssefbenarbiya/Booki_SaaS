import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/auth"
import db from "@/db/drizzle"
import { notifications } from "@/db/schema"
import { eq, and } from "drizzle-orm"

export async function POST() {
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

    // Mark all unread notifications for this user as read
    await db
      .update(notifications)
      .set({ read: true })
      .where(
        and(
          eq(notifications.userId, session.user.id),
          eq(notifications.read, false)
        )
      )

    return NextResponse.json(
      { success: true, message: "All notifications marked as read" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    )
  }
}
