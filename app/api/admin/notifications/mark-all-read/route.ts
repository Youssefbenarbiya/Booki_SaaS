import { headers } from "next/headers"
import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import { markAllNotificationsAsRead } from "@/actions/admin/notificationActions"

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
  
    // Check if user is authenticated and is an admin
    if (!session?.user || session.user.role !== "admin") {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized: Only admins can mark notifications as read" }),
        { status: 401 }
      )
    }
    
    // Mark all notifications as read
    const result = await markAllNotificationsAsRead()
    
    if (!result.success) {
      return new NextResponse(
        JSON.stringify({ error: result.message }),
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    )
  }
}
