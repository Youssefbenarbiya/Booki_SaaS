"use client"

import { forwardRef } from "react"
import { ChatProvider } from "@/lib/contexts/ChatContext"
import ChatWidget, { ChatWidgetRef } from "./ChatWidget"

// Re-export the ChatWidgetRef interface
export type { ChatWidgetRef }

interface ChatWidgetWrapperProps {
  postId: string
  postType: "trip" | "car" | "hotel" | "room"
  agencyName?: string
  agencyLogo?: string | null
}

const ChatWidgetWrapper = forwardRef<ChatWidgetRef, ChatWidgetWrapperProps>(
  ({ postId, postType, agencyName, agencyLogo }, ref) => {
    return (
      <ChatProvider>
        <ChatWidget
          ref={ref}
          postId={postId}
          postType={postType}
          agencyName={agencyName}
          agencyLogo={agencyLogo}
        />
      </ChatProvider>
    )
  }
)

ChatWidgetWrapper.displayName = "ChatWidgetWrapper"

export default ChatWidgetWrapper
