import { NextRequest, NextResponse } from "next/server"
import db from "@/db/drizzle"
import { chatMessages } from "@/db/schema"
import { auth } from "@/auth"
import { headers } from "next/headers"

export async function POST(request: NextRequest) {
  // Get user session for security validation
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user || session.user.role !== "agency owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  try {
    const body = await request.json()
    const { senderId, receiverId, content, postId, postType } = body
    
    // Validate all required fields
    if (!senderId || !receiverId || !content || !postId || !postType) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }
    
    // Security check - only allow the logged-in user to send messages as themselves
    if (senderId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Cannot send messages as another user" },
        { status: 403 }
      )
    }
    
    console.log("Sending test message:", { senderId, receiverId, postId, postType })
    
    // Create the message
    const result = await db.insert(chatMessages).values({
      senderId,
      receiverId,
      content,
      postId,
      postType,
      isRead: false,
      createdAt: new Date(),
    }).returning()
    
    console.log("Message created:", result[0])
    
    return NextResponse.json({ 
      success: true, 
      message: result[0]
    })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json(
      { success: false, error: "Failed to send message" },
      { status: 500 }
    )
  }
} 