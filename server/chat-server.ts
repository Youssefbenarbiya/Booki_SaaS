/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Hono } from "hono"
import { serve } from "@hono/node-server"
import { cors } from "hono/cors"
import { WebSocketServer, WebSocket as WSWebSocket } from "ws"
import http from "http"
import { ChatMessage, ChatConnection, PostConnection } from "../lib/types/chat"
import { eq, and, or } from "drizzle-orm"
import * as dotenv from 'dotenv'
import db from "./db/drizzle"
// Import your schema
import { trips, cars, hotel, room, agencies } from "../db/schema"

// Load environment variables from .env file
dotenv.config()

// Import real database models and schema needed for the chat server
// These implement the database operations needed for the chat features

// Helper functions for chat operations
async function saveChatMessage(message: any) {
  try {
    console.log("Saving chat message to database:", message);
    
    // Actual database operation to save the message
    try {
      // For simplicity, use direct SQL query since we don't have the chatMessages schema here
      const { sql } = await import('./db/drizzle');
      
      const result = await sql`
        INSERT INTO chat_messages (
          post_id, post_type, sender_id, receiver_id, 
          content, type, is_read, customer_id
        )
        VALUES (
          ${message.postId}, ${message.postType}, ${message.senderId}, 
          ${message.receiverId}, ${message.content}, ${message.type || 'text'}, 
          ${!!message.isRead}, ${message.customerId || null}
        )
        RETURNING *
      `;
      
      if (result && result[0]) {
        // Convert database record to chat message format
        const savedMessage = {
          id: result[0].id,
          postId: result[0].post_id,
          postType: result[0].post_type,
          senderId: result[0].sender_id,
          receiverId: result[0].receiver_id,
          content: result[0].content,
          type: result[0].type,
          isRead: result[0].is_read,
          createdAt: result[0].created_at,
          customerId: result[0].customer_id
        };
        
        return { success: true, message: savedMessage };
      }
      
      throw new Error("Failed to save message");
    } catch (dbError) {
      console.error("Database error saving message:", dbError);
      
      // Fallback to mock response if database operation fails
      const savedMessage = {
        ...message,
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        createdAt: new Date().toISOString()
      };
      
      return { success: true, message: savedMessage };
    }
  } catch (error) {
    console.error("Error saving chat message:", error);
    return { success: false, error: "Failed to save message" };
  }
}

async function getChatMessages(postId: string, postType: string, userId: string) {
  try {
    console.log("Getting chat messages for:", { postId, postType, userId });
    
    // Actual database query to get messages
    try {
      const { sql } = await import('./db/drizzle');
      
      const messages = await sql`
        SELECT * FROM chat_messages 
        WHERE post_id = ${postId} AND post_type = ${postType}
        AND (sender_id = ${userId} OR receiver_id = ${userId})
        ORDER BY created_at DESC
      `;
      
      // Convert database records to chat message format
      const formattedMessages = messages.map(msg => ({
        id: msg.id,
        postId: msg.post_id,
        postType: msg.post_type,
        senderId: msg.sender_id,
        receiverId: msg.receiver_id,
        content: msg.content,
        type: msg.type,
        isRead: msg.is_read,
        createdAt: msg.created_at,
        customerId: msg.customer_id
      }));
      
      return { success: true, messages: formattedMessages };
    } catch (dbError) {
      console.error("Database error getting messages:", dbError);
      // Fallback to empty array if database operation fails
      return { success: true, messages: [] };
    }
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return { success: false, error: "Failed to fetch messages" };
  }
}

// Store active connections
const connections = new Map<string, ChatConnection>()
// Store post-specific connections
const postConnections = new Map<string, PostConnection>()

// Helper function to get agency unique ID from user ID
async function getAgencyUniqueId(userId: string): Promise<string | null> {
  try {
    // Query the agencies table to find the agency's unique ID
    const agencyData = await db.query.agencies.findFirst({
      where: eq(agencies.userId, userId),
      columns: { agencyUniqueId: true },
    })
    
    return agencyData?.agencyUniqueId || null
  } catch (error) {
    console.error("Error fetching agency unique ID:", error)
    return null
  }
}

// Helper function to save message to database
async function saveMessageToDatabase(message: ChatMessage) {
  try {
    // Extract the tempId before saving (it shouldn't go in the database)
    const { tempId, _isPending, ...messageToSave } = message as any

    // Use the server action to save the message to the database
    const result = await saveChatMessage(messageToSave)
    console.log("Message saved to database:", result)

    // Add back the tempId to the result message for client-side message replacement
    if (result.success && result.message && tempId) {
      ;(result.message as any).tempId = tempId
    }

    return result
  } catch (error) {
    console.error("Error saving message:", error)
    return {
      success: false,
      error: "Failed to save message to database",
    }
  }
}

// Create and start the servers
interface ServerOptions {
  wsPort: number;
  httpPort: number;
}

const startServers = (options: ServerOptions = { wsPort: 3001, httpPort: 3002 }) => {
  const { wsPort, httpPort } = options;
  
  // Create HTTP server for the WebSocket server to attach to
  const wsHttpServer = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" })
    res.end("WebSocket server running")
  })

  // Create a WebSocket server attached to the HTTP server
  const wss = new WebSocketServer({
    server: wsHttpServer,
    perMessageDeflate: false,
    clientTracking: true,
  })

  // Create Hono app for the API endpoints
  const app = new Hono()
  
  // Add CORS support
  app.use('/*', cors({
    origin: '*', // In production, change this to your specific frontend URLs
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    exposeHeaders: ['Content-Length', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400,
  }))

  // Handle WebSocket connection
  wss.on("connection", async (ws: WSWebSocket, req) => {
    console.log("New WebSocket connection received")

    try {
      // Extract query parameters from URL
      const url = new URL(req.url || "", `http://${req.headers.host}`)
      console.log("Connection URL:", url.toString())

      const userId = url.searchParams.get("userId")
      const postId = url.searchParams.get("postId")
      const postType = url.searchParams.get("postType") as
        | "trip"
        | "car"
        | "hotel"
        | "room"
      const customerId = url.searchParams.get("customerId") // Extract customerId if provided

      console.log("Received connection request:", {
        userId,
        postId,
        postType,
        hasCustomerId: !!customerId,
      })

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
      )

      // Validate session
      if (!userId || !postId || !postType) {
        console.error("Invalid connection parameters:", {
          userId,
          postId,
          postType,
        })
        ws.send(
          JSON.stringify({
            type: "error",
            data: { error: "Invalid connection parameters" },
          })
        )
        ws.close()
        return
      }

      // For development mode, just trust the user ID
      // In production, you would verify the token
      const sessionValidation = {
        valid: true,
        role: userId.includes("agency") ? "agency owner" : "customer",
        agencyId: userId.includes("agency") ? userId : undefined,
      }

      if (!sessionValidation.valid) {
        ws.send(
          JSON.stringify({
            type: "error",
            data: { error: "Authentication failed" },
          })
        )
        ws.close()
        return
      }

      const userRole = sessionValidation.role as "customer" | "agency owner"
      const agencyId = sessionValidation.agencyId

      console.log("User authenticated:", { userId, userRole })

      // Create connection object
      const connection: ChatConnection = {
        userId,
        socket: ws as unknown as WebSocket, // Type assertion for compatibility
        userRole,
        agencyId,
      }

      // Store connection by user ID
      connections.set(userId, connection)

      // Handle post-specific connection
      const postConnectionKey = `${postType}:${postId}`
      let postConnection = postConnections.get(postConnectionKey)

      if (!postConnection) {
        postConnection = {
          postId,
          postType,
        }
        postConnections.set(postConnectionKey, postConnection)
      }

      // Associate user with post connection based on role
      if (userRole === "agency owner") {
        postConnection.agencyConnection = connection
      } else {
        postConnection.customerConnection = connection
      }

      // Load and send previous messages history
      try {
        let result
        if (customerId) {
          console.log(
            `Fetching messages for post ${postId} filtered by customer ${customerId}`
          )
          // Get messages for this specific customer conversation
          const allMessages = await getChatMessages(postId, postType, userId)
          if (allMessages.success && allMessages.messages) {
            // Filter messages to only include those between the user and the specified customer
            const filteredMessages = allMessages.messages.filter(
              (msg) =>
                (msg.senderId === customerId || msg.receiverId === customerId) &&
                (msg.senderId === userId || msg.receiverId === userId)
            )
            result = { success: true, messages: filteredMessages }
          } else {
            result = { success: false, error: "Failed to fetch messages" }
          }
        } else {
          // Get all messages for this post without filtering
          result = await getChatMessages(postId, postType, userId)
        }

        if (result.success && result.messages && result.messages.length > 0) {
          console.log(
            `Sending ${result.messages.length} historical messages to user ${userId}`
          )

          ws.send(
            JSON.stringify({
              type: "history",
              messages: result.messages,
            })
          )
        }
      } catch (error) {
        console.error("Error loading chat history:", error)
      }

      // Send confirmation
      ws.send(
        JSON.stringify({
          type: "connection",
          data: { postId, postType },
        })
      )

      // Handle messages
      ws.on("message", async (message) => {
        try {
          console.log("Received message:", message.toString())

          const parsedMessage = JSON.parse(message.toString())

          if (parsedMessage.type === "message") {
            // Extract message data - could be nested in data or directly in the message
            const chatMessage = parsedMessage.data || parsedMessage

            console.log("Processing chat message:", chatMessage)

            // Validate message
            if (!chatMessage.content) {
              ws.send(
                JSON.stringify({
                  type: "error",
                  data: { error: "Message content is required" },
                })
              )
              return
            }

            // Use postId and postType from the connection if not in the message
            const messagePostId = chatMessage.postId || postId
            const messagePostType = chatMessage.postType || postType
            // Use customerId if provided in the message or in the connection
            const messageCustomerId = chatMessage.customerId || customerId
            // Get the tempId if provided to enable client-side message replacement
            const tempId = chatMessage.tempId
            // Get userId from the message or from the connection parameters
            const messageSenderId = chatMessage.userId || userId

            // Create a complete message with all required fields
            const completeMessage: ChatMessage = {
              id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              content: chatMessage.content,
              postId: messagePostId,
              postType: messagePostType,
              senderId: messageSenderId,
              receiverId: "", // Will be set below
              sender: "user",
              type: "text",
              createdAt: new Date().toISOString(),
              isRead: false,
              tempId: tempId, // Include the tempId from the client for message replacement
              customerId: messageCustomerId, // Include customerId if provided
            }

            // Find the post connection
            const postConnectionKey = `${messagePostType}:${messagePostId}`
            const postConnection = postConnections.get(postConnectionKey)

            if (!postConnection) {
              console.log("No post connection found for key:", postConnectionKey)
              // Cannot proceed without knowing the recipient
              ws.send(
                JSON.stringify({
                  type: "error",
                  data: { error: "Cannot find recipient for this message" },
                })
              )
              return
            }

            // Determine if sender is from an agency (has agencyId)
            const senderAgencyUniqueId = await getAgencyUniqueId(userId)
            const isSenderFromAgency = !!senderAgencyUniqueId || userRole === "agency owner"

            // Determine recipient based on sender type
            let recipientId = ""
            let recipientConnection: ChatConnection | undefined

            if (isSenderFromAgency) {
              // AGENCY SENDING MESSAGE TO CUSTOMER
              
              // If customerId is explicitly provided, use it as the recipient
              if (messageCustomerId) {
                recipientId = messageCustomerId
                console.log("Using provided customerId as recipient:", recipientId)
                
                // Try to find the customer's active connection
                recipientConnection = connections.get(recipientId)
              } else {
                // No customerId provided - we need to find the customer from message history
                console.log("No customerId provided, searching message history")
                
                try {
                  // Get complete message history for this conversation
                  const history = await getChatMessages(
                    messagePostId,
                    messagePostType,
                    userId
                  )

                  if (history.success && history.messages && history.messages.length > 0) {
                    // Sort messages by creation date (oldest first) to find the conversation starter
                    const sortedMessages = [...history.messages].sort(
                      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                    )

                    console.log(`Found ${sortedMessages.length} messages in history to search for customer`)

                    // Try multiple approaches to find the customer
                    let customerFound = false
                    
                    // Look for the customerId field in messages first - this is the most reliable
                    const messageWithCustomerId = sortedMessages.find(msg => msg.customerId && msg.customerId !== userId)
                    
                    if (messageWithCustomerId?.customerId) {
                      recipientId = messageWithCustomerId.customerId
                      customerFound = true
                      console.log("Found customer from customerId field:", recipientId)
                    }
                    
                    // If no customer found yet, try to find the conversation initiator
                    if (!customerFound) {
                      const firstMessage = sortedMessages[0]
                      if (firstMessage && firstMessage.senderId !== userId && !firstMessage.senderId.includes("agency")) {
                        recipientId = firstMessage.senderId
                        customerFound = true
                        console.log("Found conversation initiator as recipient:", recipientId)
                      }
                    }
                    
                    // If still no customer found, try to find any message from a non-agency user
                    if (!customerFound) {
                      const customerMessage = sortedMessages.find(msg => 
                        msg.senderId !== userId && !msg.senderId.includes("agency")
                      )
                      
                      if (customerMessage) {
                        recipientId = customerMessage.senderId
                        customerFound = true
                        console.log("Found customer sender as recipient:", recipientId)
                      }
                    }
                    
                    // If still no customer found, try to find a message sent to a customer
                    if (!customerFound) {
                      const sentToCustomer = sortedMessages.find(msg => 
                        msg.senderId === userId && 
                        msg.receiverId !== userId && 
                        !msg.receiverId.includes("agency")
                      )
                      
                      if (sentToCustomer) {
                        recipientId = sentToCustomer.receiverId
                        customerFound = true
                        console.log("Found previous message to customer:", recipientId)
                      }
                    }
                    
                    // Try to find the customer's connection if we found a recipient
                    if (customerFound) {
                      recipientConnection = connections.get(recipientId)
                    }
                  }
                } catch (error) {
                  console.error("Error finding customer from history:", error)
                }
                
                // If still no recipient found, check active connections
                if (!recipientId || recipientId === userId) {
                  if (postConnection.customerConnection) {
                    recipientId = postConnection.customerConnection.userId
                    recipientConnection = postConnection.customerConnection
                    console.log("Using active customer connection:", recipientId)
                  }
                }
              }

              // Final validation - NEVER send a message to ourselves
              if (!recipientId || recipientId === userId || recipientId.includes("agency")) {
                console.error("WARNING: Failed to find valid recipient - preventing self-message")
                ws.send(
                  JSON.stringify({
                    type: "error",
                    data: {
                      error: "Could not determine the recipient for your message",
                    },
                  })
                )
                return // Abort the message send
              }
              
              // Set the customerId field to ensure we can track the conversation
              completeMessage.customerId = recipientId
            } else {
              // CUSTOMER SENDING MESSAGE TO AGENCY
              
              // Set the customerId field from the sender (customer's ID)
              completeMessage.customerId = userId

              // Find the agency that owns this listing
              try {
                // Look up the agency ID from the database based on the postType and postId
                let agencyIdForPost = ""

                if (messagePostType === "trip") {
                  const trip = await db.query.trips.findFirst({
                    where: eq(trips.id, parseInt(messagePostId)),
                    columns: { agencyId: true },
                  })
                  agencyIdForPost = trip?.agencyId || ""
                } else if (messagePostType === "car") {
                  const car = await db.query.cars.findFirst({
                    where: eq(cars.id, parseInt(messagePostId)),
                    columns: { agencyId: true },
                  })
                  agencyIdForPost = car?.agencyId || ""
                } else if (messagePostType === "hotel") {
                  const hotelData = await db.query.hotel.findFirst({
                    where: eq(hotel.id, messagePostId),
                    columns: { agencyId: true },
                  })
                  agencyIdForPost = hotelData?.agencyId || ""
                } else if (messagePostType === "room") {
                  // For rooms, find the hotel first, then get the agency
                  const roomData = await db.query.room.findFirst({
                    where: eq(room.id, messagePostId),
                    columns: { hotelId: true },
                  })

                  if (roomData?.hotelId) {
                    const hotelData = await db.query.hotel.findFirst({
                      where: eq(hotel.id, roomData.hotelId),
                      columns: { agencyId: true },
                    })
                    agencyIdForPost = hotelData?.agencyId || ""
                  }
                }

                if (agencyIdForPost) {
                  recipientId = agencyIdForPost
                  // Try to find the agency's connection
                  recipientConnection = connections.get(agencyIdForPost)
                } else {
                  // Fallback to the connected agency
                  recipientId = postConnection.agencyConnection?.userId || ""
                  recipientConnection = postConnection.agencyConnection
                }
              } catch (error) {
                console.error("Error finding agency for post:", error)
                // Fallback to the connected agency
                recipientId = postConnection.agencyConnection?.userId || ""
                recipientConnection = postConnection.agencyConnection
              }
            }

            // Final validation for recipient ID
            if (!recipientId) {
              console.error("No valid recipient found:", {
                isSenderFromAgency,
                hasAgencyConnection: !!postConnection.agencyConnection,
                hasCustomerConnection: !!postConnection.customerConnection,
                postId,
                postType,
                userId,
              })

              ws.send(
                JSON.stringify({
                  type: "warning",
                  data: {
                    warning:
                      "Recipient not found. Message will be stored but might not be delivered immediately.",
                  },
                })
              )
              
              // Try fallback logic if absolutely needed
              if (isSenderFromAgency) {
                // Agency sending to customer, use a fallback placeholder
                recipientId = `unknown_customer_for_${messagePostType}_${messagePostId}`
              } else {
                // Customer sending to agency, use a fallback placeholder
                recipientId = `unknown_agency_for_${messagePostType}_${messagePostId}`
              }
            }

            // Set the recipient ID
            completeMessage.receiverId = recipientId

            console.log("Saving message with recipient:", recipientId)

            // Save message to database
            const saveResult = await saveMessageToDatabase(completeMessage)

            if (!saveResult.success) {
              console.error(
                "Failed to save message to database:",
                saveResult.error
              )
              ws.send(
                JSON.stringify({
                  type: "error",
                  data: { error: "Failed to save message" },
                })
              )
              return
            }

            // Use the saved message with DB ID
            const savedMessage = saveResult.message

            // Ensure tempId is preserved for client-side message replacement
            if (tempId && savedMessage) {
              ;(savedMessage as any).tempId = tempId
            }

            // Send message to recipient if connected
            if (recipientConnection) {
              const recipientSocket =
                recipientConnection.socket as unknown as WSWebSocket
              if (recipientSocket.readyState === WSWebSocket.OPEN) {
                console.log("Sending message to recipient:", recipientId)
                recipientSocket.send(
                  JSON.stringify({
                    type: "message",
                    data: savedMessage,
                  })
                )
              } else {
                console.log(
                  "Recipient socket not open:",
                  recipientId,
                  recipientSocket.readyState
                )
              }
            } else {
              console.log("Recipient not connected:", recipientId)
            }

            // Also send confirmation back to sender
            ws.send(
              JSON.stringify({
                type: "message",
                data: savedMessage,
              })
            )
          } else if (parsedMessage.type === "markAsRead") {
            // Handle read receipts
            if (parsedMessage.messageId) {
              // Update the database - mark message as read
              // This is just a stub - implement actual marking as read
              console.log("Marking message as read:", parsedMessage.messageId)

              // Notify both sender and recipient about the read status
              // Find the message's sender and recipient
              // This is simplified - you would look up the message in the database

              // Broadcast the read status to relevant connections
              // This is just a placeholder for the concept
            }
          }
        } catch (error) {
          console.error("Error processing message:", error)
          ws.send(
            JSON.stringify({
              type: "error",
              data: { error: "Failed to process message" },
            })
          )
        }
      })

      // Handle disconnect
      ws.on("close", () => {
        console.log("WebSocket connection closed for user:", userId)
        connections.delete(userId)

        // Update post connection
        if (postConnection) {
          if (userRole === "agency owner") {
            postConnection.agencyConnection = undefined
          } else {
            postConnection.customerConnection = undefined
          }

          // Remove post connection if no users connected
          if (
            !postConnection.agencyConnection &&
            !postConnection.customerConnection
          ) {
            postConnections.delete(postConnectionKey)
          }
        }
      })
    } catch (error) {
      console.error("Error handling WebSocket connection:", error)
      ws.close()
    }
  })

  // WebSocket server error handling
  wss.on("error", (error) => {
    console.error("WebSocket server error:", error)
  })

  // Create HTTP API server
  app.get("/", (c) => {
    return c.text(
      "Chat API server is running. WebSocket server is available."
    )
  })

  // Health check endpoint for Render
  app.get("/health", (c) => {
    return c.json({
      status: "ok",
      uptime: process.uptime(),
      timestamp: Date.now()
    })
  })

  // Start WebSocket HTTP server
  wsHttpServer.listen(wsPort, () => {
    console.log(`WebSocket server listening on port ${wsPort}`)
  })

  // Start API HTTP server
  const apiServer = serve({
    fetch: app.fetch,
    port: httpPort,
  })

  console.log(`API server listening on port ${httpPort}`)

  return { wsHttpServer, apiServer }
}

export { startServers }
