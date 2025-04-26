"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react"
import { useSession } from "@/auth-client"
import { ChatMessage } from "@/lib/types/chat"

export interface ChatContextType {
  messages: ChatMessage[]
  connected: boolean
  loading: boolean
  error: string | null
  sendMessage: (content: string) => void
  connectToChat: (postId: string, postType: string) => void
  disconnectFromChat: () => void
  markAsRead: (messageId: string) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null)
  const session = useSession()

  const connectToChat = useCallback(
    (postId: string, postType: string) => {
      if (!session.data?.user?.id) {
        setError("You must be logged in to chat")
        return
      }
      
      setLoading(true)
      setError(null)
      
      try {
        const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/chat?userId=${session.data.user.id}&postId=${postId}&postType=${postType}`
        const ws = new WebSocket(wsUrl)
        
        ws.onopen = () => {
          setConnected(true)
          setLoading(false)
          setCurrentRoomId(`${postId}-${postType}`)
        }
        
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data)
          
          if (data.type === 'message') {
            setMessages((prev) => [...prev, data.message])
          } else if (data.type === 'history') {
            setMessages(data.messages)
          } else if (data.type === 'error') {
            setError(data.message)
          }
        }
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          setError('Failed to connect to chat server')
          setLoading(false)
        }
        
        ws.onclose = () => {
          setConnected(false)
          setSocket(null)
        }
        
        setSocket(ws)
      } catch (err) {
        console.error('Error connecting to chat:', err)
        setError('Failed to connect to chat server')
        setLoading(false)
      }
    },
    [session]
  )

  const disconnectFromChat = useCallback(() => {
    if (socket) {
      socket.close()
      setSocket(null)
      setConnected(false)
      setCurrentRoomId(null)
      setMessages([])
    }
  }, [socket])

  const sendMessage = useCallback(
    (content: string) => {
      if (!socket || !connected) {
        setError('Not connected to chat')
        return
      }
      
      try {
        const message = {
          type: 'message',
          content,
          userId: session.data?.user?.id,
          roomId: currentRoomId,
        }
        
        socket.send(JSON.stringify(message))
      } catch (err) {
        console.error('Error sending message:', err)
        setError('Failed to send message')
      }
    },
    [socket, connected, session.data?.user?.id, currentRoomId]
  )

  const markAsRead = useCallback(
    (messageId: string) => {
      if (!socket || !connected) {
        return
      }
      
      try {
        const readRequest = {
          type: 'markAsRead',
          messageId,
          userId: session.data?.user?.id,
        }
        
        socket.send(JSON.stringify(readRequest))
        
        // Optimistically update UI
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, isRead: true } : msg
          )
        )
      } catch (err) {
        console.error('Error marking message as read:', err)
      }
    },
    [socket, connected, session.data?.user?.id]
  )

  useEffect(() => {
    return () => {
      if (socket) {
        socket.close()
      }
    }
  }, [socket])

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
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
} 