/**
 * Configuration for chat connections
 */

// Determine the WebSocket URL based on environment
export const getWebSocketUrl = (): string => {
  // For production deployment with Render
  if (process.env.NEXT_PUBLIC_WS_URL) {
    console.log("Using WebSocket URL from env:", process.env.NEXT_PUBLIC_WS_URL)
    return process.env.NEXT_PUBLIC_WS_URL
  }

  console.log(
    "NEXT_PUBLIC_WS_URL environment variable not found, falling back to localhost"
  )

  // Local development fallback
  if (typeof window !== "undefined") {
    const isSecure = window.location.protocol === "https:"
    const wsProtocol = isSecure ? "wss:" : "ws:"
    return `${wsProtocol}//localhost:3001`
  }

  // Server-side rendering fallback
  return "ws://localhost:3001"
}

// Determine the HTTP API URL based on environment
export const getChatApiUrl = (): string => {
  // For production deployment with Render
  if (process.env.NEXT_PUBLIC_CHAT_API_URL) {
    console.log(
      "Using Chat API URL from env:",
      process.env.NEXT_PUBLIC_CHAT_API_URL
    )
    return process.env.NEXT_PUBLIC_CHAT_API_URL
  }

  console.log(
    "NEXT_PUBLIC_CHAT_API_URL environment variable not found, falling back to localhost"
  )

  // Local development fallback
  if (typeof window !== "undefined") {
    const isSecure = window.location.protocol === "https:"
    const httpProtocol = isSecure ? "https:" : "http:"
    return `${httpProtocol}//localhost:3002`
  }

  // Server-side rendering fallback
  return "http://localhost:3002"
}

export const getSupportWebSocketUrl = (): string => {
  if (process.env.NEXT_PUBLIC_SUPPORT_WS_URL) {
    console.log("Using Support WebSocket URL from env:", process.env.NEXT_PUBLIC_SUPPORT_WS_URL)
    return process.env.NEXT_PUBLIC_SUPPORT_WS_URL
  }
  
  console.log(
    "NEXT_PUBLIC_SUPPORT_WS_URL environment variable not found, falling back to localhost"
  )
  
  if (typeof window !== "undefined") {
    const isSecure = window.location.protocol === "https:"
    const wsProtocol = isSecure ? "wss:" : "ws:"
    return `${wsProtocol}//localhost:3003`
  }
  return "ws://localhost:3003"
}

export const getSupportChatApiUrl = (): string => {
  if (process.env.NEXT_PUBLIC_SUPPORT_API_URL) {
    console.log("Using Support API URL from env:", process.env.NEXT_PUBLIC_SUPPORT_API_URL)
    return process.env.NEXT_PUBLIC_SUPPORT_API_URL
  }
  
  console.log(
    "NEXT_PUBLIC_SUPPORT_API_URL environment variable not found, falling back to localhost"
  )
  
  if (typeof window !== "undefined") {
    const isSecure = window.location.protocol === "https:"
    const httpProtocol = isSecure ? "https:" : "http:"
    return `${httpProtocol}//localhost:3004`
  }
  return "http://localhost:3004"
}
