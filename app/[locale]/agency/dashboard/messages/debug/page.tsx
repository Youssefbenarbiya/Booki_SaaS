"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession } from "@/auth-client"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export default function MessageDebugPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState("")
  const [message, setMessage] = useState("Hello, this is a test message")
  const [postId, setPostId] = useState("")
  const [postType, setPostType] = useState<"trip" | "car" | "hotel" | "room">("trip")
  const [debugLog, setDebugLog] = useState<any[]>([])

  const agencyId = session?.user?.id

  async function addToLog(message: any) {
    setDebugLog((prev) => [...prev, { timestamp: new Date().toISOString(), ...message }])
  }

  async function handleCheckMessages() {
    if (!agencyId) {
      toast.error("You must be logged in as an agency")
      return
    }

    setLoading(true)
    try {
      addToLog({ action: "Checking messages", agencyId })
      
      const response = await fetch("/api/debug/messages?agencyId=" + agencyId)
      const data = await response.json()
      
      addToLog({ action: "Check result", data })
      toast.success(`Found ${data.messages?.length || 0} messages`)
    } catch (error) {
      console.error(error)
      addToLog({ action: "Check error", error: String(error) })
      toast.error("Error checking messages")
    } finally {
      setLoading(false)
    }
  }

  async function handleSendMessage() {
    if (!agencyId || !userId || !message || !postId || !postType) {
      toast.error("All fields are required")
      return
    }

    setLoading(true)
    try {
      addToLog({
        action: "Sending message",
        from: agencyId,
        to: userId,
        postId,
        postType,
        message,
      })
      
      const response = await fetch("/api/debug/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: agencyId,
          receiverId: userId,
          content: message,
          postId,
          postType,
        }),
      })
      
      const data = await response.json()
      addToLog({ action: "Send result", data })
      
      if (data.success) {
        toast.success("Message sent successfully")
        handleCheckMessages()
      } else {
        toast.error("Failed to send message")
      }
    } catch (error) {
      console.error(error)
      addToLog({ action: "Send error", error: String(error) })
      toast.error("Error sending message")
    } finally {
      setLoading(false)
    }
  }

  if (!session?.user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Message Debugging</CardTitle>
        </CardHeader>
        <CardContent>
          <p>You must be logged in as an agency to use this tool.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Message Debugging Tool</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Check Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2">Agency ID: {agencyId || "Not logged in"}</p>
            <Button 
              onClick={handleCheckMessages} 
              disabled={loading || !agencyId}
            >
              {loading ? "Loading..." : "Check Messages"}
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Send Test Message</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">From: {agencyId}</label>
              </div>
              
              <div>
                <label className="block text-sm mb-1">To User ID:</label>
                <Input
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Enter recipient user ID"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-1">Post ID:</label>
                <Input
                  value={postId}
                  onChange={(e) => setPostId(e.target.value)}
                  placeholder="Enter post ID"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-1">Post Type:</label>
                <select
                  value={postType}
                  onChange={(e) => setPostType(e.target.value as any)}
                  className="w-full border rounded p-2"
                >
                  <option value="trip">Trip</option>
                  <option value="car">Car</option>
                  <option value="hotel">Hotel</option>
                  <option value="room">Room</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm mb-1">Message:</label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter message"
                />
              </div>
              
              <Button 
                onClick={handleSendMessage} 
                disabled={loading || !agencyId || !userId || !message || !postId}
              >
                {loading ? "Sending..." : "Send Message"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Debug Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 p-3 rounded max-h-80 overflow-auto">
            {debugLog.length === 0 ? (
              <p className="text-gray-500">No logs yet. Perform an action above.</p>
            ) : (
              <pre className="text-xs whitespace-pre-wrap">
                {debugLog.map((log, i) => (
                  <div key={i} className="mb-2 pb-2 border-b border-gray-200">
                    {JSON.stringify(log, null, 2)}
                  </div>
                ))}
              </pre>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 