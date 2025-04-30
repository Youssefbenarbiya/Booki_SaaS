#!/usr/bin/env bun

// This script runs the WebSocket chat server as a standalone process

import { startServers } from "./chat-server"

console.log("Starting chat servers...")
const servers = startServers();

console.log("Chat server started!")
console.log("WebSocket server is running on ws://localhost:3001")
console.log("HTTP API server is running on http://localhost:3002")
console.log("Press CTRL+C to stop the servers")

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