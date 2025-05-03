"use client"

import { ChatProvider } from "@/lib/contexts/ChatContext"
import ChatWidget from "./ChatWidget"

interface ChatWidgetWrapperProps {
  postId: string
  postType: "trip" | "car" | "hotel" | "room"
  agencyName?: string
  agencyLogo?: string | null
  onError?: (error: string) => void
}

export default function ChatWidgetWrapper({
  postId,
  postType,
  agencyName,
  agencyLogo,
  onError
}: ChatWidgetWrapperProps) {
  return (
    <ChatProvider onError={onError}>
      <ChatWidget
        postId={postId}
        postType={postType}
        agencyName={agencyName}
        agencyLogo={agencyLogo}
      />
    </ChatProvider>
  )
}
