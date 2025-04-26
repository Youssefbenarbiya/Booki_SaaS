"use client"

import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
} from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useChat } from "@/lib/contexts/ChatContext"
import { ChatMessage } from "@/lib/types/chat"
import { Send } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Badge } from "../ui/badge"
import { ScrollArea } from "../ui/scroll-area"

interface ChatWidgetProps {
  postId: string
  postType: string
  agencyName?: string
  agencyLogo?: string | null
}

export interface ChatWidgetRef {
  openChat: (postId: string, postType: string) => void
}

const ChatWidgetComponent: ForwardRefRenderFunction<
  ChatWidgetRef,
  ChatWidgetProps
> = ({ postId, postType, agencyName, agencyLogo }, ref) => {
  const [message, setMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [processedMessageIds, setProcessedMessageIds] = useState<Set<string>>(
    new Set()
  )
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

  // Properly expose methods via ref using useImperativeHandle
  useImperativeHandle(
    ref,
    () => ({
      openChat: (newPostId: string, newPostType: string) => {
        connectToChat(newPostId, newPostType)
      },
    }),
    [connectToChat]
  )

  useEffect(() => {
    // Connect to chat when component mounts
    connectToChat(postId, postType)

    // Disconnect when component unmounts
    return () => {
      disconnectFromChat()
    }
  }, [postId, postType, connectToChat, disconnectFromChat])

  // Fixed: Mark unread messages as read with protection against infinite loops
  useEffect(() => {
    const unreadMessages = messages.filter(
      (msg) =>
        !msg.isRead && msg.sender !== "user" && !processedMessageIds.has(msg.id)
    )

    if (unreadMessages.length > 0) {
      // Create a new set of processed IDs by copying the old one
      const newProcessedIds = new Set(processedMessageIds)

      // Mark messages as read and update our processed IDs
      unreadMessages.forEach((msg) => {
        markAsRead(msg.id)
        newProcessedIds.add(msg.id)
      })

      // Update the set of processed message IDs
      setProcessedMessageIds(newProcessedIds)
    }
  }, [messages, markAsRead, processedMessageIds])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = () => {
    if (!message.trim()) return

    sendMessage(message.trim())
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
          <span>Chat</span>
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
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
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

export const ChatWidget = forwardRef(ChatWidgetComponent)
ChatWidget.displayName = "ChatWidget"

export default ChatWidget

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.sender === "user"

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="flex items-start gap-2 max-w-[80%]">
        {!isUser && (
          <Avatar className="h-8 w-8">
            <AvatarImage src="/images/avatar-host.png" alt="Host" />
            <AvatarFallback>H</AvatarFallback>
          </Avatar>
        )}

        <div>
          <div
            className={`p-3 rounded-lg ${
              isUser ? "bg-primary text-primary-foreground" : "bg-muted"
            }`}
          >
            {message.content}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(message.createdAt), {
              addSuffix: true,
            })}
          </div>
        </div>

        {isUser && (
          <Avatar className="h-8 w-8">
            <AvatarImage src="/images/avatar-user.png" alt="You" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  )
}
