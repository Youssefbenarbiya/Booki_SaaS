import { NextRequest, NextResponse } from "next/server"
import db from "@/db/drizzle"
import { chatMessages } from "@/db/schema"
import { eq, or, desc } from "drizzle-orm"
import { auth } from "@/auth"
import { headers } from "next/headers"

export async function GET(request: NextRequest) {
  // Get user session for security validation
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user || session.user.role !== "agency owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  const searchParams = request.nextUrl.searchParams
  const agencyId = searchParams.get("agencyId")
  
  if (!agencyId) {
    return NextResponse.json({ error: "Missing agencyId parameter" }, { status: 400 })
  }
  
  try {
    // Get all messages where this agency is either sender or receiver
    const messages = await db.query.chatMessages.findMany({
      where: or(
        eq(chatMessages.senderId, agencyId),
        eq(chatMessages.receiverId, agencyId)
      ),
      orderBy: [desc(chatMessages.createdAt)],
      limit: 50,
    })
    
    console.log(`Found ${messages.length} messages for agency ${agencyId}`)
    
    return NextResponse.json({ 
      success: true, 
      messages: messages.map(msg => ({
        id: msg.id,
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        content: msg.content,
        postId: msg.postId,
        postType: msg.postType,
        isRead: msg.isRead,
        createdAt: msg.createdAt,
      }))
    })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch messages" },
      { status: 500 }
    )
  }
} 