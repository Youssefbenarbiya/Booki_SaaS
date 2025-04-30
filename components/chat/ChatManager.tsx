/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "@/auth-client"
import { ChatProvider } from "@/lib/contexts/ChatContext"
import { useChat } from "@/lib/contexts/ChatContext"
import { Button } from "@/components/ui/button"
import { Loader2, MessageSquare, Send, User } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Textarea } from "@/components/ui/textarea"
import { ChatMessage } from "@/lib/types/chat"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ChatConversation {
  postId: string
  postType: "trip" | "car" | "hotel" | "room"
  postName: string
  lastMessage: ChatMessage | null
  unreadCount: number
  displayName?: string // Added for actual post name
}

interface UserInfo {
  id: string
  name: string | null
  image: string | null
}

interface PostInfo {
  id: string | number
  name: string
  type: string
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
  const [userCache, setUserCache] = useState<Record<string, UserInfo>>({})
  const [postCache, setPostCache] = useState<Record<string, PostInfo>>({})

  // Store selected conversation in a ref to avoid dependency cycles
  const selectedConversationRef = useRef<ChatConversation | null>(null)

  // Load conversation details (offer names) when conversations are initialized
  useEffect(() => {
    async function loadPostDetails() {
      for (const conv of initialConversations) {
        const cacheKey = `${conv.postType}-${conv.postId}`
        if (!postCache[cacheKey]) {
          try {
            const response = await fetch(
              `/api/chat/posts?id=${conv.postId}&type=${conv.postType}`
            )
            if (response.ok) {
              const postData = await response.json()
              setPostCache((prev) => ({
                ...prev,
                [cacheKey]: postData,
              }))

              // Update conversation with display name
              setConversations((prevConvs) =>
                prevConvs.map((c) =>
                  c.postId === conv.postId && c.postType === conv.postType
                    ? { ...c, displayName: postData.name }
                    : c
                )
              )
            }
          } catch (error) {
            console.error(`Error fetching post details for ${cacheKey}:`, error)
          }
        }
      }
    }

    if (initialConversations.length > 0) {
      loadPostDetails()
    }
  }, [initialConversations])

  // Connect to the chat when a conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      selectedConversationRef.current = selectedConversation
      connectToChat(selectedConversation.postId, selectedConversation.postType)

      // Fetch post details if not already cached
      const cacheKey = `${selectedConversation.postType}-${selectedConversation.postId}`
      if (!postCache[cacheKey] && !selectedConversation.displayName) {
        fetch(
          `/api/chat/posts?id=${selectedConversation.postId}&type=${selectedConversation.postType}`
        )
          .then((res) => {
            if (res.ok) return res.json()
            throw new Error("Failed to fetch post details")
          })
          .then((data) => {
            setPostCache((prev) => ({
              ...prev,
              [cacheKey]: data,
            }))

            // Update the selected conversation with the display name
            setSelectedConversation((prev) =>
              prev ? { ...prev, displayName: data.name } : null
            )
          })
          .catch((err) => {
            console.error("Error fetching post details:", err)
          })
      }
    } else {
      selectedConversationRef.current = null
      disconnectFromChat()
    }
  }, [selectedConversation]) // Don't include connectToChat or disconnectFromChat as dependencies

  // Fetch user information for message senders
  useEffect(() => {
    const fetchUserInfo = async () => {
      const userIds = messages
        .map((msg) => msg.senderId)
        .filter((id) => id && !userCache[id])
        .filter((id, index, self) => self.indexOf(id) === index) // Get unique IDs

      if (userIds.length === 0) return

      try {
        // Use a more robust API fetching approach
        for (const userId of userIds) {
          // Store default fallback info immediately to avoid repeated failed requests
          if (!userCache[userId]) {
            setUserCache((prev) => ({
              ...prev,
              [userId]: {
                id: userId,
                name: userId === session?.user?.id ? session.user.name : "User",
                image: userId === session?.user?.id ? session.user.image : null,
              },
            }))
          }

          try {
            // Try to fetch user data from API
            const response = await fetch(`/api/chat/users/${userId}`)
            if (response.ok) {
              const userData = await response.json()
              setUserCache((prev) => ({
                ...prev,
                [userId]: {
                  id: userId,
                  name: userData.name || "User",
                  image: userData.image || null,
                },
              }))
            }
          } catch (error) {
            console.log(`User data not available for ${userId}, using fallback`)
          }
        }
      } catch (error) {
        console.error("Error handling user data:", error)
      }
    }

    if (messages.length > 0) {
      fetchUserInfo()
    }
  }, [messages, session])

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

  // Get initials from name for avatar fallback
  const getInitials = (name: string | null): string => {
    if (!name || name === "User") return "U"
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Get display name for post
  const getPostDisplayName = (conversation: ChatConversation): string => {
    const cacheKey = `${conversation.postType}-${conversation.postId}`

    if (conversation.displayName) {
      return conversation.displayName
    }

    if (postCache[cacheKey]) {
      return postCache[cacheKey].name
    }

    return conversation.postName // Fallback to generic name
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
                      {getPostDisplayName(conv)}
                    </h3>
                    {conv.unreadCount > 0 && (
                      <span className="bg-primary text-white rounded-full px-2 py-0.5 text-xs">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {conv.postType.charAt(0).toUpperCase() +
                      conv.postType.slice(1)}
                  </p>
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
                {getPostDisplayName(selectedConversation)}
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
                <div className="space-y-4">
                  {messages.map((message, index) => {
                    const isSentByMe = message.senderId === session?.user?.id
                    // Get sender information - use fallbacks for missing data
                    const senderInfo = userCache[message.senderId] || {
                      id: message.senderId,
                      name: isSentByMe ? session?.user?.name || "Me" : "User",
                      image: isSentByMe ? session?.user?.image : null,
                    }

                    // Ensure we have a truly unique key
                    const messageKey = `${message.id || "temp"}-${index}-${
                      message.senderId
                    }`

                    return (
                      <div
                        key={messageKey}
                        className={`flex ${
                          isSentByMe ? "justify-end" : "justify-start"
                        } items-start gap-2`}
                      >
                        {/* Avatar for received messages */}
                        {!isSentByMe && (
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarImage
                              src={senderInfo.image || undefined}
                              alt={senderInfo.name || "User"}
                            />
                            <AvatarFallback className="bg-primary/20 text-xs">
                              {getInitials(senderInfo.name)}
                            </AvatarFallback>
                          </Avatar>
                        )}

                        <div className="flex flex-col max-w-[75%]">
                          {/* Always show sender name for received messages */}
                          {!isSentByMe && (
                            <span className="text-xs font-medium text-gray-700 mb-1 ml-1">
                              {senderInfo.name || "User"}
                            </span>
                          )}

                          <div
                            className={`rounded-lg p-3 ${
                              isSentByMe
                                ? "bg-primary text-white rounded-tr-none"
                                : "bg-white border border-gray-200 rounded-tl-none"
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

                        {/* Avatar for sent messages */}
                        {isSentByMe && (
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarImage
                              src={session?.user?.image || undefined}
                              alt={session?.user?.name || "You"}
                            />
                            <AvatarFallback className="bg-primary/20 text-xs">
                              {getInitials(session?.user?.name)}
                            </AvatarFallback>
                          </Avatar>
                        )}
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
