"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSession } from "@/auth-client"
import { ChatProvider } from "@/lib/contexts/ChatContext"
import { useChat } from "@/lib/contexts/ChatContext"
import { Button } from "@/components/ui/button"
import { Loader2, MessageSquare, Send } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Textarea } from "@/components/ui/textarea"
import { ChatMessage } from "@/lib/types/chat"

interface ChatConversation {
  postId: string
  postType: "trip" | "car" | "hotel" | "room"
  postName: string
  lastMessage: ChatMessage | null
  unreadCount: number
}

interface ChatManagerProps {
  initialConversations?: ChatConversation[]
}

function ChatManagerContent({ initialConversations = [] }: ChatManagerProps) {
  const { data: session } = useSession()
  const {
    messages,
    sendMessage,
    connected,
    loading,
    error,
    connectToChat,
    disconnectFromChat,
  } = useChat()

  const [conversations, setConversations] =
    useState<ChatConversation[]>(initialConversations)
  const [selectedConversation, setSelectedConversation] =
    useState<ChatConversation | null>(null)
  const [messageText, setMessageText] = useState("")
  const [isFetchingMessages, setIsFetchingMessages] = useState(false)

  // Store selected conversation in a ref to avoid dependency cycles
  const selectedConversationRef = useRef<ChatConversation | null>(null)

  // Connect to the chat when a conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      selectedConversationRef.current = selectedConversation
      connectToChat(selectedConversation.postId, selectedConversation.postType)
    } else {
      selectedConversationRef.current = null
      disconnectFromChat()
    }
  }, [selectedConversation]) // Don't include connectToChat or disconnectFromChat as dependencies

  // Select a conversation
  const handleSelectConversation = (conversation: ChatConversation) => {
    setSelectedConversation(conversation)
    // Mark messages as read (would implement server action for this)
  }

  // Send a message to the current conversation
  const handleSendMessage = async () => {
    if (!selectedConversationRef.current || !messageText.trim()) return

    await sendMessage(
      selectedConversationRef.current.postId,
      selectedConversationRef.current.postType,
      messageText
    )
    setMessageText("")
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
      {/* Conversations List */}
      <div className="border rounded-lg overflow-hidden">
        <div className="p-3 bg-primary/10 border-b">
          <h2 className="font-medium">Conversations</h2>
        </div>
        <div className="overflow-y-auto h-[calc(100%-3rem)]">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center text-gray-500">
              <MessageSquare className="h-8 w-8 mb-2 text-gray-300" />
              <p>No conversations yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {conversations.map((conv) => (
                <div
                  key={`${conv.postType}-${conv.postId}`}
                  className={`p-3 hover:bg-gray-50 cursor-pointer ${
                    selectedConversation?.postId === conv.postId &&
                    selectedConversation?.postType === conv.postType
                      ? "bg-gray-100"
                      : ""
                  }`}
                  onClick={() => handleSelectConversation(conv)}
                >
                  <div className="flex justify-between">
                    <h3 className="font-medium text-sm truncate">
                      {conv.postName}
                    </h3>
                    {conv.unreadCount > 0 && (
                      <span className="bg-primary text-white rounded-full px-2 py-0.5 text-xs">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  {conv.lastMessage && (
                    <>
                      <p className="text-xs text-gray-600 mt-1 truncate">
                        {conv.lastMessage.content}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(
                          new Date(conv.lastMessage.createdAt!),
                          {
                            addSuffix: true,
                          }
                        )}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="border rounded-lg overflow-hidden md:col-span-2 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-3 bg-primary/10 border-b flex items-center">
              <h2 className="font-medium">
                {selectedConversation.postName}
                <span className="text-xs text-gray-500 ml-2">
                  ({selectedConversation.postType})
                </span>
              </h2>
            </div>

            {/* Messages */}
            <div className="flex-1 p-3 overflow-y-auto bg-gray-50">
              {loading || isFetchingMessages ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-full text-center text-gray-500">
                  <MessageSquare className="h-8 w-8 mb-2 text-gray-300" />
                  <p>No messages in this conversation</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((message, index) => {
                    const isSentByMe = message.senderId === session?.user?.id
                    // Ensure we have a truly unique key by combining id with other unique properties
                    const messageKey = message.id ? 
                      `${message.id}-${message.senderId}-${Date.now()}` : 
                      `temp-${index}-${Date.now()}`
                    
                    return (
                      <div
                        key={messageKey}
                        className={`flex ${
                          isSentByMe ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[85%] rounded-lg p-3 ${
                            isSentByMe
                              ? "bg-primary text-white rounded-br-none"
                              : "bg-white border border-gray-200 rounded-bl-none"
                          }`}
                        >
                          <p className="text-sm break-words">
                            {message.content}
                          </p>
                          <p
                            className={`text-xs mt-1 ${
                              isSentByMe ? "text-primary-50" : "text-gray-500"
                            }`}
                          >
                            {message.createdAt
                              ? formatDistanceToNow(
                                  new Date(message.createdAt),
                                  {
                                    addSuffix: true,
                                  }
                                )
                              : "Just now"}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              {error && (
                <div className="bg-red-50 text-red-600 p-2 rounded text-sm">
                  {error}
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-3 border-t">
              <div className="flex gap-2">
                <Textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder="Type a message..."
                  className="min-h-[40px] resize-none"
                  disabled={!connected || loading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!connected || loading || !messageText.trim()}
                  className="h-10 w-10 p-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col justify-center items-center h-full text-center text-gray-500 p-4">
            <MessageSquare className="h-12 w-12 mb-3 text-gray-300" />
            <h3 className="font-medium text-lg mb-1">Your Messages</h3>
            <p className="text-sm">Select a conversation to view messages</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ChatManager(props: ChatManagerProps) {
  return (
    <ChatProvider>
      <ChatManagerContent {...props} />
    </ChatProvider>
  )
}