"use client"

import { useState, useEffect } from "react"
import { MessageSquare, X, Send, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { useChatBot } from "@/app/hooks/useChatBot"
import { ChatResults } from "@/components/chat/ChatResults"
import { Message } from "@/components/chat/chat"

// Initial messages to guide the conversation
const initialMessages = [
  {
    type: "bot" as const,
    content: "👋 Hello! Welcome to Booki! How can I help you today?",
    options: [
      "I'm looking for hotels",
      "I want to rent a car",
      "I need help with booking",
      "Tell me about your services",
    ],
  },
]

// Extend the Message type to include optional data property
interface ExtendedMessage extends Message {
  data?: {
    hotels?: any[]
    trips?: any[]
    cars?: any[]
    rooms?: any[]
    bookings?: any[]
  }
}

export function ChatScript() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [input, setInput] = useState("")
  const [showChat, setShowChat] = useState(false)
  
  // Use the chat bot hook
  const { messages, loading, sendMessage, handleOptionClick, loadMore } = useChatBot(initialMessages)

  // Initialize chat with welcome message after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowChat(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleToggleChat = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setIsMinimized(false)
    }
  }

  const handleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  const handleSendMessage = () => {
    if (!input.trim()) return
    
    // Use the sendMessage function from the hook
    sendMessage(input)
    setInput("")
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
                      
                      {/* Display options if available */}
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
                      
                      {/* Render search results if available */}
                      {message.type === "bot" && 'data' in message && (message as ExtendedMessage).data && (
                        <ChatResults 
                          data={(message as ExtendedMessage).data!} 
                          onLoadMore={loadMore} 
                        />
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Loading indicator */}
                {loading && (
                  <div className="flex justify-start mb-4">
                    <Avatar className="h-8 w-8 bg-orange-100 mr-2 flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-orange-500" />
                    </Avatar>
                    <div className="bg-gray-100 text-gray-800 rounded-lg px-4 py-2 max-w-[70%]">
                      <p className="text-sm flex items-center">
                        <span className="animate-pulse">Thinking</span>
                        <span className="animate-[bounce_1s_infinite_200ms]">.</span>
                        <span className="animate-[bounce_1s_infinite_400ms]">.</span>
                        <span className="animate-[bounce_1s_infinite_600ms]">.</span>
                      </p>
                    </div>
                  </div>
                )}
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
                  disabled={loading}
                />
                <Button
                  type="button"
                  onClick={handleSendMessage}
                  className="ml-2 bg-orange-400 hover:bg-orange-500 text-black"
                  disabled={loading}
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