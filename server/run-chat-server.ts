#!/usr/bin/env bun

// This script runs the WebSocket chat server as a standalone process

import server from "./chat-server"

console.log("Chat server started!")
console.log("Server is listening for WebSocket connections on ws://localhost:3001")
console.log("Press CTRL+C to stop the server")

// Add signal handling for graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down chat server...")
  process.exit(0)
})

process.on("SIGTERM", () => {
  console.log("Shutting down chat server...")
  process.exit(0)
})

// Keep the process running
process.stdin.resume() 