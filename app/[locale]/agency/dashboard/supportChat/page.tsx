"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "@/auth-client";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Send, PlusCircle } from "lucide-react";

// Define types
interface SupportTicket {
  id: string;
  subject: string;
  status: "open" | "closed" | "pending";
  agencyId: string;
  createdAt: string;
}

interface SupportMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  senderRole: "agency" | "admin";
  ticketId?: string;
  tempId?: string;
}

// Default translations as fallback
const defaultTranslations = {
  supportTitle: "Agency Support Chat",
  yourTickets: "Your Support Tickets",
  ticketsDescription: "View and manage your support requests",
  newTicket: "New Support Ticket",
  createTicket: "Create Support Ticket",
  ticketSubject: "Subject",
  ticketSubjectPlaceholder: "Describe your issue briefly",
  cancel: "Cancel",
  createButton: "Create Ticket",
  noTickets: "You have no support tickets yet",
  loading: "Loading...",
  selectTicket: "Select a ticket",
  conversationWith: "Conversation with support staff",
  selectTicketToStart: "Select a ticket to start chatting",
  noTicketSelected: "No ticket selected. Please select a ticket from the list.",
  typeMessage: "Type your message...",
  selectTicketFirst: "Select a ticket to send messages",
  ticketCreated: "Support ticket created successfully",
  ticketClosed: "Ticket has been closed",
  initialMessage: "Hello, I need help with: {subject}"
};

const SupportChat = () => {
  // Create a custom translation function that falls back to our defaults
  const tBase = useTranslations("SupportChat");
  const t = (key: keyof typeof defaultTranslations, params?: Record<string, string>) => {
    try {
      if (params) {
        return tBase(key, params);
      }
      return tBase(key);
    } catch {
      // If translation is missing, use our default
      if (params && key === "initialMessage") {
        // Handle the special case for initialMessage with subject parameter
        return defaultTranslations[key].replace("{subject}", params.subject || "");
      }
      return defaultTranslations[key as keyof typeof defaultTranslations] || key;
    }
  };

  const { data: session } = useSession();
  const userId = session?.user?.id;
  
  // Refs
  const socketRef = useRef<WebSocket | null>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  
  // State
  const [isConnected, setIsConnected] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [newTicketSubject, setNewTicketSubject] = useState("");
  const [isNewTicketDialogOpen, setIsNewTicketDialogOpen] = useState(false);

  // Connect to WebSocket
  useEffect(() => {
    if (!userId) return;

    const connectWebSocket = () => {
      // Get the WebSocket URL from environment variables or use default
      const wsUrl = process.env.NEXT_PUBLIC_SUPPORT_WS_URL || "ws://localhost:3003";
      
      // Create WebSocket connection with parameters
      const socket = new WebSocket(
        `${wsUrl}?userId=${userId}&userRole=agency${selectedTicket ? `&ticketId=${selectedTicket}` : ""}`
      );

      socketRef.current = socket;

      socket.onopen = () => {
        console.log("Support WebSocket connected");
        setIsConnected(true);
        setLoading(false);
      };

      socket.onclose = () => {
        console.log("Support WebSocket disconnected");
        setIsConnected(false);
        // Try to reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };

      socket.onerror = (error) => {
        console.error("Support WebSocket error:", error);
        socket.close();
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("Support WebSocket message:", data);

        if (data.type === "connection") {
          console.log("Connection established:", data.data);
        } else if (data.type === "tickets") {
          setTickets(data.tickets);
        } else if (data.type === "history") {
          setMessages(data.messages);
          setTimeout(() => messageEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        } else if (data.type === "message") {
          // If there's an array of messages, append them all
          if (Array.isArray(data.messages)) {
            setMessages(prev => [...prev, ...data.messages]);
          } 
          // If it's a single message, append it
          else if (data.data) {
            setMessages(prev => {
              // Replace temp message if it exists
              if (data.data.tempId) {
                return prev.map(msg => 
                  msg.tempId === data.data.tempId ? data.data : msg
                );
              }
              // Otherwise just add the message
              return [...prev, data.data];
            });
          }
          setTimeout(() => messageEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        } else if (data.type === "ticket_created") {
          toast.success(t("ticketCreated"));
          setTickets(prev => [data.ticket, ...prev]);
          setSelectedTicket(data.ticket.id);
          setIsNewTicketDialogOpen(false);
        } else if (data.type === "ticket_closed") {
          toast.info(t("ticketClosed"));
          setTickets(prev => 
            prev.map(ticket => 
              ticket.id === data.ticket.id 
                ? { ...ticket, status: "closed" } 
                : ticket
            )
          );
        } else if (data.type === "error") {
          toast.error(data.data.error);
        }
      };
    };

    connectWebSocket();

    // Cleanup on component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [userId, selectedTicket]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const sendMessage = () => {
    if (!messageInput.trim() || !isConnected || !socketRef.current) return;

    // Create a temporary ID for optimistic UI update
    const tempId = `temp_${Date.now()}`;
    
    // Create temp message for immediate display
    const tempMessage: SupportMessage = {
      id: tempId,
      tempId,
      senderId: userId!,
      receiverId: "admin", // All messages from agencies go to admin
      content: messageInput,
      type: "text",
      isRead: false,
      createdAt: new Date().toISOString(),
      senderRole: "agency",
      ticketId: selectedTicket || undefined
    };

    // Optimistically add to messages
    setMessages(prev => [...prev, tempMessage]);
    
    // Send message via WebSocket
    socketRef.current.send(
      JSON.stringify({
        type: "message",
        data: {
          content: messageInput,
          ticketId: selectedTicket,
          tempId
        }
      })
    );

    // Clear input
    setMessageInput("");
  };

  // Create new ticket
  const createTicket = () => {
    if (!newTicketSubject.trim() || !isConnected || !socketRef.current) return;

    // Send new ticket request via WebSocket with first message
    socketRef.current.send(
      JSON.stringify({
        type: "message",
        data: {
          subject: newTicketSubject,
          content: t("initialMessage", { subject: newTicketSubject })
        }
      })
    );

    // Clear input (dialog will close when we receive ticket_created event)
    setNewTicketSubject("");
  };

  // Select ticket to view
  const handleTicketSelect = (ticketId: string) => {
    setSelectedTicket(ticketId);
    
    // Clear previous messages
    setMessages([]);
    
    // Close and reopen connection with new ticketId
    if (socketRef.current) {
      socketRef.current.close();
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">{t("supportTitle")}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ticket List */}
        <div className="md:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>{t("yourTickets")}</CardTitle>
              <CardDescription>{t("ticketsDescription")}</CardDescription>
              
              <Dialog open={isNewTicketDialogOpen} onOpenChange={setIsNewTicketDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full mt-2">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {t("newTicket")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("createTicket")}</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <label className="text-sm font-medium mb-2 block">{t("ticketSubject")}</label>
                    <Textarea 
                      value={newTicketSubject}
                      onChange={(e) => setNewTicketSubject(e.target.value)}
                      placeholder={t("ticketSubjectPlaceholder")}
                      rows={3}
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsNewTicketDialogOpen(false)}>
                      {t("cancel")}
                    </Button>
                    <Button onClick={createTicket} disabled={!newTicketSubject.trim()}>
                      {t("createButton")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                {tickets.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {t("noTickets")}
                  </div>
                ) : (
                  tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className={`p-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors ${
                        selectedTicket === ticket.id ? "bg-gray-100 border-l-4 border-primary" : ""
                      }`}
                      onClick={() => handleTicketSelect(ticket.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="font-medium truncate">{ticket.subject}</div>
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
            <CardHeader>
              <CardTitle>
                {selectedTicket 
                  ? tickets.find(t => t.id === selectedTicket)?.subject || t("loading") 
                  : t("selectTicket")}
              </CardTitle>
              <CardDescription>
                {selectedTicket 
                  ? t("conversationWith") 
                  : t("selectTicketToStart")}
              </CardDescription>
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
                          message.senderRole === "agency" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.senderRole === "agency"
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
                  placeholder={selectedTicket ? t("typeMessage") : t("selectTicketFirst")}
                  disabled={!selectedTicket || !isConnected}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!messageInput.trim() || !selectedTicket || !isConnected}
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
  );
};

export default SupportChat;
