#!/usr/bin/env bun
/* eslint-disable @typescript-eslint/no-unused-vars */

// Load environment variables from .env file first
import 'dotenv/config';

// This script runs the WebSocket chat server as a standalone process

import { startServers } from "./chat-server"

// Get port from environment variable or use default
const WS_PORT = process.env.WS_PORT || process.env.PORT || 3001
const HTTP_PORT = process.env.HTTP_PORT || Number(WS_PORT) + 1 || 3002

console.log("Starting chat servers...")
console.log("Environment variables loaded:", {
  WS_PORT,
  HTTP_PORT,
  DATABASE_URL: process.env.DATABASE_URL ? "Set (value hidden)" : "Not set",
  NODE_ENV: process.env.NODE_ENV
})

const servers = startServers({
  wsPort: Number(WS_PORT),
  httpPort: Number(HTTP_PORT)
});

console.log("Chat server started!")
console.log(`WebSocket server is running on port ${WS_PORT}`)
console.log(`HTTP API server is running on port ${HTTP_PORT}`)
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