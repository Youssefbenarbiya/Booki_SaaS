import { NextRequest, NextResponse } from "next/server"
import { getChatMessages } from "@/actions/chat/chatActions"
import { auth } from "@/auth"
import { headers } from "next/headers"

export async function GET(request: NextRequest) {
  // Get user session
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Extract query parameters
  const searchParams = request.nextUrl.searchParams
  const postId = searchParams.get("postId")
  const postType = searchParams.get("postType")
  const customerId = searchParams.get("customerId")

  if (!postId || !postType) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    )
  }

  try {
    // Get all messages for this post
    const result = await getChatMessages(postId, postType, session.user.id)

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to fetch messages" },
        { status: 500 }
      )
    }

    // If customerId is provided, filter messages to only include those between the user and the customer
    const messages = result.success && result.messages ? result.messages : []
    const filteredMessages = customerId
      ? messages.filter(
          (msg) =>
            (msg.senderId === customerId || msg.receiverId === customerId) &&
            (msg.senderId === session.user.id ||
              msg.receiverId === session.user.id)
        )
      : messages

    return NextResponse.json({ messages: filteredMessages })
  } catch (error) {
    console.error("Error fetching chat messages:", error)
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    )
  }
}

// Allow messages to be filtered by customerId
export async function POST(request: NextRequest) {
  // Get user session
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { postId, postType, customerId } = body

    if (!postId || !postType) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      )
    }

    // Get all messages for this post
    const result = await getChatMessages(postId, postType, session.user.id)

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to fetch messages" },
        { status: 500 }
      )
    }

    // Filter messages by customerId
    const messages = result.success && result.messages ? result.messages : []
    const filteredMessages = customerId
      ? messages.filter(
          (msg) =>
            (msg.senderId === customerId || msg.receiverId === customerId) &&
            (msg.senderId === session.user.id ||
              msg.receiverId === session.user.id)
        )
      : messages

    return NextResponse.json({ messages: filteredMessages })
  } catch (error) {
    console.error("Error processing request:", error)
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    )
  }
}
