"use client"

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
  useRef,
} from "react"
import { useSession } from "@/auth-client"
import { ChatMessage } from "@/lib/types/chat"

export interface ChatContextType {
  messages: ChatMessage[]
  connected: boolean
  loading: boolean
  error: string | null
  sendMessage: (postId: string, postType: string, content: string) => void
  connectToChat: (postId: string, postType: string) => void
  disconnectFromChat: () => void
  markAsRead: (messageId: string) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

interface ChatProviderProps {
  children: ReactNode
  onError?: (error: string) => void
}

export const ChatProvider = ({ children, onError }: ChatProviderProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null)
  const session = useSession()

  // Use refs for values that shouldn't trigger dependency changes
  const socketRef = useRef<WebSocket | null>(null)
  const connectedRef = useRef(false)
  const currentRoomIdRef = useRef<string | null>(null)
  const onErrorRef = useRef<((error: string) => void) | undefined>(onError)

  // Keep refs in sync with state
  useEffect(() => {
    socketRef.current = socket
    connectedRef.current = connected
    currentRoomIdRef.current = currentRoomId
    onErrorRef.current = onError
  }, [socket, connected, currentRoomId, onError])

  // Watch for errors and call onError prop when needed
  useEffect(() => {
    if (error && onError) {
      onError(error)
    }
  }, [error, onError])

  const connectToChat = useCallback(
    (postId: string, postType: string) => {
      // Use refs instead of state values to avoid dependency cycle
      if (
        connectedRef.current &&
        currentRoomIdRef.current === `${postId}-${postType}`
      ) {
        return
      }

      // Disconnect from any existing connection first
      if (socketRef.current) {
        socketRef.current.close()
      }

      // Check if user is logged in
      if (!session.data?.user?.id) {
        setError("You must be logged in to chat")
        return
      }

      setLoading(true)
      setError(null)

      try {
        // For development mode, always use localhost:3001 if no env variable
        const baseWsUrl =
          process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001"

        // Connect directly to the WebSocket server port
        let wsUrl = `${baseWsUrl}?userId=${session.data.user.id}&postId=${postId}&postType=${postType}&token=development-token`

        console.log(`Connecting to WebSocket at: ${wsUrl}`)

        const ws = new WebSocket(wsUrl)
        socketRef.current = ws

        // Set a connection timeout
        const connectionTimeout = setTimeout(() => {
          if (!connectedRef.current && socketRef.current === ws) {
            console.log("WebSocket connection timeout")
            setError("Connection timeout. Please try again.")
            setLoading(false)

            if (ws && ws.readyState !== WebSocket.CLOSED) {
              ws.close()
            }

            // If onError callback is provided, call it
            if (onErrorRef.current) {
              onErrorRef.current("Connection timeout. Please try again.")
            }
          }
        }, 10000)

        ws.onopen = () => {
          console.log("WebSocket connection opened successfully")
          clearTimeout(connectionTimeout)
          setConnected(true)
          setLoading(false)
          setCurrentRoomId(`${postId}-${postType}`)
          setSocket(ws)
        }

        ws.onmessage = (event) => {
          try {
            console.log("Received WebSocket message:", event.data)
            const data = JSON.parse(event.data)

            if (data.type === "message") {
              console.log("Received chat message:", data.data)
              setMessages((prev) => [...prev, data.data])
            } else if (data.type === "history") {
              console.log("Received message history:", data.messages)
              // Sort messages by creation date
              const sortedMessages = [...data.messages].sort(
                (a, b) =>
                  new Date(a.createdAt).getTime() -
                  new Date(b.createdAt).getTime()
              )
              setMessages(sortedMessages)
            } else if (data.type === "error") {
              console.error(
                "Received error from server:",
                data.data?.error || data.message
              )
              setError(data.data?.error || data.message)
            } else if (data.type === "connection") {
              console.log("Received connection confirmation:", data.data)
            } else {
              console.log("Received unknown message type:", data.type)
            }
          } catch (err) {
            console.error("Error parsing WebSocket message:", err)
          }
        }

        ws.onerror = (error) => {
          console.error("WebSocket error:", error)
          setError("Failed to connect to chat server")
          setLoading(false)
          setConnected(false)
        }

        ws.onclose = () => {
          console.log("WebSocket connection closed")
          // Only update state if this is the current socket
          if (socketRef.current === ws) {
            setConnected(false)
            setSocket(null)
          }
        }
      } catch (err) {
        console.error("Error connecting to chat:", err)
        setError("Failed to connect to chat server")
        setLoading(false)
      }
    },
    // Only depend on session to prevent unnecessary recreation
    [session]
  )

  const disconnectFromChat = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close()
      setSocket(null)
      setConnected(false)
      setCurrentRoomId(null)
      setMessages([])
    }
  }, [])

  const sendMessage = useCallback(
    (postId: string, postType: string, content: string) => {
      if (!socketRef.current || !connectedRef.current) {
        setError("Not connected to chat")
        return
      }

      try {
        const message = {
          type: "message",
          content,
          postId,
          postType,
          userId: session.data?.user?.id,
          roomId: currentRoomIdRef.current,
        }

        socketRef.current.send(JSON.stringify(message))
      } catch (err) {
        console.error("Error sending message:", err)
        setError("Failed to send message")
      }
    },
    [session]
  )

  const markAsRead = useCallback(
    (messageId: string) => {
      if (!socketRef.current || !connectedRef.current) {
        return
      }

      try {
        const readRequest = {
          type: "markAsRead",
          messageId,
          userId: session.data?.user?.id,
        }

        socketRef.current.send(JSON.stringify(readRequest))

        // Optimistically update UI
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, isRead: true } : msg
          )
        )
      } catch (err) {
        console.error("Error marking message as read:", err)
      }
    },
    [session]
  )

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close()
      }
    }
  }, [])

  const value = {
    messages,
    connected,
    loading,
    error,
    sendMessage,
    connectToChat,
    disconnectFromChat,
    markAsRead,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}
