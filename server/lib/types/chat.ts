export interface ChatMessage {
  id: string;
  postId: string;
  postType: "trip" | "car" | "hotel" | "room";
  senderId: string;
  receiverId: string;
  sender?: "user" | "agency";
  content: string;
  type: "text" | "image" | "notification";
  createdAt: string;
  isRead: boolean;
  customerId?: string;
}

export interface ChatConnection {
  userId: string;
  socket: WebSocket;
  userRole: "customer" | "agency owner";
  agencyId?: string;
}

export interface PostConnection {
  postId: string;
  postType: string;
  agencyConnection?: ChatConnection;
  customerConnection?: ChatConnection;
} 