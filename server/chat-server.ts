import { Hono } from "hono"
import { serve } from "@hono/node-server"
import { WebSocketServer, WebSocket as WSWebSocket } from "ws"
import { 
  ChatMessage, 
  ChatConnection, 
  PostConnection, 
  WebSocketMessage 
} from "@/lib/types/chat"

// Store active connections
const connections = new Map<string, ChatConnection>()
// Store post-specific connections
const postConnections = new Map<string, PostConnection>()

// Create Hono app
const app = new Hono()

// Create WebSocket server with path options
const wss = new WebSocketServer({ 
  noServer: true,
  path: '/' // Accept connections at root path
})

// Handle WebSocket connection
wss.on("connection", async (ws: WSWebSocket, req) => {
  try {
    // Extract query parameters from URL
    const url = new URL(req.url || "", `http://${req.headers.host}`)
    console.log("Connection URL:", url.toString());
    
    const sessionToken = url.searchParams.get("token")
    const userId = url.searchParams.get("userId")
    const postId = url.searchParams.get("postId")
    const postType = url.searchParams.get("postType") as "trip" | "car" | "hotel" | "room"
    
    console.log("Received connection request:", {
      userId,
      postId,
      postType,
      hasToken: !!sessionToken,
      url: req.url,
      headers: req.headers
    })
    
    // Validate session
    if (!userId || !postId || !postType) {
      console.error("Invalid connection parameters:", { userId, postId, postType });
      ws.send(JSON.stringify({
        type: "error",
        data: { error: "Invalid connection parameters" }
      }))
      ws.close()
      return
    }
    
    // For development mode, just trust the user ID
    // In production, you would verify the token
    const sessionValidation = { 
      valid: true,
      role: userId.includes("agency") ? "agency" : "customer",
      agencyId: userId.includes("agency") ? userId : undefined
    }
    
    if (!sessionValidation.valid) {
      ws.send(JSON.stringify({
        type: "error",
        data: { error: "Authentication failed" }
      }))
      ws.close()
      return
    }
    
    const userRole = sessionValidation.role as "customer" | "agency"
    const agencyId = sessionValidation.agencyId
    
    console.log("User authenticated:", { userId, userRole })
    
    // Create connection object
    const connection: ChatConnection = {
      userId,
      socket: ws as unknown as WebSocket, // Type assertion for compatibility
      userRole,
      agencyId
    }
    
    // Store connection by user ID
    connections.set(userId, connection)
    
    // Handle post-specific connection
    const postConnectionKey = `${postType}:${postId}`
    let postConnection = postConnections.get(postConnectionKey)
    
    if (!postConnection) {
      postConnection = {
        postId,
        postType
      }
      postConnections.set(postConnectionKey, postConnection)
    }
    
    // Associate user with post connection based on role
    if (userRole === "agency") {
      postConnection.agencyConnection = connection
    } else {
      postConnection.customerConnection = connection
    }
    
    // Send confirmation
    ws.send(JSON.stringify({
      type: "connection",
      data: { postId, postType }
    }))
    
    // Handle messages
    ws.on("message", async (message) => {
      try {
        const parsedMessage = JSON.parse(message.toString()) as WebSocketMessage
        
        if (parsedMessage.type === "message") {
          const chatMessage = parsedMessage.data as ChatMessage
          
          // Validate message
          if (!chatMessage.postId || !chatMessage.content) {
            ws.send(JSON.stringify({
              type: "error",
              data: { error: "Invalid message format" }
            }))
            return
          }
          
          // Add sender information
          chatMessage.senderId = userId
          
          // Save message to database (implement this function)
          await saveMessageToDatabase(chatMessage)
          
          // Find the post connection
          const postConnectionKey = `${chatMessage.postType}:${chatMessage.postId}`
          const postConnection = postConnections.get(postConnectionKey)
          
          if (!postConnection) {
            return
          }
          
          // Determine recipient based on sender role
          let recipientConnection: ChatConnection | undefined
          
          if (userRole === "agency") {
            recipientConnection = postConnection.customerConnection
            chatMessage.receiverId = postConnection.customerConnection?.userId || ""
          } else {
            recipientConnection = postConnection.agencyConnection
            chatMessage.receiverId = postConnection.agencyConnection?.userId || ""
          }
          
          // Send message to recipient if connected
          if (recipientConnection) {
            const recipientSocket = recipientConnection.socket as unknown as WSWebSocket
            if (recipientSocket.readyState === WSWebSocket.OPEN) {
              recipientSocket.send(JSON.stringify({
                type: "message",
                data: chatMessage
              }))
            }
          }
          
          // Also send confirmation back to sender
          ws.send(JSON.stringify({
            type: "message",
            data: chatMessage
          }))
        }
      } catch (error) {
        console.error("Error processing message:", error)
        ws.send(JSON.stringify({
          type: "error",
          data: { error: "Failed to process message" }
        }))
      }
    })
    
    // Handle disconnect
    ws.on("close", () => {
      connections.delete(userId)
      
      // Update post connection
      if (postConnection) {
        if (userRole === "agency") {
          postConnection.agencyConnection = undefined
        } else {
          postConnection.customerConnection = undefined
        }
        
        // Remove post connection if no users connected
        if (!postConnection.agencyConnection && !postConnection.customerConnection) {
          postConnections.delete(postConnectionKey)
        }
      }
    })
  } catch (error) {
    console.error("WebSocket connection error:", error)
    ws.close()
  }
})

// Helper function to save message to database
async function saveMessageToDatabase(message: ChatMessage) {
  try {
    // Implementation would go here
    // Example:
    // await db.insert(chatMessages).values({
    //   postId: message.postId,
    //   postType: message.postType,
    //   senderId: message.senderId, 
    //   receiverId: message.receiverId,
    //   content: message.content,
    //   type: message.type,
    //   createdAt: new Date(),
    //   isRead: false
    // })
    
    // For now, just log the message
    console.log("Saving message:", message)
    return true
  } catch (error) {
    console.error("Error saving message:", error)
    return false
  }
}

// Create HTTP server
app.get("/", (c) => {
  return c.text("Chat server is running")
})

// Start the server
const port = process.env.CHAT_SERVER_PORT || 3001
console.log(`Starting chat server on port ${port}`)

const server = serve({
  fetch: app.fetch,
  port: parseInt(port.toString())
})

// Handle WebSocket upgrade
server.on("upgrade", (request, socket, head) => {
  console.log("Received upgrade request:", request.url);
  
  // Handle the upgrade regardless of the path
  wss.handleUpgrade(request, socket, head, (ws) => {
    console.log("WebSocket connection upgraded successfully");
    wss.emit("connection", ws, request)
  })
})

export default server 