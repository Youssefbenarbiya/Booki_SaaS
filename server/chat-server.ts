import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { WebSocketServer, WebSocket as WSWebSocket } from "ws";
import http from "http";
import {
  ChatMessage,
  ChatConnection,
  PostConnection,
  WebSocketMessage,
} from "@/lib/types/chat";
import { saveChatMessage, getChatMessages } from "@/actions/chat/chatActions";
import db from "@/db/drizzle";
import { trips, cars, hotel, room, agencies } from "@/db/schema";
import { eq } from "drizzle-orm";

// Store active connections
const connections = new Map<string, ChatConnection>();
// Store post-specific connections
const postConnections = new Map<string, PostConnection>();

// Create HTTP server for the WebSocket server to attach to
const wsHttpServer = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("WebSocket server running");
});

// Create a WebSocket server attached to the HTTP server
const wss = new WebSocketServer({
  server: wsHttpServer,
  perMessageDeflate: false,
  clientTracking: true,
});

// Create Hono app for the API endpoints
const app = new Hono();

// Helper function to get agency unique ID from user ID
async function getAgencyUniqueId(userId: string): Promise<string | null> {
  try {
    const agencyData = await db.query.agencies.findFirst({
      where: eq(agencies.userId, userId),
      columns: { agencyUniqueId: true },
    });

    return agencyData?.agencyUniqueId || null;
  } catch (error) {
    console.error("Error fetching agency unique ID:", error);
    return null;
  }
}

// Helper function to get agency user ID from unique ID
async function getAgencyUserIdFromUniqueId(
  uniqueId: string
): Promise<string | null> {
  try {
    const agencyData = await db.query.agencies.findFirst({
      where: eq(agencies.agencyUniqueId, uniqueId),
      columns: { userId: true },
    });

    return agencyData?.userId || null;
  } catch (error) {
    console.error("Error fetching agency user ID:", error);
    return null;
  }
}

// Handle WebSocket connection
wss.on("connection", async (ws: WSWebSocket, req) => {
  console.log("New WebSocket connection received");

  try {
    // Extract query parameters from URL
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    console.log("Connection URL:", url.toString());

    const sessionToken = url.searchParams.get("token");
    const userId = url.searchParams.get("userId");
    const postId = url.searchParams.get("postId");
    const postType = url.searchParams.get("postType") as
      | "trip"
      | "car"
      | "hotel"
      | "room";
    const customerId = url.searchParams.get("customerId"); // Extract customerId if provided

    console.log("Received connection request:", {
      userId,
      postId,
      postType,
      hasCustomerId: !!customerId,
    });

    // Send a welcome message to confirm connection
    ws.send(
      JSON.stringify({
        type: "connection",
        data: {
          status: "connected",
          message: "WebSocket connection established",
          time: new Date().toISOString(),
        },
      })
    );

    // Validate session
    if (!userId || !postId || !postType) {
      console.error("Invalid connection parameters:", {
        userId,
        postId,
        postType,
      });
      ws.send(
        JSON.stringify({
          type: "error",
          data: { error: "Invalid connection parameters" },
        })
      );
      ws.close();
      return;
    }

    // For development mode, just trust the user ID
    // In production, you would verify the token
    const sessionValidation = {
      valid: true,
      role: userId.includes("agency") ? "agency owner" : "customer",
      agencyId: userId.includes("agency") ? userId : undefined,
    };

    if (!sessionValidation.valid) {
      ws.send(
        JSON.stringify({
          type: "error",
          data: { error: "Authentication failed" },
        })
      );
      ws.close();
      return;
    }

    const userRole = sessionValidation.role as "customer" | "agency owner";
    const agencyId = sessionValidation.agencyId;

    console.log("User authenticated:", { userId, userRole });

    // Create connection object
    const connection: ChatConnection = {
      userId,
      socket: ws as unknown as WebSocket, // Type assertion for compatibility
      userRole,
      agencyId,
    };

    // Store connection by user ID
    connections.set(userId, connection);

    // Handle post-specific connection
    const postConnectionKey = `${postType}:${postId}`;
    let postConnection = postConnections.get(postConnectionKey);

    if (!postConnection) {
      postConnection = {
        postId,
        postType,
      };
      postConnections.set(postConnectionKey, postConnection);
    }

    // Associate user with post connection based on role
    if (userRole === "agency owner") {
      postConnection.agencyConnection = connection;
    } else {
      postConnection.customerConnection = connection;
    }

    // Load and send previous messages history
    try {
      let result;
      if (customerId) {
        console.log(
          `Fetching messages for post ${postId} filtered by customer ${customerId}`
        );
        // Get messages for this specific customer conversation
        const allMessages = await getChatMessages(postId, postType, userId);
        if (allMessages.success && allMessages.messages) {
          // Filter messages to only include those between the user and the specified customer
          const filteredMessages = allMessages.messages.filter(
            (msg) =>
              (msg.senderId === customerId || msg.receiverId === customerId) &&
              (msg.senderId === userId || msg.receiverId === userId)
          );
          result = { success: true, messages: filteredMessages };
        } else {
          result = { success: false, error: "Failed to fetch messages" };
        }
      } else {
        // Get all messages for this post without filtering
        result = await getChatMessages(postId, postType, userId);
      }

      if (result.success && result.messages && result.messages.length > 0) {
        console.log(
          `Sending ${result.messages.length} historical messages to user ${userId}`
        );

        ws.send(
          JSON.stringify({
            type: "history",
            messages: result.messages,
          })
        );
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
    }

    // Send confirmation
    ws.send(
      JSON.stringify({
        type: "connection",
        data: { postId, postType },
      })
    );

    // Handle messages
    ws.on("message", async (message) => {
      try {
        console.log("Received message:", message.toString());

        const parsedMessage = JSON.parse(message.toString());

        if (parsedMessage.type === "message") {
          // Extract message data - could be nested in data or directly in the message
          const chatMessage = parsedMessage.data || parsedMessage;

          console.log("Processing chat message:", chatMessage);

          // Validate message
          if (!chatMessage.content) {
            ws.send(
              JSON.stringify({
                type: "error",
                data: { error: "Message content is required" },
              })
            );
            return;
          }

          // Use postId and postType from the connection if not in the message
          const messagePostId = chatMessage.postId || postId;
          const messagePostType = chatMessage.postType || postType;
          // Use customerId if provided in the message or in the connection
          const messageCustomerId = chatMessage.customerId || customerId;
          // Get the tempId if provided to enable client-side message replacement
          const tempId = chatMessage.tempId;

          // Create a complete message with all required fields
          const completeMessage: ChatMessage = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            content: chatMessage.content,
            postId: messagePostId,
            postType: messagePostType,
            senderId: userId,
            receiverId: "", // Will be set below
            sender: "user",
            type: "text",
            createdAt: new Date().toISOString(),
            isRead: false,
            tempId: tempId, // Include the tempId from the client for message replacement
          };

          // Find the post connection
          const postConnectionKey = `${messagePostType}:${messagePostId}`;
          const postConnection = postConnections.get(postConnectionKey);

          if (!postConnection) {
            console.log("No post connection found for key:", postConnectionKey);
            // Cannot proceed without knowing the recipient
            ws.send(
              JSON.stringify({
                type: "error",
                data: { error: "Cannot find recipient for this message" },
              })
            );
            return;
          }

          // Determine if sender is from an agency (has agencyId)
          const senderAgencyUniqueId = await getAgencyUniqueId(userId);
          const isSenderFromAgency = !!senderAgencyUniqueId;

          // Determine recipient based on sender type
          let recipientId = "";
          let recipientConnection: ChatConnection | undefined;

          // If customerId is provided, use it as the recipient when sending from agency
          if (isSenderFromAgency && messageCustomerId) {
            recipientId = messageCustomerId;
            console.log("Using provided customerId as recipient:", recipientId);
            
            // Try to find the customer's active connection
            recipientConnection = connections.get(recipientId);
          } else if (isSenderFromAgency) {
            // Reset recipientId to ensure we're not using a stale value
            recipientId = "";

            // First priority: Check message history to find the original customer
            try {
              // Get complete message history for this conversation
              console.log(
                "Looking for customer in message history for:",
                messagePostId,
                messagePostType
              );
              const history = await getChatMessages(
                messagePostId,
                messagePostType,
                userId
              );

              if (
                history.success &&
                history.messages &&
                history.messages.length > 0
              ) {
                // Sort messages by creation date (oldest first) to find the conversation starter
                const sortedMessages = [...history.messages].sort(
                  (a, b) =>
                    new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime()
                );

                console.log(
                  `Found ${sortedMessages.length} messages in history to search for customer`
                );

                // APPROACH 1: Find the initiator of the conversation (usually the customer)
                const firstMessage = sortedMessages[0];
                if (firstMessage && firstMessage.senderId !== userId) {
                  recipientId = firstMessage.senderId;
                  console.log(
                    "Found conversation initiator as recipient:",
                    recipientId
                  );
                  
                  // Try to find the customer's connection
                  recipientConnection = connections.get(recipientId);
                }

                // If we didn't find a valid recipient yet, try another approach
                if (!recipientId || recipientId === userId) {
                  // APPROACH 2: Find any message from a non-agency user
                  const customerMessage = sortedMessages.find((msg) => {
                    return (
                      msg.senderId !== userId &&
                      !msg.senderId.includes("agency")
                    );
                  });

                  if (customerMessage) {
                    recipientId = customerMessage.senderId;
                    console.log(
                      "Found customer sender as recipient:",
                      recipientId
                    );
                    
                    // Try to find the customer's connection
                    recipientConnection = connections.get(recipientId);
                  }
                }

                // If we still don't have a recipient, try a third approach
                if (!recipientId || recipientId === userId) {
                  // APPROACH 3: Find any message where this agency was the recipient
                  const receivedMessage = sortedMessages.find(
                    (msg) =>
                      msg.receiverId === userId && msg.senderId !== userId
                  );

                  if (receivedMessage) {
                    recipientId = receivedMessage.senderId;
                    console.log(
                      "Found customer from received message:",
                      recipientId
                    );
                    
                    // Try to find the customer's connection
                    recipientConnection = connections.get(recipientId);
                  }
                }
              }
            } catch (error) {
              console.error("Error finding customer from history:", error);
            }

            // Second priority: Try the active connection if history search failed
            if (!recipientId || recipientId === userId) {
              if (postConnection.customerConnection) {
                recipientId = postConnection.customerConnection.userId;
                recipientConnection = postConnection.customerConnection;
                console.log("Using active customer connection:", recipientId);
              }
            }

            // Final validation - NEVER send a message to ourselves
            if (!recipientId || recipientId === userId) {
              console.error(
                "WARNING: Failed to find valid recipient - preventing self-message"
              );
              ws.send(
                JSON.stringify({
                  type: "error",
                  data: {
                    error: "Could not determine the recipient for your message",
                  },
                })
              );
              return; // Abort the message send
            }
          } else {
            // Sender is a customer - get the customerId from the sender
            // This ensures the agency knows which customer sent the message
            completeMessage.customerId = userId;

            // Send to the agency that owns this listing
            try {
              // Look up the agency ID from the database based on the postType and postId
              let agencyIdForPost = "";

              if (messagePostType === "trip") {
                const trip = await db.query.trips.findFirst({
                  where: eq(trips.id, parseInt(messagePostId)),
                  columns: { agencyId: true },
                });
                agencyIdForPost = trip?.agencyId || "";
              } else if (messagePostType === "car") {
                const car = await db.query.cars.findFirst({
                  where: eq(cars.id, parseInt(messagePostId)),
                  columns: { agencyId: true },
                });
                agencyIdForPost = car?.agencyId || "";
              } else if (messagePostType === "hotel") {
                const hotelData = await db.query.hotel.findFirst({
                  where: eq(hotel.id, messagePostId),
                  columns: { agencyId: true },
                });
                agencyIdForPost = hotelData?.agencyId || "";
              } else if (messagePostType === "room") {
                // For rooms, find the hotel first, then get the agency
                const roomData = await db.query.room.findFirst({
                  where: eq(room.id, messagePostId),
                  columns: { hotelId: true },
                });

                if (roomData?.hotelId) {
                  const hotelData = await db.query.hotel.findFirst({
                    where: eq(hotel.id, roomData.hotelId),
                    columns: { agencyId: true },
                  });
                  agencyIdForPost = hotelData?.agencyId || "";
                }
              }

              if (agencyIdForPost) {
                // Get the agency's unique ID for logic purposes
                const agencyUniqueId = await getAgencyUniqueId(agencyIdForPost);

                if (agencyUniqueId) {
                  // Log that we're using agency unique ID for routing
                  console.log(
                    "Using agency unique ID for routing:",
                    agencyUniqueId
                  );
                  // But use the agency's userId as the actual receiverId in the database
                  recipientId = agencyIdForPost;
                  
                  // Try to find the agency's connection
                  recipientConnection = connections.get(agencyIdForPost);
                } else {
                  // Fallback to the agency's user ID if unique ID not found
                  recipientId = agencyIdForPost;
                  
                  // Try to find the agency's connection
                  recipientConnection = connections.get(agencyIdForPost);
                }
              } else {
                // Fallback to the connected agency
                recipientConnection = postConnection.agencyConnection;
                recipientId = postConnection.agencyConnection?.userId || "";
              }
            } catch (error) {
              console.error("Error finding agency for post:", error);
              // Fallback to the connected agency
              recipientConnection = postConnection.agencyConnection;
              recipientId = postConnection.agencyConnection?.userId || "";
            }
          }

          // Validate recipient ID
          if (!recipientId) {
            console.error("No valid recipient found:", {
              isSenderFromAgency,
              hasAgencyConnection: !!postConnection.agencyConnection,
              hasCustomerConnection: !!postConnection.customerConnection,
              postId,
              postType,
              userId,
            });

            // Try to create a fallback based on the post information
            try {
              if (!isSenderFromAgency) {
                // For a customer sending a message, try to find the correct agency from database
                if (messagePostType === "trip") {
                  const trip = await db.query.trips.findFirst({
                    where: eq(trips.id, parseInt(messagePostId)),
                    columns: { agencyId: true },
                  });
                  if (trip?.agencyId) {
                    // We found the agency, use its user ID for the receiverId
                    recipientId = trip.agencyId;
                    // But log that we're using the unique ID for routing purposes
                    const agencyUniqueId = await getAgencyUniqueId(
                      trip.agencyId
                    );
                    if (agencyUniqueId) {
                      console.log(
                        "Using agency unique ID for routing:",
                        agencyUniqueId
                      );
                    }
                    
                    // Try to find the agency's connection
                    recipientConnection = connections.get(trip.agencyId);
                  }
                } else if (messagePostType === "car") {
                  const car = await db.query.cars.findFirst({
                    where: eq(cars.id, parseInt(messagePostId)),
                    columns: { agencyId: true },
                  });
                  if (car?.agencyId) {
                    // We found the agency, use its user ID for the receiverId
                    recipientId = car.agencyId;
                    // But log that we're using the unique ID for routing purposes
                    const agencyUniqueId = await getAgencyUniqueId(
                      car.agencyId
                    );
                    if (agencyUniqueId) {
                      console.log(
                        "Using agency unique ID for routing:",
                        agencyUniqueId
                      );
                    }
                    
                    // Try to find the agency's connection
                    recipientConnection = connections.get(car.agencyId);
                  }
                } else if (messagePostType === "hotel") {
                  const hotelData = await db.query.hotel.findFirst({
                    where: eq(hotel.id, messagePostId),
                    columns: { agencyId: true },
                  });
                  if (hotelData?.agencyId) {
                    // We found the agency, use its user ID for the receiverId
                    recipientId = hotelData.agencyId;
                    // But log that we're using the unique ID for routing purposes
                    const agencyUniqueId = await getAgencyUniqueId(
                      hotelData.agencyId
                    );
                    if (agencyUniqueId) {
                      console.log(
                        "Using agency unique ID for routing:",
                        agencyUniqueId
                      );
                    }
                    
                    // Try to find the agency's connection
                    recipientConnection = connections.get(hotelData.agencyId);
                  }
                } else if (messagePostType === "room") {
                  // For rooms, find the hotel first, then get the agency
                  const roomData = await db.query.room.findFirst({
                    where: eq(room.id, messagePostId),
                    columns: { hotelId: true },
                  });

                  if (roomData?.hotelId) {
                    const hotelData = await db.query.hotel.findFirst({
                      where: eq(hotel.id, roomData.hotelId),
                      columns: { agencyId: true },
                    });
                    if (hotelData?.agencyId) {
                      // We found the agency, use its user ID for the receiverId
                      recipientId = hotelData.agencyId;
                      // But log that we're using the unique ID for routing purposes
                      const agencyUniqueId = await getAgencyUniqueId(
                        hotelData.agencyId
                      );
                      if (agencyUniqueId) {
                        console.log(
                          "Using agency unique ID for routing:",
                          agencyUniqueId
                        );
                      }
                      
                      // Try to find the agency's connection
                      recipientConnection = connections.get(hotelData.agencyId);
                    }
                  }
                }

                // If still no recipient, use a fallback pattern that makes debugging easier
                if (!recipientId) {
                  recipientId = `unknown_agency_for_${messagePostType}_${messagePostId}`;
                  console.log("Using generic fallback agency ID:", recipientId);
                }
              } else {
                // For agency sending to customer, try to find a customer from message history
                try {
                  // Look for the first message in this conversation from a non-agency user
                  const history = await getChatMessages(
                    messagePostId,
                    messagePostType,
                    userId
                  );
                  if (
                    history.success &&
                    history.messages &&
                    history.messages.length > 0
                  ) {
                    // Find the first customer message in this conversation
                    const customerMessage = history.messages.find((msg) => {
                      // A customer won't have an agency unique ID in sender or receiver
                      return (
                        !msg.senderId.includes("agency") &&
                        msg.senderId !== userId
                      );
                    });

                    if (customerMessage) {
                      recipientId = customerMessage.senderId;
                      console.log(
                        "Found customer recipient from message history:",
                        recipientId
                      );
                      
                      // Try to find the customer's connection
                      recipientConnection = connections.get(customerMessage.senderId);
                    } else {
                      recipientId = `unknown_customer_for_${messagePostType}_${messagePostId}`;
                    }
                  }
                } catch (error) {
                  console.error("Error finding customer from history:", error);
                  recipientId = `unknown_customer_for_${messagePostType}_${messagePostId}`;
                }
              }
            } catch (error) {
              console.error("Error in fallback recipient search:", error);
              // Last resort fallback
              recipientId = isSenderFromAgency
                ? `fallback_customer_${Date.now()}`
                : `fallback_agency_${Date.now()}`;
            }

            ws.send(
              JSON.stringify({
                type: "warning",
                data: {
                  warning:
                    "Recipient not found. Message will be stored but might not be delivered immediately.",
                },
              })
            );
          }

          // Set the recipient ID
          completeMessage.receiverId = recipientId;

          console.log("Saving message with recipient:", recipientId);

          // Save message to database
          const saveResult = await saveMessageToDatabase(completeMessage);

          if (!saveResult.success) {
            console.error(
              "Failed to save message to database:",
              saveResult.error
            );
            ws.send(
              JSON.stringify({
                type: "error",
                data: { error: "Failed to save message" },
              })
            );
            return;
          }

          // Use the saved message with DB ID
          const savedMessage = saveResult.message;

          // Ensure tempId is preserved for client-side message replacement
          if (tempId && savedMessage) {
            (savedMessage as any).tempId = tempId;
          }

          // Send message to recipient if connected
          if (recipientConnection) {
            const recipientSocket =
              recipientConnection.socket as unknown as WSWebSocket;
            if (recipientSocket.readyState === WSWebSocket.OPEN) {
              console.log("Sending message to recipient:", recipientId);
              recipientSocket.send(
                JSON.stringify({
                  type: "message",
                  data: savedMessage,
                })
              );
            } else {
              console.log("Recipient socket not open:", recipientId, recipientSocket.readyState);
            }
          } else {
            console.log("Recipient not connected:", recipientId);
          }

          // Also send confirmation back to sender
          ws.send(
            JSON.stringify({
              type: "message",
              data: savedMessage,
            })
          );
        } else if (parsedMessage.type === "markAsRead") {
          // Handle read receipts
          if (parsedMessage.messageId) {
            // Update the database - mark message as read
            // This is just a stub - implement actual marking as read
            console.log("Marking message as read:", parsedMessage.messageId);
            
            // Notify both sender and recipient about the read status
            // Find the message's sender and recipient
            // This is simplified - you would look up the message in the database
            
            // Broadcast the read status to relevant connections
            // This is just a placeholder for the concept
          }
        }
      } catch (error) {
        console.error("Error processing message:", error);
        ws.send(
          JSON.stringify({
            type: "error",
            data: { error: "Failed to process message" },
          })
        );
      }
    });

    // Handle disconnect
    ws.on("close", () => {
      console.log("WebSocket connection closed for user:", userId);
      connections.delete(userId);

      // Update post connection
      if (postConnection) {
        if (userRole === "agency owner") {
          postConnection.agencyConnection = undefined;
        } else {
          postConnection.customerConnection = undefined;
        }

        // Remove post connection if no users connected
        if (
          !postConnection.agencyConnection &&
          !postConnection.customerConnection
        ) {
          postConnections.delete(postConnectionKey);
        }
      }
    });
  } catch (error) {
    console.error("Error handling WebSocket connection:", error);
    ws.close();
  }
});

// WebSocket server error handling
wss.on("error", (error) => {
  console.error("WebSocket server error:", error);
});

// Helper function to save message to database
async function saveMessageToDatabase(message: ChatMessage) {
  try {
    // Use the server action to save the message to the database
    const result = await saveChatMessage(message);
    console.log("Message saved to database:", result);
    return result;
  } catch (error) {
    console.error("Error saving message:", error);
    return {
      success: false,
      error: "Failed to save message to database",
    };
  }
}

// Create HTTP API server
app.get("/", (c) => {
  return c.text(
    "Chat API server is running. WebSocket server is available on ws://localhost:3001"
  );
});

// Create and start the servers
const startServers = () => {
  // Start WebSocket HTTP server
  wsHttpServer.listen(3001, () => {
    console.log("WebSocket server listening on port 3001");
  });

  // Start API HTTP server
  const apiServer = serve({
    fetch: app.fetch,
    port: 3002,
  });

  console.log("API server listening on port 3002");

  // Handle shutdown
  process.on("SIGINT", () => {
    console.log("Shutting down servers...");
    wsHttpServer.close();
    apiServer.close();
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    console.log("Shutting down servers...");
    wsHttpServer.close();
    apiServer.close();
    process.exit(0);
  });

  return { wsHttpServer, apiServer };
};

export { startServers };
