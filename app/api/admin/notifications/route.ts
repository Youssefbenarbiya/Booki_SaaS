import { headers } from "next/headers"
import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import { getAdminNotifications, getUnreadNotificationCount } from "@/actions/admin/notificationActions"

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
  
    
    // Check if user is authenticated and is an admin
    if (!session?.user || session.user.role !== "admin") {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized: Only admins can access notifications" }),
        { status: 401 }
      )
    }
    
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    
    // Get notifications with pagination
    const result = await getAdminNotifications(page, limit)
    
    if (!result.success) {
      return new NextResponse(
        JSON.stringify({ error: result.message }),
        { status: 500 }
      )
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in admin notifications API:", error)
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    )
  }
}
