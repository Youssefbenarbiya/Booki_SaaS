"use server"

import { chatMessages } from "@/db/schema"
import { eq, and, desc, or, count } from "drizzle-orm"
import { ChatMessage } from "@/lib/types/chat"
import db from "@/db/drizzle"

/**
 * Save a chat message to the database
 */
export async function saveChatMessage(message: ChatMessage) {
  try {
    const result = await db.insert(chatMessages).values({
      postId: message.postId,
      postType: message.postType,
      senderId: message.senderId,
      receiverId: message.receiverId,
      content: message.content,
      type: message.type || "text",
      isRead: false,
    }).returning()

    return { success: true, message: result[0] }
  } catch (error) {
    console.error("Error saving chat message:", error)
    return { success: false, error: "Failed to save message" }
  }
}

/**
 * Get chat messages for a specific post
 */
export async function getChatMessages(postId: string, postType: string, userId: string) {
  try {
    const result = await db.query.chatMessages.findMany({
      where: and(
        eq(chatMessages.postId, postId),
        eq(chatMessages.postType, postType),
        // User must be either sender or receiver to see messages
        // This ensures privacy
        or(
          eq(chatMessages.senderId, userId),
          eq(chatMessages.receiverId, userId)
        )
      ),
      orderBy: [desc(chatMessages.createdAt)],
      with: {
        sender: true,
        receiver: true,
      },
    })

    return { success: true, messages: result }
  } catch (error) {
    console.error("Error fetching chat messages:", error)
    return { success: false, error: "Failed to fetch messages" }
  }
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(
  postId: string, 
  postType: string, 
  receiverId: string
) {
  try {
    await db.update(chatMessages)
      .set({ isRead: true })
      .where(
        and(
          eq(chatMessages.postId, postId),
          eq(chatMessages.postType, postType),
          eq(chatMessages.receiverId, receiverId),
          eq(chatMessages.isRead, false)
        )
      )

    return { success: true }
  } catch (error) {
    console.error("Error marking messages as read:", error)
    return { success: false, error: "Failed to mark messages as read" }
  }
}

/**
 * Get unread message count for a user
 */
export async function getUnreadMessageCount(userId: string) {
  try {
    const result = await db.select({ count: count() })
      .from(chatMessages)
      .where(
        and(
          eq(chatMessages.receiverId, userId),
          eq(chatMessages.isRead, false)
        )
      )

    return { 
      success: true, 
      count: result[0]?.count || 0 
    }
  } catch (error) {
    console.error("Error getting unread message count:", error)
    return { success: false, error: "Failed to get unread count" }
  }
} 