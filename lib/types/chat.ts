// WebSocket message types
export type MessageType = "text" | "image" | "notification"

// Message data structure
export interface ChatMessage {
  type: string
  receiverId: string
  postType: any
  senderId: string
  postId: any
  id: string
  content: string
  sender: string
  createdAt: string
  isRead: boolean
  customerId?: string
}

// Connection data structure
export interface ChatConnection {
  userId: string
  socket: WebSocket
  userRole: "customer" | "agency owner"
  agencyId?: string
}

// Connection with post specifics
export interface PostConnection {
  postId: string
  postType: "trip" | "car" | "hotel" | "room"
  customerConnection?: ChatConnection
  agencyConnection?: ChatConnection
}

// WebSocket message format
export interface WebSocketMessage {
  type: "message" | "connection" | "error" | "typing" | "read"
  data: ChatMessage | { postId: string; postType: string } | { error: string }
}

export interface ChatSession {
  id: string
  userId: string
  postId: string
  postType: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
} 