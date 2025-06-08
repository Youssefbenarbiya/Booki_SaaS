/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { chatMessages, agencies, agencyEmployees } from "@/db/schema"
import { eq, and, desc, or, count, inArray } from "drizzle-orm"
import { ChatMessage } from "@/lib/types/chat"
import db from "@/db/drizzle"

/**
 * Save a chat message to the database
 */
export async function saveChatMessage(message: ChatMessage) {
  try {
    console.log("Saving chat message to database:", message);
    
    // With microservice, we have two options:
    // 1. Continue using direct database operations (default)
    // 2. Forward to the microservice API (uncomment to use)

    /* Microservice API approach - uncomment to use
    const chatApiUrl = getChatApiUrl();
    const response = await fetch(`${chatApiUrl}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });
    
    if (!response.ok) {
      throw new Error(`Error saving message: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result;
    */
    
    // Default direct database approach:
    // IMPORTANT: Remove customerId from database insert since the column doesn't exist yet
    // We'll use in-memory filtering instead
    const { customerId, ...messageToSave } = message as any;
    
    const result = await db.insert(chatMessages).values({
      postId: messageToSave.postId,
      postType: messageToSave.postType,
      senderId: messageToSave.senderId,
      receiverId: messageToSave.receiverId,
      content: messageToSave.content,
      type: messageToSave.type || "text",
      isRead: false,
    }).returning()

    // Add customerId back to the returned message for client-side filtering
    const savedMessage = result[0];
    if (savedMessage && customerId) {
      (savedMessage as any).customerId = customerId;
    }

    console.log("Successfully saved message, returning:", savedMessage);
    return { success: true, message: savedMessage }
  } catch (error) {
    console.error("Error saving chat message:", error)
    return { success: false, error: "Failed to save message" }
  }
}

/**
 * Get all user IDs associated with an agency
 * @param agencyId The agency user ID
 * @returns Array of user IDs (agency owner + employees)
 */
async function getAgencyUserIds(agencyId: string): Promise<string[]> {
  try {
    // Get agency employees first
    const employees = await db.query.agencyEmployees.findMany({
      where: eq(agencyEmployees.agencyId, agencyId),
      columns: { employeeId: true }
    });
    
    const employeeIds = employees.map(emp => emp.employeeId);
    
    // Add the agency owner's ID
    return [agencyId, ...employeeIds];
  } catch (error) {
    console.error("Error fetching agency user IDs:", error);
    return [agencyId]; // Fall back to just the agency owner ID
  }
}

/**
 * Get chat messages for a specific post
 */
export async function getChatMessages(postId: string, postType: string, userId: string) {
  try {
    // With microservice, we have two options:
    // 1. Continue using direct database operations (default)
    // 2. Forward to the microservice API (uncomment to use)

    /* Microservice API approach - uncomment to use
    const chatApiUrl = getChatApiUrl();
    const response = await fetch(
      `${chatApiUrl}/messages?postId=${postId}&postType=${postType}&userId=${userId}`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) {
      throw new Error(`Error fetching messages: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result;
    */

    // Check if user is an agency member
    const agency = await db.query.agencies.findFirst({
      where: eq(agencies.userId, userId),
      columns: { userId: true }
    });
    
    // Create query conditions
    let conditions;
    
    if (agency) {
      // For agency users, get all agency user IDs to show all messages
      // This includes the agency owner and all employees
      const agencyUserIds = await getAgencyUserIds(agency.userId);
      
      conditions = and(
        eq(chatMessages.postId, postId),
        eq(chatMessages.postType, postType),
        or(
          // Messages sent by any agency member
          inArray(chatMessages.senderId, agencyUserIds),
          // Messages received by any agency member
          inArray(chatMessages.receiverId, agencyUserIds)
        )
      );
    } else {
      // For regular customers, only show their messages
      conditions = and(
        eq(chatMessages.postId, postId),
        eq(chatMessages.postType, postType),
        or(
          eq(chatMessages.senderId, userId),
          eq(chatMessages.receiverId, userId)
        )
      );
    }
    
    const result = await db.query.chatMessages.findMany({
      where: conditions,
      orderBy: [desc(chatMessages.createdAt)],
    });

    return { success: true, messages: result }
  } catch (error) {
    console.error("Error fetching chat messages:", error)
    return { success: false, error: "Failed to fetch messages" }
  }
}

/**
 * Get all agency conversations with their last messages
 */
export async function getAgencyConversations(agencyId: string) {
  try {
    /* Microservice API approach - uncomment to use
    const chatApiUrl = getChatApiUrl();
    const response = await fetch(
      `${chatApiUrl}/conversations?agencyId=${agencyId}`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) {
      throw new Error(`Error fetching conversations: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result;
    */

    // Get the agency's user IDs (owner + employees)
    const agencyUserIds = await getAgencyUserIds(agencyId);
    
    // Get all posts with messages involving this agency
    const messagePosts = await db.select({
      postId: chatMessages.postId,
      postType: chatMessages.postType,
    })
    .from(chatMessages)
    .where(
      or(
        inArray(chatMessages.senderId, agencyUserIds),
        inArray(chatMessages.receiverId, agencyUserIds)
      )
    )
    .groupBy(chatMessages.postId, chatMessages.postType);
    
    // For each post, get the last message and unread count
    const conversations = await Promise.all(
      messagePosts.map(async (post) => {
        // Get the last message for this post
        const lastMessageResult = await db.query.chatMessages.findMany({
          where: and(
            eq(chatMessages.postId, post.postId),
            eq(chatMessages.postType, post.postType),
            or(
              inArray(chatMessages.senderId, agencyUserIds),
              inArray(chatMessages.receiverId, agencyUserIds)
            )
          ),
          orderBy: [desc(chatMessages.createdAt)],
          limit: 1,
        });
        
        // Get unread count for this post
        const unreadResult = await db.select({ count: count() })
          .from(chatMessages)
          .where(and(
            eq(chatMessages.postId, post.postId),
            eq(chatMessages.postType, post.postType),
            inArray(chatMessages.receiverId, agencyUserIds),
            eq(chatMessages.isRead, false)
          ));
        
        const lastMessage = lastMessageResult[0] || null;
        const unreadCount = unreadResult[0]?.count || 0;
        
        // Get customer ID and name
        let customerId = null;
        let customerName = null;
        
        if (lastMessage) {
          // Determine the customer ID (the person who is not from the agency)
          if (!agencyUserIds.includes(lastMessage.senderId)) {
            customerId = lastMessage.senderId;
          } else if (!agencyUserIds.includes(lastMessage.receiverId)) {
            customerId = lastMessage.receiverId;
          }
          
          // For future: fetch customer name
        }
        
        return {
          postId: post.postId,
          postType: post.postType,
          postName: post.postId, // Default name, should be overridden by API call
          lastMessage,
          unreadCount,
          customerId,
          customerName
        };
      })
    );
    
    return { success: true, conversations };
  } catch (error) {
    console.error("Error getting agency conversations:", error);
    return { success: false, error: "Failed to get conversations" };
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
    // Check if user is an agency member
    const agency = await db.query.agencies.findFirst({
      where: eq(agencies.userId, receiverId),
      columns: { userId: true }
    });
    
    let updateConditions;
    
    if (agency) {
      // For agency users, get all agency user IDs
      const agencyUserIds = await getAgencyUserIds(agency.userId);
      
      updateConditions = and(
        eq(chatMessages.postId, postId),
        eq(chatMessages.postType, postType),
        inArray(chatMessages.receiverId, agencyUserIds),
        eq(chatMessages.isRead, false)
      );
    } else {
      // For regular customers
      updateConditions = and(
        eq(chatMessages.postId, postId),
        eq(chatMessages.postType, postType),
        eq(chatMessages.receiverId, receiverId),
        eq(chatMessages.isRead, false)
      );
    }
    
    await db.update(chatMessages)
      .set({ isRead: true })
      .where(updateConditions);

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
    // Check if user is an agency member
    const agency = await db.query.agencies.findFirst({
      where: eq(agencies.userId, userId),
      columns: { userId: true }
    });
    
    let countConditions;
    
    if (agency) {
      // For agency users, get all agency user IDs
      const agencyUserIds = await getAgencyUserIds(agency.userId);
      
      countConditions = and(
        inArray(chatMessages.receiverId, agencyUserIds),
        eq(chatMessages.isRead, false)
      );
    } else {
      // For regular customers
      countConditions = and(
        eq(chatMessages.receiverId, userId),
        eq(chatMessages.isRead, false)
      );
    }
    
    const result = await db.select({ count: count() })
      .from(chatMessages)
      .where(countConditions);

    return { 
      success: true, 
      count: result[0]?.count || 0 
    }
  } catch (error) {
    console.error("Error getting unread message count:", error)
    return { success: false, error: "Failed to get unread count" }
  }
} 