import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/auth"
import db from "@/db/drizzle"
import { notifications, user, agencyEmployees } from "@/db/schema"
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

    // Variable to store the ID whose notifications we'll be marking as read
    let notificationsUserId = userId

    // Check if user is an employee
    if (currentUser.role === "employee") {
      const agencyMapping = await db.query.agencyEmployees.findFirst({
        where: eq(agencyEmployees.employeeId, userId),
      })

      if (agencyMapping) {
        notificationsUserId = agencyMapping.agencyId
      }
    }

    // Mark all unread notifications for this user or their agency as read
    await db
      .update(notifications)
      .set({ read: true })
      .where(
        and(
          eq(notifications.userId, notificationsUserId),
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
