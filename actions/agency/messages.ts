/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import db from "@/db/drizzle"
import {
  chatMessages,
  agencies,
  agencyEmployees,
  trips,
  cars,
  hotel,
  room,
  user as userTable,
} from "@/db/schema"
import { desc, eq, inArray, or } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export type Conversation = {
  postId: string
  postType: string
  postName: string
  customerId: string
  customerName?: string
  customerImage?: string
  lastMessage: any
  unreadCount: number
  displayName?: string
  postDisplayName?: string
}

export async function getAgencyConversations(agencyId: string) {
  try {
    console.log("getAgencyConversations called with agencyId:", agencyId)

    // Get the agency data
    const agencyData = await db.query.agencies.findFirst({
      where: eq(agencies.userId, agencyId),
    })

    console.log("Agency data found:", agencyData)

    if (!agencyData) {
      throw new Error("Agency not found")
    }

    // Get all user IDs associated with this agency (owner + employees)
    const employees = await db.query.agencyEmployees.findMany({
      where: eq(agencyEmployees.agencyId, agencyId),
      columns: { employeeId: true },
    })

    const agencyUserIds = [agencyId, ...employees.map((emp) => emp.employeeId)]
    console.log("Agency user IDs (owner + employees):", agencyUserIds)

    // Get messages where any agency member is either sender or receiver
    const allMessages = await db.query.chatMessages.findMany({
      where: or(
        inArray(chatMessages.senderId, agencyUserIds),
        inArray(chatMessages.receiverId, agencyUserIds)
      ),
      orderBy: [desc(chatMessages.createdAt)],
      limit: 300,
    })

    console.log("Total messages found:", allMessages.length)

    // If there are no messages, log a more detailed message
    if (allMessages.length === 0) {
      console.log("No messages found. This could be because:")
      console.log("- There are genuinely no messages in the database")
      console.log(
        "- The agency IDs used in the query don't match those in the messages"
      )
      console.log(
        "- The sender/receiver fields don't contain the expected values"
      )

      // Let's check what messages exist at all
      const checkAllMessages = await db.query.chatMessages.findMany({
        limit: 10,
      })
      console.log(
        "Sample of all messages in database:",
        checkAllMessages.map((msg) => ({
          id: msg.id,
          senderId: msg.senderId,
          receiverId: msg.receiverId,
          postId: msg.postId,
          postType: msg.postType,
          content: msg.content.substring(0, 20) + "...",
          createdAt: msg.createdAt,
        }))
      )
    }

    // Debug the messages
    if (allMessages.length > 0) {
      console.log(
        "First few messages:",
        allMessages.slice(0, 3).map((msg) => ({
          id: msg.id,
          senderId: msg.senderId,
          receiverId: msg.receiverId,
          postId: msg.postId,
          postType: msg.postType,
          content: msg.content.substring(0, 20) + "...",
        }))
      )
    }

    // NEW APPROACH: Group by post first, then by customer
    const conversationMap = new Map()

    // First, group messages by post
    const postGroups = new Map()

    for (const message of allMessages) {
      const postKey = `${message.postType}-${message.postId}`
      if (!postGroups.has(postKey)) {
        postGroups.set(postKey, [])
      }
      postGroups.get(postKey).push(message)
    }

    console.log("Post groups created:", postGroups.size)

    // Process each post group
    for (const [postKey, messages] of postGroups.entries()) {
      // Get post details from first message
      const firstMessage = messages[0]
      const [postType, postId] = postKey.split("-")

      // Group participants by non-agency users
      const customerMessages = new Map()

      for (const message of messages) {
        let customerId

        // Determine if sender or receiver is not an agency member
        if (!agencyUserIds.includes(message.senderId)) {
          customerId = message.senderId
        } else if (!agencyUserIds.includes(message.receiverId)) {
          customerId = message.receiverId
        } else {
          // This is a message between agency members, skip it
          continue
        }

        // Use customerId as key
        if (!customerMessages.has(customerId)) {
          customerMessages.set(customerId, [])
        }
        customerMessages.get(customerId).push(message)
      }

      // For each customer, create a conversation
      for (const [customerId, customerMsgs] of customerMessages.entries()) {
        // Sort messages by date, newest first
        customerMsgs.sort(
          (
            a: { createdAt: string | number | Date },
            b: { createdAt: string | number | Date }
          ) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )

        // Get the last message
        const lastMessage = customerMsgs[0]

        // Count unread messages
        const unreadCount = customerMsgs.filter(
          (msg: { receiverId: string; isRead: any }) =>
            agencyUserIds.includes(msg.receiverId) && !msg.isRead
        ).length

        // Create conversation entry
        const convKey = `${customerId}-${postType}-${postId}`
        conversationMap.set(convKey, {
          postId: postId,
          postType: postType,
          postName: `${postType.charAt(0).toUpperCase() + postType.slice(1)} #${postId}`,
          customerId: customerId,
          lastMessage: lastMessage,
          unreadCount: unreadCount,
        })
      }
    }

    // Convert Map to array
    const conversations: Conversation[] = Array.from(conversationMap.values())
    console.log("Processed conversations:", conversations.length)

    // Try to enrich conversations with real names where possible
    for (const conv of conversations) {
      try {
        // Fetch user information for each customer
        const customerInfo = await db.query.user.findFirst({
          where: eq(userTable.id, conv.customerId),
          columns: { name: true, image: true },
        })

        if (customerInfo?.name) {
          conv.customerName = customerInfo.name
          conv.customerImage = customerInfo.image ?? undefined
        }

        // Fetch post details for display
        let postDetails = null

        switch (conv.postType) {
          case "trip":
            postDetails = await db.query.trips.findFirst({
              where: eq(trips.id, parseInt(conv.postId)),
              columns: { name: true },
            })
            if (postDetails?.name) {
              conv.displayName = `${customerInfo?.name || "Customer"} - ${
                postDetails.name
              }`
              conv.postDisplayName = postDetails.name
            }
            break

          case "car":
            postDetails = await db.query.cars.findFirst({
              where: eq(cars.id, parseInt(conv.postId)),
              columns: { brand: true, model: true },
            })
            if (postDetails?.brand && postDetails?.model) {
              conv.displayName = `${customerInfo?.name || "Customer"} - ${
                postDetails.brand
              } ${postDetails.model}`
              conv.postDisplayName = `${postDetails.brand} ${postDetails.model}`
            }
            break

          case "hotel":
            postDetails = await db.query.hotel.findFirst({
              where: eq(hotel.id, conv.postId),
              columns: { name: true },
            })
            if (postDetails?.name) {
              conv.displayName = `${customerInfo?.name || "Customer"} - ${
                postDetails.name
              }`
              conv.postDisplayName = postDetails.name
            }
            break

          case "room":
            const roomDetails = await db.query.room.findFirst({
              where: eq(room.id, conv.postId),
              columns: { name: true, hotelId: true },
              with: {
                hotel: { columns: { name: true } },
              },
            })
            if (roomDetails?.name && roomDetails?.hotel?.name) {
              conv.displayName = `${customerInfo?.name || "Customer"} - ${
                roomDetails.name
              } at ${roomDetails.hotel.name}`
              conv.postDisplayName = `${roomDetails.name} at ${roomDetails.hotel.name}`
            }
            break
        }
      } catch (error) {
        console.log(
          `Could not fetch details for ${conv.postType} ${conv.postId}`
        )
      }
    }

    return { success: true, conversations }
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return { success: false, error: "Failed to load conversations" }
  }
}

export async function markMessageAsRead(messageId: string) {
  try {
    await db
      .update(chatMessages)
      .set({ isRead: true })
      .where(eq(chatMessages.id, parseInt(messageId, 10)))

    revalidatePath("/agency/dashboard/messages")
    return { success: true }
  } catch (error) {
    console.error("Error marking message as read:", error)
    return { success: false, error: "Failed to mark message as read" }
  }
}

export async function sendMessage({
  senderId,
  receiverId,
  content,
  postId,
  postType,
}: {
  senderId: string
  receiverId: string
  content: string
  postId: string
  postType: string
}) {
  try {
    console.log("Sending message:", {
      senderId,
      receiverId,
      content,
      postId,
      postType,
    })

    const newMessage = await db
      .insert(chatMessages)
      .values({
        senderId,
        receiverId,
        content,
        postId,
        postType,
        isRead: false,
        createdAt: new Date(),
      })
      .returning()

    console.log("Message saved successfully:", newMessage[0])

    revalidatePath("/agency/dashboard/messages")
    return { success: true, message: newMessage[0] }
  } catch (error) {
    console.error("Error sending message:", error)
    return { success: false, error: "Failed to send message" }
  }
}
