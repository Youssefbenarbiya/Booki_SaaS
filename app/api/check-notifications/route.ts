import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/auth"
import db from "@/db/drizzle"
import { notifications } from "@/db/schema"

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get all notifications in the system
    const allNotifications = await db.select().from(notifications).limit(100)
    
    return NextResponse.json({
      success: true,
      totalCount: allNotifications.length,
      notifications: allNotifications
    })
  } catch (error) {
    console.error("Error checking notifications:", error)
    return NextResponse.json(
      { success: false, message: "Server error", error: String(error) },
      { status: 500 }
    )
  }
}
