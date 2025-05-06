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
      console.log("- The agency IDs used in the query don't match those in the messages")
      console.log("- The sender/receiver fields don't contain the expected values")
      
      // Let's check what messages exist at all
      const checkAllMessages = await db.query.chatMessages.findMany({
        limit: 10,
      })
      console.log("Sample of all messages in database:", 
        checkAllMessages.map(msg => ({
          id: msg.id,
          senderId: msg.senderId,
          receiverId: msg.receiverId,
          postId: msg.postId,
          postType: msg.postType,
          content: msg.content.substring(0, 20) + "...",
          createdAt: msg.createdAt
        }))
      )
    }

    // Group by user instead of by post
    const conversationMap = new Map()

    for (const message of allMessages) {
      // Determine if the message is from a customer to agency, or agency to customer
      const isIncoming = agencyUserIds.includes(message.receiverId)
      // Get the customer ID (the non-agency user)
      const customerId = isIncoming ? message.senderId : message.receiverId

      // Skip messages between agency members
      if (agencyUserIds.includes(customerId)) {
        continue
      }

      // Create a unique key for each user-post combination
      const key = `${customerId}-${message.postType}-${message.postId}`

      if (
        !conversationMap.has(key) ||
        new Date(message.createdAt) >
          new Date(conversationMap.get(key).lastMessage.createdAt)
      ) {
        conversationMap.set(key, {
          postId: message.postId,
          postType: message.postType,
          postName: `${
            message.postType.charAt(0).toUpperCase() + message.postType.slice(1)
          } #${message.postId}`,
          customerId: customerId,
          lastMessage: message,
          unreadCount:
            agencyUserIds.includes(message.receiverId) && !message.isRead
              ? 1
              : 0,
        })
      } else if (
        agencyUserIds.includes(message.receiverId) &&
        !message.isRead
      ) {
        // Increment unread count for existing conversation
        const conv = conversationMap.get(key)
        conv.unreadCount = (conv.unreadCount || 0) + 1
        conversationMap.set(key, conv)
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
    console.log("Sending message:", {senderId, receiverId, content, postId, postType})
    
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

// For debugging purposes only - add a test message
export async function createTestMessage(agencyId: string) {
  try {
    // First, find a user who is not this agency
    const someUser = await db.query.user.findFirst({
      where: eq(userTable.id, "test"),  // Using a condition that will be false but has correct type
      columns: { id: true },
    })
    
    if (!someUser) {
      return { success: false, error: "No other users found to send test message" }
    }
    
    // Create a test trip if none exists
    const existingTrip = await db.query.trips.findFirst()
    let tripId = existingTrip?.id
    
    if (!tripId) {
      // Create a dummy trip for testing
      const newTrip = await db.insert(trips)
        .values({
          name: "Test Trip",
          description: "Test trip for message testing",
          destination: "Test Destination",
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          originalPrice: "100",
          capacity: 10,
          agencyId: agencyId,
          createdBy: agencyId,
        })
        .returning()
      
      if (newTrip[0]) {
        tripId = newTrip[0].id
      } else {
        return { success: false, error: "Could not create test trip" }
      }
    }
    
    // Create a message from user to agency
    const userToAgencyMessage = await db
      .insert(chatMessages)
      .values({
        senderId: someUser.id,
        receiverId: agencyId,
        content: "Hello, I'm interested in this trip! (Test message)",
        postId: tripId.toString(),
        postType: "trip",
        isRead: false,
        createdAt: new Date(),
      })
      .returning()
    
    // Create a message from agency to user
    const agencyToUserMessage = await db
      .insert(chatMessages)
      .values({
        senderId: agencyId,
        receiverId: someUser.id,
        content: "Thank you for your interest! How can I help? (Test message)",
        postId: tripId.toString(),
        postType: "trip",
        isRead: false,
        createdAt: new Date(Date.now() + 10000), // 10 seconds later
      })
      .returning()
    
    revalidatePath("/agency/dashboard/messages")
    
    return { 
      success: true, 
      messages: [userToAgencyMessage[0], agencyToUserMessage[0]],
      tripId,
      userId: someUser.id
    }
  } catch (error: any) {
    console.error("Error creating test message:", error)
    return { success: false, error: `Failed to create test message: ${error.message}` }
  }
}
