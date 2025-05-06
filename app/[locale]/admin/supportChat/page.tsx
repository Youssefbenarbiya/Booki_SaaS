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
  const [forceUpdateCounter, setForceUpdateCounter] = useState(0)

  // Connect to WebSocket
  useEffect(() => {
    if (!userId) return;

    // Use the correct type for timers in Next.js
    let reconnectTimer: ReturnType<typeof setTimeout>;
    
    const connectWebSocket = () => {
      // Clear any existing WebSocket
      if (socketRef.current) {
        try {
          socketRef.current.close();
        } catch (e) {
          console.error("Error closing existing socket:", e);
        }
      }
      
      // Get the WebSocket URL from environment variables or use default
      const wsUrl = process.env.NEXT_PUBLIC_SUPPORT_WS_URL || "ws://localhost:3003";

      // Create a single WebSocket connection without ticket ID in the URL
      // This ensures we maintain one connection for all tickets
      const socket = new WebSocket(`${wsUrl}?userId=${userId}&userRole=admin`);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("Admin Support WebSocket connected");
        setIsConnected(true);
        setLoading(false);
        
        // If a ticket is already selected when connection opens, request its messages
        if (selectedTicket) {
          console.log(`Requesting initial messages for ticket ${selectedTicket}`);
          socket.send(
            JSON.stringify({
              type: "get_ticket_history",
              ticketId: selectedTicket
            })
          );
        }
      };

      socket.onclose = () => {
        console.log("Admin Support WebSocket disconnected");
        setIsConnected(false);
        
        // Try to reconnect after 3 seconds
        clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(connectWebSocket, 3000);
      };

      socket.onerror = (error) => {
        console.error("Admin Support WebSocket error:", error)
        socket.close()
      }

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data)
        console.log("Admin Support WebSocket message received:", data)

        if (data.type === "connection") {
          console.log("Connection established:", data.data)
          setIsConnected(true)
        } else if (data.type === "tickets") {
          console.log(`Received ${data.tickets.length} tickets in update`)
          
          setTickets((prev: SupportTicket[]) => {
            const newIds = data.tickets.map((ticket: SupportTicket) => ticket.id);
            const prevIds = prev.map((ticket: SupportTicket) => ticket.id);
            const added = newIds.filter((id: string) => !prevIds.includes(id));
            const removed = prevIds.filter((id: string) => !newIds.includes(id));
            
            if (added.length > 0) console.log("New tickets added:", added);
            if (removed.length > 0) console.log("Tickets removed:", removed);
            
            const withNewMessages = data.tickets
              .filter((ticket: SupportTicket) => ticket.hasNewMessages)
              .map((ticket: SupportTicket) => ticket.id);
            
            if (withNewMessages.length > 0) {
              console.log("Tickets with new messages:", withNewMessages);
            }
            
            return data.tickets;
          })
        } else if (data.type === "history") {
          console.log(`Received ${data.messages.length} messages in history`)
          setMessages((prev) => {
            if (prev.length !== data.messages.length) {
              console.log(`Replacing ${prev.length} messages with ${data.messages.length} from history`)
            }
            return data.messages
          })
          
          setTimeout(() => {
            if (messageEndRef.current) {
              console.log("Scrolling to latest message in history")
              messageEndRef.current.scrollIntoView({ behavior: "smooth" })
            }
          }, 100)
        } else if (data.type === "message") {
          console.log("Received message:", data)
          
          if (Array.isArray(data.messages)) {
            console.log(`Received ${data.messages.length} messages in batch`)
            setMessages((prev) => [...prev, ...data.messages])
          } else if (data.data) {
            console.log(`Received message for ticket: ${data.data.ticketId}, current selected: ${selectedTicket}`)
            
            if (data.data.ticketId === selectedTicket) {
              console.log("Message is for current ticket, adding to conversation")
              
              // Force a re-render after message processing
              setTimeout(() => setForceUpdateCounter(prev => prev + 1), 100);
              
              const senderInfo = data.data.senderRole === "agency" 
                ? (tickets.find(t => t.id === data.data.ticketId)?.agencyName || "Agency") 
                : "Admin"
              
              console.log(`New message from ${senderInfo}: ${data.data.content}`)
              
              setMessages((prev) => {
                const existingMsgIndex = prev.findIndex(
                  (msg) =>
                    msg.id === data.data.id ||
                    (data.data.tempId && msg.tempId === data.data.tempId)
                )

                if (existingMsgIndex !== -1) {
                  console.log(`Replacing existing message at index ${existingMsgIndex}`)
                  const newMessages = [...prev]
                  newMessages[existingMsgIndex] = data.data
                  return newMessages
                }

                console.log("Adding new message to conversation")
                return [...prev, data.data]
              })

              if (data.data.senderRole === "agency") {
                toast.info(`New message from ${senderInfo} in current conversation`)
              }
              
              setTimeout(() => {
                if (messageEndRef.current) {
                  console.log("Scrolling to new message")
                  messageEndRef.current.scrollIntoView({ behavior: "smooth" })
                }
              }, 100)
            } else {
              console.log(`Message is for another ticket: ${data.data.ticketId}`)
              
              const ticketDetails = tickets.find(t => t.id === data.data.ticketId)
              if (ticketDetails) {
                console.log(`Found ticket: ${ticketDetails.subject}`)
                
                toast.info(`New message from ${ticketDetails.agencyName || "Agency"}`)
                
                setTickets(prev => 
                  prev.map(ticket => 
                    ticket.id === data.data.ticketId
                      ? { ...ticket, hasNewMessages: true }
                      : ticket
                  )
                )
                
                console.log(`Marked ticket ${data.data.ticketId} as having new messages`)
              } else {
                console.log(`Could not find ticket ${data.data.ticketId} in current list`)
              }
            }
          }
        } else if (data.type === "new_ticket") {
          console.log("Received new ticket notification:", data.ticket)
          toast.success(`New support ticket from ${data.ticket.agencyName || "Agency"}`)
          
          setTickets(prev => {
            if (prev.some(t => t.id === data.ticket.id)) {
              console.log(`Ticket ${data.ticket.id} already exists in list`)
              return prev
            }
            
            console.log(`Adding new ticket ${data.ticket.id} to list`)
            return [data.ticket, ...prev]
          })
        } else if (data.type === "ticket_closed") {
          console.log("Received ticket closed notification:", data.ticket)
          toast.info("Ticket has been closed")
          
          setTickets(prev =>
            prev.map(ticket =>
              ticket.id === data.ticket.id
                ? { ...ticket, status: "closed" }
                : ticket
            )
          )
        } else if (data.type === "error") {
          console.error("Received error from server:", data.data?.error || data)
          toast.error(data.data?.error || "An error occurred")
        }
      }
    }

    connectWebSocket()

    // Cleanup on component unmount
    return () => {
      clearTimeout(reconnectTimer)
      if (socketRef.current) {
        socketRef.current.close()
      }
    }
  }, [userId]) // Only depend on userId to maintain persistent connection

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Add a useEffect that responds to forceUpdateCounter changes
  useEffect(() => {
    if (forceUpdateCounter > 0) {
      console.log(`Force update triggered (${forceUpdateCounter}), ensuring UI is current`);
      
      // Scroll to bottom of messages
      if (messageEndRef.current) {
        messageEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [forceUpdateCounter]);

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
    console.log(`Selecting ticket: ${ticket.id}, agency: ${ticket.agencyId}`);
    
    // Update selected ticket and agency IDs
    setSelectedTicket(ticket.id);
    setSelectedAgencyId(ticket.agencyId);

    // Clear previous messages while we fetch new ones
    setMessages([]);

    // If we have a connected socket, request the messages for this ticket
    if (socketRef.current && isConnected) {
      console.log(`Requesting messages for ticket ${ticket.id} via existing connection`);
      
      try {
        // Send a request for the ticket history through the existing connection
        socketRef.current.send(
          JSON.stringify({
            type: "get_ticket_history",
            ticketId: ticket.id
          })
        );
        
        // Mark this ticket as read by removing the hasNewMessages flag
        setTickets(prev =>
          prev.map(t => 
            t.id === ticket.id 
              ? { ...t, hasNewMessages: false }
              : t
          )
        );
      } catch (error) {
        console.error("Error sending ticket history request:", error);
        toast.error("Failed to fetch messages. Please refresh the page.");
      }
    } else {
      console.warn("Socket not connected, cannot fetch messages");
      // Instead of reconnecting, just show an error
      toast.error("Connection lost. Please refresh the page to reconnect.");
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
                  
                  {/* WebSocket Debug Indicator */}
                  <div className="flex items-center mt-1 text-xs">
                    <div 
                      className={`w-2 h-2 rounded-full mr-1 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} 
                    />
                    <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                      {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                    <span className="ml-2 text-gray-400">
                      {messages.length > 0 ? `${messages.length} messages` : 'No messages'}
                    </span>
                    <span className="ml-2 text-gray-400">
                      Updates: {forceUpdateCounter}
                    </span>
                    <button 
                      onClick={() => {
                        if (socketRef.current && selectedTicket) {
                          console.log("Manually requesting ticket messages");
                          socketRef.current.send(
                            JSON.stringify({
                              type: "get_ticket_history",
                              ticketId: selectedTicket
                            })
                          );
                          setForceUpdateCounter(prev => prev + 1);
                          toast.info("Refreshing messages...");
                        }
                      }}
                      className="ml-2 text-blue-500 hover:text-blue-700"
                      disabled={!isConnected || !selectedTicket}
                    >
                      ↻ Refresh
                    </button>
                  </div>
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
