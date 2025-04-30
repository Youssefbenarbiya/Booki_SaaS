"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useChat } from "@/lib/contexts/ChatContext"
import { ChatMessage } from "@/lib/types/chat"
import { Send } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Badge } from "../ui/badge"
import { ScrollArea } from "../ui/scroll-area"
import { useSession } from "@/auth-client"

interface ChatWidgetProps {
  postId: string
  postType: string
  agencyName?: string
  agencyLogo?: string | null
}

export default function ChatWidget({
  postId,
  postType,
  agencyName,
  agencyLogo,
}: ChatWidgetProps) {
  const [message, setMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const processedMessageIds = useRef<Set<string>>(new Set())
  const isFirstMount = useRef(true)
  const chatConnectionRef = useRef({ postId, postType })
  const customerIdRef = useRef<string | null>(null)

  const {
    messages,
    connected,
    loading,
    error,
    sendMessage,
    connectToChat,
    disconnectFromChat,
    markAsRead,
  } = useChat()

  const session = useSession()

  useEffect(() => {
    if (session?.data?.user?.id) {
      customerIdRef.current = session.data.user.id
    }
  }, [session?.data?.user?.id])

  useEffect(() => {
    if (isFirstMount.current) {
      console.log("Connecting to chat:", postId, postType)
      connectToChat(postId, postType)
      isFirstMount.current = false

      chatConnectionRef.current = { postId, postType }
    }

    return () => {
      disconnectFromChat()
    }
  }, [])

  useEffect(() => {
    const processUnreadMessages = () => {
      const unreadMessages = messages.filter(
        (msg) =>
          msg.id &&
          !msg.isRead &&
          msg.sender !== "user" &&
          !processedMessageIds.current.has(msg.id)
      )

      if (unreadMessages.length > 0) {
        unreadMessages.forEach((msg) => {
          if (msg.id) {
            markAsRead(msg.id)
            processedMessageIds.current.add(msg.id)
          }
        })
      }
    }

    const timeoutId = setTimeout(processUnreadMessages, 300)
    return () => clearTimeout(timeoutId)
  }, [messages, markAsRead])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length])

  const handleSend = () => {
    if (!message.trim()) return
    sendMessage(
      chatConnectionRef.current.postId,
      chatConnectionRef.current.postType,
      message.trim()
    )
    setMessage("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Card className="w-full h-[500px] flex flex-col shadow-lg border-primary/10">
      <CardHeader className="p-4 border-b">
        <CardTitle className="text-lg flex items-center gap-2">
          <span>Chat with {agencyName || "Support"}</span>
          {connected ? (
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200"
            >
              Connected
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-yellow-50 text-yellow-700 border-yellow-200"
            >
              {loading ? "Connecting..." : "Disconnected"}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <ScrollArea className="flex-grow p-4">
        {error && (
          <div className="mb-4 p-2 bg-red-50 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        {messages.length === 0 && !loading && !error ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Start a conversation...
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <MessageBubble 
                key={msg.id || index} 
                message={msg} 
                agencyLogo={agencyLogo}
                customerId={customerIdRef.current}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      <CardFooter className="p-4 pt-2 border-t">
        <div className="flex w-full gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="min-h-[60px] resize-none"
            disabled={!connected}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!connected || !message.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

function MessageBubble({ 
  message, 
  agencyLogo,
  customerId
}: { 
  message: ChatMessage; 
  agencyLogo?: string | null;
  customerId?: string | null;
}) {
  // In customer chat view:
  // - Messages FROM the agency should appear on the right
  // - Customer's own messages should appear on the left
  
  // Determine if message is from the customer (self) or from the agency
  const isCustomer = customerId && message.senderId === customerId;
  const isFromAgency = 
    // Basic agency identification checks
    message.senderId?.includes("agency") || 
    message.senderId?.startsWith("AGN-") ||
    message.sender === "agency" ||
    (message as any)?.isFromAgency === true ||
    // If we know who the customer is, anything not from them is from the agency
    (customerId && message.senderId !== customerId);
  
  // For a customer interface, we want to show:
  // - Agency messages on the right (blue/primary color)
  // - Customer's own messages on the left (gray/muted color)
  return (
    <div className={`flex ${isFromAgency ? "justify-end" : "justify-start"}`}>
      <div className="flex items-start gap-2 max-w-[80%]">
        {!isFromAgency && (
          <Avatar className="h-8 w-8">
            <AvatarImage src="/images/avatar-user.png" alt="You" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        )}

        <div>
          <div
            className={`p-3 rounded-lg ${
              isFromAgency 
                ? "bg-primary text-primary-foreground rounded-br-none" 
                : "bg-muted rounded-bl-none"
            }`}
          >
            {message.content}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {message.createdAt &&
              formatDistanceToNow(new Date(message.createdAt), {
                addSuffix: true,
              })}
          </div>
        </div>

        {isFromAgency && (
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={agencyLogo || "/images/avatar-host.png"} 
              alt="Agency" 
            />
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  )
}
