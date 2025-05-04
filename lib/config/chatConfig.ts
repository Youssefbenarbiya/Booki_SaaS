/**
 * Configuration for chat connections
 */

// Determine the WebSocket URL based on environment
export const getWebSocketUrl = (): string => {
  // For production deployment with Render
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL;
  }
  
  // Local development fallback
  if (typeof window !== 'undefined') {
    const isSecure = window.location.protocol === 'https:';
    const wsProtocol = isSecure ? 'wss:' : 'ws:';
    return `${wsProtocol}//localhost:3001`;
  }
  
  // Server-side rendering fallback
  return 'ws://localhost:3001';
};

// Determine the HTTP API URL based on environment
export const getChatApiUrl = (): string => {
  // For production deployment with Render
  if (process.env.NEXT_PUBLIC_CHAT_API_URL) {
    return process.env.NEXT_PUBLIC_CHAT_API_URL;
  }
  
  // Local development fallback
  if (typeof window !== 'undefined') {
    const isSecure = window.location.protocol === 'https:';
    const httpProtocol = isSecure ? 'https:' : 'http:';
    return `${httpProtocol}//localhost:3002`;
  }
  
  // Server-side rendering fallback
  return 'http://localhost:3002';
}; 