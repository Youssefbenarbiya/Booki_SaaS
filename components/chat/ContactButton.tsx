"use client"

import { useState, useRef, } from "react"
import { Button } from "@/components/ui/button"
import ChatWidgetWrapper, {
  ChatWidgetRef,
} from "@/components/chat/ChatWidgetWrapper"
import { useSession } from "@/auth-client"
import { toast } from "sonner"

interface ContactButtonProps {
  postId: string
  postType: "trip" | "car" | "hotel" | "room"
  agencyName?: string
  agencyLogo?: string
}

export function ContactButton({
  postId,
  postType,
  agencyName,
  agencyLogo,
}: ContactButtonProps) {
  const chatRef = useRef<ChatWidgetRef>(null)
  const { data: session } = useSession()
  const [isChatOpen, setIsChatOpen] = useState(false)

  const handleContactClick = () => {
    if (!session?.user) {
      toast.error("You must be logged in to chat with the host")
      return
    }

    setIsChatOpen(true)

    // Use setTimeout to ensure state update happens before we try to access the ref
    setTimeout(() => {
      if (chatRef.current) {
        chatRef.current.openChat(postId, postType)
      }
    }, 0)
  }

  return (
    <>
      <Button
        variant="outline"
        size="lg"
        onClick={handleContactClick}
        className="w-full sm:w-auto"
      >
        Contact Host
      </Button>

      {isChatOpen && (
        <ChatWidgetWrapper
          ref={chatRef}
          postId={postId}
          postType={postType}
          agencyName={agencyName}
          agencyLogo={agencyLogo}
        />
      )}
    </>
  )
}
