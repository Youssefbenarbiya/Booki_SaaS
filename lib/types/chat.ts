/* eslint-disable @typescript-eslint/no-explicit-any */
// WebSocket message types
export type MessageType = "text" | "image" | "notification"

// Message data structure
export interface ChatMessage {
  id: string
  content: string
  postId: string
  postType: "trip" | "car" | "hotel" | "room"
  senderId: string
  receiverId: string
  sender: "user" | "system" | "agency"
  type: "text" | "image" | "notification"
  createdAt: string
  isRead: boolean
  customerId?: string
  _isPending?: boolean
  tempId?: string
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
  type: string
  data?: any
  message?: string
  messages?: ChatMessage[]
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