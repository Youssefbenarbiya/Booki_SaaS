"use client"

import { useState, useEffect } from "react"
import { MessageSquare, X, Send, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"

// Types for our chat messages
type MessageType = "bot" | "user"

interface Message {
  type: MessageType
  content: string
  options?: string[]
}

// Initial messages to guide the conversation
const initialMessages: Message[] = [
  {
    type: "bot",
    content: "👋 Hello! Welcome to Booki! How can I help you today?",
    options: [
      "I'm looking for hotels",
      "I want to rent a car",
      "I need help with booking",
      "Tell me about your services",
    ],
  },
]

// Responses for guided options
const responses: Record<string, Message> = {
  "I'm looking for hotels": {
    type: "bot",
    content: "Great! What city are you planning to visit?",
    options: ["New York", "London", "Paris", "Tokyo", "I'll type my destination"],
  },
  "I want to rent a car": {
    type: "bot",
    content: "Sure! When do you need the car and where would you like to pick it up?",
    options: ["Show me available cars", "I need help with dates", "I have specific requirements"],
  },
  "I need help with booking": {
    type: "bot",
    content: "I can help with that! What specifically do you need help with?",
    options: ["Changing dates", "Cancellation policy", "Payment issues", "Speak to customer service"],
  },
  "Tell me about your services": {
    type: "bot",
    content: "Booki offers hotel bookings, car rentals, and trip planning services. We have partnerships with thousands of hotels and car rental agencies worldwide to give you the best options for your travel needs.",
    options: ["Tell me more about hotels", "Tell me more about car rentals", "How do I make a booking?"],
  },
}

export function ChatScript() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [showChat, setShowChat] = useState(false)

  // Initialize chat with welcome message after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowChat(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  // Initialize messages when chat is opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages(initialMessages)
    }
  }, [isOpen, messages.length])

  const handleToggleChat = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setIsMinimized(false)
    }
  }

  const handleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  const handleOptionClick = (option: string) => {
    // Add the selected option as a user message
    const userMessage: Message = {
      type: "user",
      content: option,
    }

    setMessages((prev) => [...prev, userMessage])

    // Add the response after a short delay to simulate typing
    setTimeout(() => {
      const response = responses[option] || {
        type: "bot",
        content: "I'm not sure how to help with that. Could you try one of these options?",
        options: ["I'm looking for hotels", "I want to rent a car", "I need help with booking"],
      }

      setMessages((prev) => [...prev, response])
    }, 500)
  }

  const handleSendMessage = () => {
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      type: "user",
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")

    // Simulate bot response
    setTimeout(() => {
      const botMessage: Message = {
        type: "bot",
        content: `Thanks for your message. One of our agents will help you with "${input}" shortly. In the meantime, would you like to explore some options?`,
        options: ["Browse hotels", "Search for cars", "View top destinations"],
      }

      setMessages((prev) => [...prev, botMessage])
    }, 1000)
  }

  if (!showChat) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {isOpen && (
        <div
          className={`bg-white rounded-lg shadow-lg mb-2 w-80 sm:w-96 transition-all duration-300 ease-in-out ${
            isMinimized ? "h-14" : "h-96"
          }`}
        >
          {/* Chat header */}
          <div
            className="bg-orange-400 text-black px-4 py-3 rounded-t-lg flex justify-between items-center cursor-pointer"
            onClick={handleMinimize}
          >
            <div className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              <h3 className="font-medium">Booki Assistant</h3>
            </div>
            <div className="flex items-center">
              {isMinimized ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              <X size={20} className="ml-2" onClick={(e) => {
                e.stopPropagation()
                setIsOpen(false)
              }} />
            </div>
          </div>

          {/* Chat messages */}
          {!isMinimized && (
            <>
              <div className="p-4 overflow-y-auto h-[calc(100%-110px)]">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`mb-4 flex ${
                      message.type === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.type === "bot" && (
                      <Avatar className="h-8 w-8 bg-orange-100 mr-2 flex items-center justify-center">
                        <MessageSquare className="h-4 w-4 text-orange-500" />
                      </Avatar>
                    )}
                    <div
                      className={`rounded-lg px-4 py-2 max-w-[70%] ${
                        message.type === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      {message.options && (
                        <div className="mt-2 space-y-1">
                          {message.options.map((option) => (
                            <button
                              key={option}
                              onClick={() => handleOptionClick(option)}
                              className="text-xs bg-white text-blue-500 hover:bg-blue-50 rounded px-2 py-1 block w-full text-left"
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input area */}
              <div className="border-t p-3 flex">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 focus:ring-orange-400 focus:border-orange-400"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSendMessage()
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleSendMessage}
                  className="ml-2 bg-orange-400 hover:bg-orange-500 text-black"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Chat button */}
      <Button
        onClick={handleToggleChat}
        className={`rounded-full h-12 w-12 flex items-center justify-center shadow-lg transition-all ${
          isOpen ? "bg-gray-200 text-gray-700" : "bg-orange-400 hover:bg-orange-500 text-black"
        }`}
      >
        <MessageSquare />
      </Button>
    </div>
  )
} 