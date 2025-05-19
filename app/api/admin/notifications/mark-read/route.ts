import { headers } from "next/headers"
import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import { markNotificationAsRead } from "@/actions/admin/notificationActions"

export async function POST(request: NextRequest) {
  try {
    // Use headers() function for authentication
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
    
    // Parse the request body carefully
    let requestData;
    try {
      requestData = await request.json();
    } catch (error) {
      console.error("Error parsing request body:", error);
      return new NextResponse(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400 }
      );
    }
    
    const { id } = requestData;
    
    if (id === undefined || id === null) {
      return new NextResponse(
        JSON.stringify({ error: "Notification ID is required" }),
        { status: 400 }
      )
    }
    
    // Mark notification as read
    const result = await markNotificationAsRead(id)
    
    if (!result.success) {
      return new NextResponse(
        JSON.stringify({ error: result.message }),
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    )
  }
}
