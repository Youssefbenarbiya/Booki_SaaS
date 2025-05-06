/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "@/auth-client"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { Send, CheckCircle } from "lucide-react"

// Define types
interface SupportTicket {
  id: string
  subject: string
  status: "open" | "closed" | "pending"
  agencyId: string
  agencyName?: string
  createdAt: string
  hasNewMessages?: boolean
}

interface SupportMessage {
  id: string
  senderId: string
  receiverId: string
  content: string
  type: string
  isRead: boolean
  createdAt: string
  senderRole: "agency" | "admin"
  ticketId?: string
  tempId?: string
}

// Default translations as fallback
const defaultTranslations = {
  supportTitle: "Support Management",
  activeTickets: "Active Support Tickets",
  ticketsDescription: "View and respond to customer support tickets",
  noTickets: "No active support tickets",
  loading: "Loading...",
  selectTicket: "Select a ticket",
  agency: "Agency",
  selectTicketToStart: "Select a ticket to start chatting",
  noTicketSelected: "No ticket selected. Please select a ticket from the list.",
  typeMessage: "Type your message...",
  selectTicketFirst: "Select a ticket first",
  closeTicket: "Close Ticket",
  ticketClosed: "Ticket has been closed",
  newMessageFrom: "New message from",
  newTicketFrom: "New support ticket from",
}

const AdminSupportChat = () => {
  // Create a custom translation function that falls back to our defaults
  const tBase = useTranslations("AdminSupportChat")
  const t = (key: keyof typeof defaultTranslations) => {
    try {
      return tBase(key)
    } catch {
      // If translation is missing, use our default
      return defaultTranslations[key] || key
    }
  }

  const { data: session } = useSession()
  const userId = session?.user?.id

  // Refs
  const socketRef = useRef<WebSocket | null>(null)
  const messageEndRef = useRef<HTMLDivElement>(null)

  // State
  const [isConnected, setIsConnected] = useState(false)
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [messageInput, setMessageInput] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null)
  const [selectedAgencyId, setSelectedAgencyId] = useState<string | null>(null)

  // Connect to WebSocket
  useEffect(() => {
    if (!userId) return

    const connectWebSocket = () => {
      // Get the WebSocket URL from environment variables or use default
      const wsUrl =
        process.env.NEXT_PUBLIC_SUPPORT_WS_URL || "ws://localhost:3003"

      // Create WebSocket connection with parameters
      const socket = new WebSocket(
        `${wsUrl}?userId=${userId}&userRole=admin${selectedTicket ? `&ticketId=${selectedTicket}` : ""}`
      )

      socketRef.current = socket

      socket.onopen = () => {
        console.log("Admin Support WebSocket connected")
        setIsConnected(true)
        setLoading(false)
      }

      socket.onclose = () => {
        console.log("Admin Support WebSocket disconnected")
        setIsConnected(false)
        // Try to reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000)
      }

      socket.onerror = (error) => {
        console.error("Admin Support WebSocket error:", error)
        socket.close()
      }

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data)
        console.log("Admin Support WebSocket message:", data)

        if (data.type === "connection") {
          console.log("Connection established:", data.data)
        } else if (data.type === "tickets") {
          setTickets(data.tickets)
        } else if (data.type === "history") {
          setMessages(data.messages)
          setTimeout(
            () => messageEndRef.current?.scrollIntoView({ behavior: "smooth" }),
            100
          )
        } else if (data.type === "message") {
          // If there's an array of messages, append them all
          if (Array.isArray(data.messages)) {
            setMessages((prev) => [...prev, ...data.messages])
          }
          // If it's a single message, append it
          else if (data.data) {
            // Check if this message is for the currently selected ticket
            if (data.data.ticketId === selectedTicket) {
              setMessages((prev) => {
                // Check if we already have this message or its temp version
                const existingMsgIndex = prev.findIndex(
                  (msg) =>
                    msg.id === data.data.id ||
                    (data.data.tempId && msg.tempId === data.data.tempId)
                )

                // If we found the message, replace it
                if (existingMsgIndex !== -1) {
                  const newMessages = [...prev]
                  newMessages[existingMsgIndex] = data.data
                  return newMessages
                }

                // Otherwise, add it as a new message
                return [...prev, data.data]
              })

              // Always scroll to latest message on new messages
              setTimeout(
                () =>
                  messageEndRef.current?.scrollIntoView({ behavior: "smooth" }),
                100
              )
            }
            // If it's for a different ticket, show a notification
            else {
              const ticketDetails = tickets.find(
                (t) => t.id === data.data.ticketId
              )
              if (ticketDetails) {
                toast.info(
                  `${t("newMessageFrom")} ${ticketDetails.agencyName || t("agency")}`
                )
                // Update the ticket to show it has new messages
                setTickets((prev) =>
                  prev.map((ticket) =>
                    ticket.id === data.data.ticketId
                      ? { ...ticket, hasNewMessages: true }
                      : ticket
                  )
                )
              }
            }
          }
        } else if (data.type === "new_ticket") {
          toast.success(
            `${t("newTicketFrom")} ${data.ticket.agencyName || t("agency")}`
          )
          setTickets((prev) => [data.ticket, ...prev])
        } else if (data.type === "ticket_closed") {
          toast.info(t("ticketClosed"))
          setTickets((prev) =>
            prev.map((ticket) =>
              ticket.id === data.ticket.id
                ? { ...ticket, status: "closed" }
                : ticket
            )
          )
        } else if (data.type === "error") {
          toast.error(data.data.error)
        }
      }
    }

    connectWebSocket()

    // Cleanup on component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.close()
      }
    }
  }, [userId, selectedTicket])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Send message
  const sendMessage = () => {
    if (
      !messageInput.trim() ||
      !isConnected ||
      !socketRef.current ||
      !selectedAgencyId
    )
      return

    // Create a temporary ID for optimistic UI update
    const tempId = `temp_${Date.now()}`

    // Create temp message for immediate display
    const tempMessage: SupportMessage = {
      id: tempId,
      tempId,
      senderId: userId!,
      receiverId: selectedAgencyId,
      content: messageInput,
      type: "text",
      isRead: false,
      createdAt: new Date().toISOString(),
      senderRole: "admin",
      ticketId: selectedTicket || undefined,
    }

    // Optimistically add to messages
    setMessages((prev) => [...prev, tempMessage])

    // Send message via WebSocket
    socketRef.current.send(
      JSON.stringify({
        type: "message",
        data: {
          content: messageInput,
          ticketId: selectedTicket,
          receiverId: selectedAgencyId,
          tempId,
        },
      })
    )

    // Clear input
    setMessageInput("")
  }

  // Close ticket
  const closeTicket = (ticketId: string, agencyId: string) => {
    if (!isConnected || !socketRef.current) return

    socketRef.current.send(
      JSON.stringify({
        type: "close_ticket",
        ticketId,
        agencyId,
      })
    )
  }

  // Select ticket to view
  const handleTicketSelect = (ticket: SupportTicket) => {
    setSelectedTicket(ticket.id)
    setSelectedAgencyId(ticket.agencyId)

    // Clear previous messages
    setMessages([])

    // Close and reopen connection with new ticketId
    if (socketRef.current) {
      socketRef.current.close()
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">{t("supportTitle")}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ticket List */}
        <div className="md:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>{t("activeTickets")}</CardTitle>
              <CardDescription>{t("ticketsDescription")}</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
                {tickets.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {t("noTickets")}
                  </div>
                ) : (
                  tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className={`p-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors ${
                        selectedTicket === ticket.id
                          ? "bg-gray-100 border-l-4 border-primary"
                          : ""
                      } ${ticket.hasNewMessages ? "border-l-4 border-yellow-500" : ""}`}
                      onClick={() => handleTicketSelect(ticket)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="font-medium truncate">
                          {ticket.subject}
                        </div>
                        <Badge
                          className={
                            ticket.status === "open"
                              ? "bg-green-100 text-green-800"
                              : ticket.status === "closed"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {ticket.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-700 mt-1 truncate">
                        {ticket.agencyName || t("agency")}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(ticket.createdAt)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="md:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>
                    {selectedTicket
                      ? tickets.find((t) => t.id === selectedTicket)?.subject ||
                        t("loading")
                      : t("selectTicket")}
                  </CardTitle>
                  <CardDescription>
                    {selectedTicket
                      ? tickets.find((t) => t.id === selectedTicket)
                          ?.agencyName || t("agency")
                      : t("selectTicketToStart")}
                  </CardDescription>
                </div>

                {selectedTicket && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const ticket = tickets.find(
                        (t) => t.id === selectedTicket
                      )
                      if (ticket && ticket.status !== "closed") {
                        closeTicket(selectedTicket, ticket.agencyId)
                      }
                    }}
                    disabled={
                      !selectedTicket ||
                      tickets.find((t) => t.id === selectedTicket)?.status ===
                        "closed"
                    }
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {t("closeTicket")}
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="flex-grow overflow-hidden">
              {!selectedTicket ? (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  {t("noTicketSelected")}
                </div>
              ) : (
                <div className="h-[50vh] overflow-y-auto pr-2">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.senderRole === "admin"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.senderRole === "admin"
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary"
                          }`}
                        >
                          <div className="text-sm">{message.content}</div>
                          <div className="text-xs mt-1 opacity-70">
                            {formatDate(message.createdAt)}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messageEndRef} />
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter>
              <div className="w-full flex items-center space-x-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={
                    selectedTicket ? t("typeMessage") : t("selectTicketFirst")
                  }
                  disabled={
                    !selectedTicket ||
                    !isConnected ||
                    tickets.find((t) => t.id === selectedTicket)?.status ===
                      "closed"
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault()
                      sendMessage()
                    }
                  }}
                />
                <Button
                  onClick={sendMessage}
                  disabled={
                    !messageInput.trim() ||
                    !selectedTicket ||
                    !isConnected ||
                    tickets.find((t) => t.id === selectedTicket)?.status ===
                      "closed"
                  }
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default AdminSupportChat
