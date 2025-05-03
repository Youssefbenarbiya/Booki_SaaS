"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import ChatWidgetWrapper from "@/components/chat/ChatWidgetWrapper"
import { useSession } from "@/auth-client"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Terminal, MessageCircle } from "lucide-react"

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
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [showServerAlert, setShowServerAlert] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>("")

  const handleContactClick = () => {
    if (!session || !session.user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "You must be logged in to chat with the host"
      })
      return
    }

    setIsChatOpen((prev) => !prev)
  }

  const handleChatError = (error: string) => {
    setShowServerAlert(true)
    setErrorMessage(error)
  }

  return (
    <>
      <Button
        variant="default"
        size="lg"
        onClick={handleContactClick}
        className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
      >
        <MessageCircle className="h-5 w-5" />
        {isChatOpen ? "Close Chat" : "Contact Host"}
      </Button>

      {showServerAlert && (
        <Alert variant="destructive" className="mt-4">
          <Terminal className="h-4 w-4" />
          <AlertDescription>
            {errorMessage ||
              "Chat server is not running. Please start the chat server with:"}
            {!errorMessage && (
              <code className="ml-2 p-1 bg-muted rounded">
                bun run server/run-chat-server.ts
              </code>
            )}
          </AlertDescription>
        </Alert>
      )}

      {isChatOpen && (
        <div className="mt-4">
          <ChatWidgetWrapper
            postId={postId}
            postType={postType}
            agencyName={agencyName}
            agencyLogo={agencyLogo}
            onError={handleChatError}
          />
        </div>
      )}
    </>
  )
}
