import { Hono } from "hono"
import { serve } from "@hono/node-server"
import { WebSocketServer, WebSocket as WSWebSocket } from "ws"
import http from "http"
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

// Create HTTP server for the WebSocket server to attach to
const wsHttpServer = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WebSocket server running');
});

// Create a WebSocket server attached to the HTTP server
const wss = new WebSocketServer({ 
  server: wsHttpServer,
  perMessageDeflate: false,
  clientTracking: true
});

// Create Hono app for the API endpoints
const app = new Hono();

// Handle WebSocket connection
wss.on("connection", async (ws: WSWebSocket, req) => {
  console.log("New WebSocket connection received")
  
  try {
    // Extract query parameters from URL
    const url = new URL(req.url || "", `http://${req.headers.host}`)
    console.log("Connection URL:", url.toString())
    
    const sessionToken = url.searchParams.get("token")
    const userId = url.searchParams.get("userId")
    const postId = url.searchParams.get("postId")
    const postType = url.searchParams.get("postType") as "trip" | "car" | "hotel" | "room"
    
    console.log("Received connection request:", {
      userId,
      postId,
      postType,
      hasToken: !!sessionToken,
    })
    
    // Send a welcome message to confirm connection
    ws.send(JSON.stringify({
      type: "connection",
      data: { 
        status: "connected",
        message: "WebSocket connection established",
        time: new Date().toISOString()
      }
    }))
    
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
        console.log("Received message:", message.toString())
        
        const parsedMessage = JSON.parse(message.toString()) 
        
        if (parsedMessage.type === "message") {
          // Extract message data - could be nested in data or directly in the message
          const chatMessage = parsedMessage.data || parsedMessage
          
          console.log("Processing chat message:", chatMessage)
          
          // Validate message
          if (!chatMessage.content) {
            ws.send(JSON.stringify({
              type: "error",
              data: { error: "Message content is required" }
            }))
            return
          }
          
          // Use postId and postType from the connection if not in the message
          const messagePostId = chatMessage.postId || postId
          const messagePostType = chatMessage.postType || postType
          
          // Create a complete message with all required fields
          const completeMessage: ChatMessage = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            content: chatMessage.content,
            postId: messagePostId,
            postType: messagePostType,
            senderId: userId,
            receiverId: "", // Will be set based on role below
            sender: "user",
            createdAt: new Date().toISOString(),
            isRead: false
          }
          
          // Save message to database
          await saveMessageToDatabase(completeMessage)
          
          // Find the post connection
          const postConnectionKey = `${messagePostType}:${messagePostId}`
          const postConnection = postConnections.get(postConnectionKey)
          
          if (!postConnection) {
            console.log("No post connection found for key:", postConnectionKey)
            // Still send back to sender for confirmation
            ws.send(JSON.stringify({
              type: "message",
              data: completeMessage
            }))
            return
          }
          
          // Determine recipient based on sender role
          let recipientConnection: ChatConnection | undefined
          
          if (userRole === "agency") {
            recipientConnection = postConnection.customerConnection
            completeMessage.receiverId = postConnection.customerConnection?.userId || ""
          } else {
            recipientConnection = postConnection.agencyConnection
            completeMessage.receiverId = postConnection.agencyConnection?.userId || ""
          }
          
          // Send message to recipient if connected
          if (recipientConnection) {
            const recipientSocket = recipientConnection.socket as unknown as WSWebSocket
            if (recipientSocket.readyState === WSWebSocket.OPEN) {
              recipientSocket.send(JSON.stringify({
                type: "message",
                data: completeMessage
              }))
            }
          }
          
          // Also send confirmation back to sender
          ws.send(JSON.stringify({
            type: "message",
            data: completeMessage
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
      console.log("WebSocket connection closed for user:", userId)
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

// WebSocket server error handling
wss.on("error", (error) => {
  console.error("WebSocket server error:", error);
});

// Helper function to save message to database
async function saveMessageToDatabase(message: ChatMessage) {
  try {
    // Implementation would go here
    console.log("Saving message:", message)
    return true
  } catch (error) {
    console.error("Error saving message:", error)
    return false
  }
}

// Create HTTP API server
app.get("/", (c) => {
  return c.text("Chat API server is running. WebSocket server is available on ws://localhost:3001")
})

// Create and start the servers
const startServers = () => {
  // Start WebSocket HTTP server
  wsHttpServer.listen(3001, () => {
    console.log("WebSocket server listening on port 3001");
  });
  
  // Start API HTTP server
  const apiServer = serve({
    fetch: app.fetch,
    port: 3002
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