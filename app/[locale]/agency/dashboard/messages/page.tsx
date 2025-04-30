/* eslint-disable @typescript-eslint/no-unused-vars */
import { redirect } from "next/navigation";
import ChatManager from "@/components/chat/ChatManager";
import { auth } from "@/auth";
import { headers } from "next/headers";
import db from "@/db/drizzle";
import {
  chatMessages,
  agencies,
  agencyEmployees,
  trips,
  cars,
  hotel,
  room,
  user as userTable,
} from "@/db/schema";
import { desc, eq, inArray, or } from "drizzle-orm";
export default async function AgencyMessagesPage({
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Await params immediately:
  const { locale } = await params;
  // Get session from server
  const session = await auth.api.getSession({ headers: await headers() });

  // Check if user is authenticated and is an agency
  if (!session?.user || session.user.role !== "agency owner") {
    redirect(
      `/${locale}/login?callbackUrl=/${locale}/agency/dashboard/messages`
    );
  }

  // Fetch conversations for this agency
  const agencyId = session.user.id;

  try {
    // Get the agency data
    const agencyData = await db.query.agencies.findFirst({
      where: eq(agencies.userId, agencyId),
    });

    if (!agencyData) {
      throw new Error("Agency not found");
    }

    // Get all user IDs associated with this agency (owner + employees)
    const employees = await db.query.agencyEmployees.findMany({
      where: eq(agencyEmployees.agencyId, agencyId),
      columns: { employeeId: true },
    });

    const agencyUserIds = [agencyId, ...employees.map((emp) => emp.employeeId)];

    // Get messages where any agency member is either sender or receiver
    const allMessages = await db.query.chatMessages.findMany({
      where: or(
        inArray(chatMessages.senderId, agencyUserIds),
        inArray(chatMessages.receiverId, agencyUserIds)
      ),
      orderBy: [desc(chatMessages.createdAt)],
      limit: 300, // Increased limit to get more messages for better grouping
    });

    // Group by user instead of by post
    const conversationMap = new Map();

    for (const message of allMessages) {
      // Determine if the message is from a customer to agency, or agency to customer
      const isIncoming = agencyUserIds.includes(message.receiverId);
      // Get the customer ID (the non-agency user)
      const customerId = isIncoming ? message.senderId : message.receiverId;

      // Skip messages between agency members
      if (agencyUserIds.includes(customerId)) {
        continue;
      }

      // Create a unique key for each user-post combination
      const key = `${customerId}-${message.postType}-${message.postId}`;

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
          customerId: customerId, // Add the customer ID
          lastMessage: message,
          unreadCount:
            agencyUserIds.includes(message.receiverId) && !message.isRead
              ? 1
              : 0,
        });
      } else if (
        agencyUserIds.includes(message.receiverId) &&
        !message.isRead
      ) {
        // Increment unread count for existing conversation
        const conv = conversationMap.get(key);
        conv.unreadCount = (conv.unreadCount || 0) + 1;
        conversationMap.set(key, conv);
      }
    }

    // Convert Map to array
    const conversations = Array.from(conversationMap.values());

    // Try to enrich conversations with real names where possible
    for (const conv of conversations) {
      try {
        // Fetch user information for each customer
        const customerInfo = await db.query.user.findFirst({
          where: eq(userTable.id, conv.customerId),
          columns: { name: true, image: true },
        });

        if (customerInfo?.name) {
          conv.customerName = customerInfo.name;
          conv.customerImage = customerInfo.image;
        }

        // Fetch post details for display
        let postDetails = null;

        switch (conv.postType) {
          case "trip":
            postDetails = await db.query.trips.findFirst({
              where: eq(trips.id, parseInt(conv.postId)),
              columns: { name: true },
            });
            if (postDetails?.name) {
              conv.displayName = `${customerInfo?.name || "Customer"} - ${
                postDetails.name
              }`;
              conv.postDisplayName = postDetails.name;
            }
            break;

          case "car":
            postDetails = await db.query.cars.findFirst({
              where: eq(cars.id, parseInt(conv.postId)),
              columns: { brand: true, model: true },
            });
            if (postDetails?.brand && postDetails?.model) {
              conv.displayName = `${customerInfo?.name || "Customer"} - ${
                postDetails.brand
              } ${postDetails.model}`;
              conv.postDisplayName = `${postDetails.brand} ${postDetails.model}`;
            }
            break;

          case "hotel":
            postDetails = await db.query.hotel.findFirst({
              where: eq(hotel.id, conv.postId),
              columns: { name: true },
            });
            if (postDetails?.name) {
              conv.displayName = `${customerInfo?.name || "Customer"} - ${
                postDetails.name
              }`;
              conv.postDisplayName = postDetails.name;
            }
            break;

          case "room":
            const roomDetails = await db.query.room.findFirst({
              where: eq(room.id, conv.postId),
              columns: { name: true, hotelId: true },
              with: {
                hotel: { columns: { name: true } },
              },
            });
            if (roomDetails?.name && roomDetails?.hotel?.name) {
              conv.displayName = `${customerInfo?.name || "Customer"} - ${
                roomDetails.name
              } at ${roomDetails.hotel.name}`;
              conv.postDisplayName = `${roomDetails.name} at ${roomDetails.hotel.name}`;
            }
            break;
        }
      } catch (error) {
        console.log(
          `Could not fetch details for ${conv.postType} ${conv.postId}`
        );
      }
    }

    console.log(
      `Found ${conversations.length} conversations for agency ${agencyId}`
    );

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
    );
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
    );
  }
}
