/* eslint-disable react-hooks/exhaustive-deps */
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
import { getWebSocketUrl } from "@/lib/config/chatConfig"

export interface ChatContextType {
  messages: ChatMessage[]
  connected: boolean
  loading: boolean
  error: string | null
  sendMessage: (
    postId: string,
    postType: string,
    content: string,
    customerId?: string
  ) => void
  connectToChat: (postId: string, postType: string, customerId?: string) => void
  disconnectFromChat: () => void
  markAsRead: (messageId: string) => void
  clearMessages: () => void
}

// Extend ChatMessage type to include pending status
interface ExtendedChatMessage extends ChatMessage {
  _isPending?: boolean
  tempId?: string
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

interface ChatProviderProps {
  children: ReactNode
  onError?: (error: string) => void
}

export const ChatProvider = ({ children, onError }: ChatProviderProps) => {
  const [messages, setMessages] = useState<ExtendedChatMessage[]>([])
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null)
  const [currentCustomerId, setCurrentCustomerId] = useState<string | null>(
    null
  )
  const session = useSession()

  // Use refs for values that shouldn't trigger dependency changes
  const socketRef = useRef<WebSocket | null>(null)
  const connectedRef = useRef(false)
  const currentRoomIdRef = useRef<string | null>(null)
  const currentCustomerIdRef = useRef<string | null>(null)
  const onErrorRef = useRef<((error: string) => void) | undefined>(onError)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const messageIdTracker = useRef<Set<string>>(new Set())
  const tempMessageIdsRef = useRef<Set<string>>(new Set())

  // Keep refs in sync with state
  useEffect(() => {
    socketRef.current = socket
    connectedRef.current = connected
    currentRoomIdRef.current = currentRoomId
    currentCustomerIdRef.current = currentCustomerId
    onErrorRef.current = onError
  }, [socket, connected, currentRoomId, currentCustomerId, onError])

  // Watch for errors and call onError prop when needed
  useEffect(() => {
    if (error && onError) {
      onError(error)
    }
  }, [error, onError])

  // Helper function to create WebSocket connection
  const createWebSocketConnection = useCallback(
    (url: string, roomIdKey: string) => {
      console.log(`Creating WebSocket connection to: ${url}`)

      const ws = new WebSocket(url)
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

          // Schedule reconnection
          scheduleReconnection(url, roomIdKey)

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
        setCurrentRoomId(roomIdKey)
        setSocket(ws)
        reconnectAttemptsRef.current = 0 // Reset reconnect attempts counter on successful connection
      }

      ws.onmessage = (event) => {
        try {
          console.log("Received WebSocket message:", event.data)
          const data = JSON.parse(event.data)

          if (data.type === "message") {
            console.log("Received chat message:", data.data)

            // Check if message is from/to current customer if we have one
            if (currentCustomerIdRef.current) {
              const msg = data.data
              const clientUserId = session.data?.user?.id

              // Special handling for customer filtering
              // This method uses the in-memory customerId from the message or uses sender/receiver IDs
              const isBetweenSelectedCustomer =
                // If customerId is in the message and matches our filter
                msg.customerId === currentCustomerIdRef.current ||
                // Or traditional sender/receiver matching
                msg.senderId === currentCustomerIdRef.current ||
                msg.receiverId === currentCustomerIdRef.current ||
                msg.senderId === clientUserId ||
                msg.receiverId === clientUserId

              if (!isBetweenSelectedCustomer) {
                console.log(
                  "Filtering out message not related to selected customer"
                )
                return
              }
            }

            // Check if this message is replacing a temporary message
            const tempId = data.data.tempId || undefined

            if (tempId && tempMessageIdsRef.current.has(tempId)) {
              console.log(
                `Replacing temporary message ${tempId} with real message ${data.data.id}`
              )

              // Replace the temporary message with the real one
              setMessages((prev) => {
                console.log("Previous messages:", prev.length)
                console.log("Looking for tempId:", tempId)

                const tempMsgIndex = prev.findIndex(
                  (msg) => (msg as ExtendedChatMessage).tempId === tempId
                )

                if (tempMsgIndex === -1) {
                  console.log(
                    "❌ Temporary message not found with tempId:",
                    tempId
                  )
                  // If we can't find the temp message, just add the new one
                  return [...prev, { ...data.data, _isPending: false }]
                }

                console.log(
                  "✅ Found temporary message at index:",
                  tempMsgIndex
                )

                // Create a new array with the temporary message replaced
                const updatedMessages = [...prev]
                updatedMessages[tempMsgIndex] = {
                  ...data.data,
                  id: data.data.id,
                  _isPending: false,
                }

                console.log("Updated messages:", updatedMessages.length)
                return updatedMessages
              })

              tempMessageIdsRef.current.delete(tempId)
              messageIdTracker.current.add(data.data.id)
              return
            }

            // Check for duplicate message with improved tracking
            if (data.data.id) {
              // If we've seen this message ID before, skip it
              if (messageIdTracker.current.has(data.data.id)) {
                console.log("Skipping duplicate message:", data.data.id)
                return
              }

              // Add message ID to our tracker
              messageIdTracker.current.add(data.data.id)

              // Keep the tracker size reasonable by removing old IDs when it gets too large
              if (messageIdTracker.current.size > 1000) {
                // Get the oldest IDs (arbitrary number to remove)
                const idsArray = Array.from(messageIdTracker.current)
                const idsToRemove = idsArray.slice(0, 200) // Remove the oldest 200 IDs

                // Remove them from the tracker
                idsToRemove.forEach((id) => messageIdTracker.current.delete(id))
              }
            }

            // Add new message to state
            setMessages((prev) => [...prev, data.data])
          } else if (data.type === "history") {
            console.log("Received message history:", data.messages)
            // Sort messages by creation date
            const sortedMessages = [...data.messages].sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            )

            // Filter messages by customerId if we have one
            const filteredMessages = currentCustomerIdRef.current
              ? sortedMessages.filter((msg) => {
                  const clientUserId = session.data?.user?.id

                  // Special handling for customer filtering
                  // This uses either the in-memory customerId or falls back to sender/receiver matching
                  return (
                    // If customerId is in the message and matches our filter
                    msg.customerId === currentCustomerIdRef.current ||
                    // Or traditional sender/receiver matching
                    msg.senderId === currentCustomerIdRef.current ||
                    msg.receiverId === currentCustomerIdRef.current ||
                    msg.senderId === clientUserId ||
                    msg.receiverId === clientUserId
                  )
                })
              : sortedMessages

            // Store all message IDs in our tracker to prevent duplicates
            filteredMessages.forEach((msg) => {
              if (msg.id) {
                messageIdTracker.current.add(msg.id)
              }
            })

            // Set messages WITHOUT appending to previous state
            setMessages(filteredMessages)
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

        // Schedule reconnection
        scheduleReconnection(url, roomIdKey)
      }

      ws.onclose = (event) => {
        console.log(
          `WebSocket connection closed: ${event.code} ${event.reason}`
        )
        // Only update state if this is the current socket
        if (socketRef.current === ws) {
          setConnected(false)
          setSocket(null)

          // Don't attempt to reconnect if closed intentionally (code 1000)
          if (event.code !== 1000 && currentRoomIdRef.current === roomIdKey) {
            scheduleReconnection(url, roomIdKey)
          }
        }
      }

      return ws
    },
    [session.data?.user?.id]
  )

  // Helper function to schedule reconnection
  const scheduleReconnection = useCallback(
    (url: string, roomIdKey: string) => {
      // Clear any existing reconnection timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }

      // Exponential backoff for reconnection attempts
      const reconnectDelay = Math.min(
        1000 * Math.pow(2, reconnectAttemptsRef.current),
        30000 // Max 30 seconds
      )

      reconnectAttemptsRef.current++ // Increment reconnection attempt counter

      console.log(`Scheduling reconnection attempt in ${reconnectDelay}ms`)

      reconnectTimeoutRef.current = setTimeout(() => {
        if (currentRoomIdRef.current === roomIdKey) {
          console.log("Attempting to reconnect...")
          createWebSocketConnection(url, roomIdKey)
        } else {
          console.log("Room changed, not reconnecting")
          reconnectTimeoutRef.current = null
        }
      }, reconnectDelay)
    },
    [createWebSocketConnection]
  )

  const connectToChat = useCallback(
    (postId: string, postType: string, customerId?: string) => {
      // Use refs instead of state values to avoid dependency cycle
      const roomIdKey = customerId
        ? `${postId}-${postType}-${customerId}`
        : `${postId}-${postType}`

      if (connectedRef.current && currentRoomIdRef.current === roomIdKey) {
        return
      }

      // Reset the message ID tracker when connecting to a new chat
      messageIdTracker.current.clear()
      tempMessageIdsRef.current.clear()

      // Store the customerId for filtering messages
      if (customerId) {
        setCurrentCustomerId(customerId)
      } else {
        setCurrentCustomerId(null)
      }

      // Disconnect from any existing connection first
      if (socketRef.current) {
        socketRef.current.close(1000, "Switching rooms")
      }

      // Check if user is logged in
      if (!session.data?.user?.id) {
        setError("You must be logged in to chat")
        return
      }

      setLoading(true)
      setError(null)

      try {
        // Use the helper function instead of directly accessing env variable
        const baseWsUrl = getWebSocketUrl()

        // Add debugging to verify the URL is correct
        console.log("🔌 Connecting to WebSocket URL:", baseWsUrl)
        console.log(
          "🔑 Environment variable value:",
          process.env.NEXT_PUBLIC_WS_URL
        )

        // Connect directly to the WebSocket server port
        let wsUrl = `${baseWsUrl}?userId=${session.data.user.id}&postId=${postId}&postType=${postType}&token=development-token`

        // Add customerId if provided
        if (customerId) {
          wsUrl += `&customerId=${customerId}`
        }

        console.log("🌐 Full WebSocket URL:", wsUrl)
        createWebSocketConnection(wsUrl, roomIdKey)
      } catch (err) {
        console.error("Error connecting to chat:", err)
        setError("Failed to connect to chat server")
        setLoading(false)
      }
    },
    [session, createWebSocketConnection]
  )

  const disconnectFromChat = useCallback(() => {
    // Clear any reconnection attempt
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (socketRef.current) {
      socketRef.current.close(1000, "Disconnecting intentionally")
      setSocket(null)
      setConnected(false)
      setCurrentRoomId(null)
      setCurrentCustomerId(null)
      setMessages([])
      messageIdTracker.current.clear()
      tempMessageIdsRef.current.clear()
    }
  }, [])

  const sendMessage = useCallback(
    (
      postId: string,
      postType: string,
      content: string,
      customerId?: string
    ) => {
      if (!socketRef.current || !connectedRef.current) {
        setError("Not connected to chat")
        return
      }

      try {
        const tempId = `temp_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`
        console.log("Creating temporary message with ID:", tempId)
        tempMessageIdsRef.current.add(tempId) // Track this temporary ID

        // Create a temporary message object for optimistic UI update
        const tempMessage: ExtendedChatMessage = {
          id: tempId,
          content,
          postId,
          postType: postType as "trip" | "car" | "hotel" | "room",
          senderId: session.data?.user?.id || "",
          receiverId: customerId || "",
          sender: "user",
          type: "text",
          createdAt: new Date().toISOString(),
          isRead: false,
          _isPending: true,
          tempId: tempId,
        }

        // Add to messages state immediately for responsive UI
        setMessages((prev) => [...prev, tempMessage])

        // Prepare the actual message to send
        const message = {
          type: "message",
          data: {
            content,
            postId,
            postType,
            userId: session.data?.user?.id,
            roomId: currentRoomIdRef.current,
            customerId, // Include customerId if provided
            tempId, // Send the temp ID so we can match it with the server response
          },
        }

        console.log("Sending message to server with tempId:", tempId)
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

  // Add a clearMessages function
  const clearMessages = useCallback(() => {
    setMessages([])
    messageIdTracker.current.clear()
    tempMessageIdsRef.current.clear()
  }, [])

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close(1000, "Component unmounting")
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
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
    clearMessages,
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
