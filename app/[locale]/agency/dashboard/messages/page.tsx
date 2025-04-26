import { redirect } from "next/navigation"
import ChatManager from "@/components/chat/ChatManager"
import { auth } from "@/auth"
import { headers } from "next/headers"
import db from "@/db/drizzle"
import { chatMessages } from "@/db/schema"
import { desc, eq, sql, or } from "drizzle-orm"

export default async function AgencyMessagesPage({
  params,
}: {
  params: { locale: string }
}) {
  // Get session from server
  const session = await auth.api.getSession({ headers: await headers() })

  // Check if user is authenticated and is an agency
  if (!session?.user || session.user.role !== "agency owner") {
    redirect(`/${params.locale}/login?callbackUrl=/${params.locale}/agency/dashboard/messages`)
  }

  // Fetch conversations for this agency
  const agencyId = session.user.id
  
  try {
    // Get messages where agency is either sender or receiver using OR
    const allMessages = await db.query.chatMessages.findMany({
      where: or(
        eq(chatMessages.senderId, agencyId),
        eq(chatMessages.receiverId, agencyId)
      ),
      orderBy: [desc(chatMessages.createdAt)],
      limit: 100 // Increased limit to get more messages
    });
    
    // Group by postId-postType combination to create conversations
    const conversationMap = new Map();
    
    for (const message of allMessages) {
      const key = `${message.postType}-${message.postId}`;
      
      if (!conversationMap.has(key) || 
          new Date(message.createdAt) > new Date(conversationMap.get(key).lastMessage.createdAt)) {
        conversationMap.set(key, {
          postId: message.postId,
          postType: message.postType,
          postName: `${message.postType.charAt(0).toUpperCase() + message.postType.slice(1)} #${message.postId}`,
          lastMessage: message,
          unreadCount: message.receiverId === agencyId && !message.isRead ? 1 : 0
        });
      } else if (message.receiverId === agencyId && !message.isRead) {
        // Increment unread count for existing conversation
        const conv = conversationMap.get(key);
        conv.unreadCount = (conv.unreadCount || 0) + 1;
        conversationMap.set(key, conv);
      }
    }
    
    // Convert Map to array
    const conversations = Array.from(conversationMap.values());
    
    console.log(`Found ${conversations.length} conversations for agency ${agencyId}`);

    return (
      <div className="container mx-auto py-8 px-4">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-gray-500">
            Manage conversations with customers interested in your listings
          </p>
          
          <div className="bg-white rounded-lg shadow p-4">
            <ChatManager initialConversations={conversations} />
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error fetching conversations:", error);
    
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-gray-500">
            Manage conversations with customers interested in your listings
          </p>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
              Error loading conversations. Please try again later.
            </div>
          </div>
        </div>
      </div>
    )
  }
}
