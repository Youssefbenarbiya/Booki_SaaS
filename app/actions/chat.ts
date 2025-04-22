"use server"

import db from "@/db/drizzle"
import {
  hotel,
  room,
  roomAvailability,
  trips,
  cars,
  user,
  roomBookings,
  carBookings,
  tripBookings,
} from "@/db/schema"
import { eq, and, gte, lte, like, ilike, or } from "drizzle-orm"
import { revalidatePath } from "next/cache"

// Types for messages and responses
export type MessageType = "bot" | "user"

export interface Message {
  type: MessageType
  content: string
  options?: string[]
}

export interface ChatResult {
  message: string
  hotels?: any[]
  trips?: any[]
  cars?: any[]
  rooms?: any[]
  bookings?: any[]
  options?: string[]
}

// Main chat action that handles user input
export async function chatAction(
  userInput: string,
  cursor: number = 0,
  limit: number = 3
): Promise<ChatResult> {
  try {
    // Basic intent parsing - would be replaced with a more sophisticated NLP solution
    // This is just a stub with simple keyword matching
    const intent = parseIntent(userInput.toLowerCase())
    
    // Handle based on detected intent
    switch (intent.type) {
      case "hotel_search":
        return await handleHotelSearch(intent, cursor, limit)
      case "trip_search":
        return await handleTripSearch(intent, cursor, limit)
      case "car_search":
        return await handleCarSearch(intent, cursor, limit)
      case "room_availability":
        return await handleRoomAvailability(intent, cursor, limit)
      case "booking_info":
        return await handleBookingInfo(intent, cursor, limit)
      default:
        return {
          message: "I'm not sure how to help with that. Would you like to explore some options?",
          options: [
            "Show me hotels in Paris",
            "I need a car rental in New York",
            "Are there any trips to Tokyo next month?",
            "Check room availability in London",
          ],
        }
    }
  } catch (error) {
    console.error("Chat action error:", error)
    return {
      message: "Sorry, I encountered an error while processing your request. Could you try again?",
      options: ["Show me hotels", "Find a car rental", "Search for trips"],
    }
  }
}

// Simple intent parser - would be replaced with a real NLP solution
interface Intent {
  type: string
  location?: string
  startDate?: Date
  endDate?: Date
  category?: string
  query?: string
}

function parseIntent(input: string): Intent {
  // This is a very basic intent parser that uses keyword matching
  // In a real application, you would use a more sophisticated NLP solution
  
  // Extract location using simple pattern matching
  let location: string | undefined
  const locationMatch = input.match(/in ([a-zA-Z\s]+)/)
  if (locationMatch) {
    location = locationMatch[1].trim()
  }
  
  // Simple date extraction (very naive implementation)
  let startDate: Date | undefined
  let endDate: Date | undefined
  
  if (input.includes("next week")) {
    const today = new Date()
    startDate = new Date(today.setDate(today.getDate() + 7))
    endDate = new Date(today.setDate(today.getDate() + 14))
  } else if (input.includes("next month")) {
    const today = new Date()
    startDate = new Date(today.setMonth(today.getMonth() + 1))
    endDate = new Date(today.setMonth(today.getMonth() + 2))
  }
  
  // Determine intent type based on keywords
  if (input.includes("hotel") || input.includes("hotels") || input.includes("stay") || input.includes("accommodation")) {
    return { 
      type: "hotel_search", 
      location, 
      startDate, 
      endDate 
    }
  } else if (input.includes("trip") || input.includes("trips") || input.includes("travel") || input.includes("tour")) {
    return { 
      type: "trip_search", 
      location, 
      startDate, 
      endDate 
    }
  } else if (input.includes("car") || input.includes("cars") || input.includes("rental") || input.includes("rent a car")) {
    return { 
      type: "car_search", 
      location, 
      startDate, 
      endDate 
    }
  } else if (input.includes("room") || input.includes("availability") || input.includes("book a room")) {
    return { 
      type: "room_availability", 
      location, 
      startDate, 
      endDate 
    }
  } else if (input.includes("booking") || input.includes("reservation") || input.includes("my bookings")) {
    return { 
      type: "booking_info", 
      query: input 
    }
  }
  
  return { type: "unknown" }
}

// Handler functions for different intents

async function handleHotelSearch(
  intent: Intent,
  cursor: number,
  limit: number
): Promise<ChatResult> {
  try {
    // Build conditions
    const conditions = [];
    
    if (intent.location) {
      conditions.push(
        or(
          ilike(hotel.city, `%${intent.location}%`),
          ilike(hotel.country, `%${intent.location}%`)
        )
      );
    }
    
    // Apply all conditions at once
    const hotels = await db.select().from(hotel)
      .where(conditions.length ? and(...conditions) : undefined)
      .offset(cursor)
      .limit(limit);
    
    if (hotels.length === 0) {
      return {
        message: `I couldn't find any hotels${
          intent.location ? ` in ${intent.location}` : ""
        }. Would you like to try a different location?`,
        options: ["Show me hotels in Paris", "Show me hotels in London", "Show me hotels in Tokyo"],
      }
    }
    
    return {
      message: `Here are some hotels${
        intent.location ? ` in ${intent.location}` : ""
      } that you might like:`,
      hotels,
      options: [
        "Show me more hotels",
        "I want to check room availability",
        "Show me car rentals instead",
      ],
    }
  } catch (error) {
    console.error("Hotel search error:", error)
    return {
      message: "Sorry, I couldn't search for hotels right now. Please try again later.",
      options: ["Search for trips", "Find a car rental"],
    }
  }
}

async function handleTripSearch(
  intent: Intent,
  cursor: number,
  limit: number
): Promise<ChatResult> {
  try {
    // Build conditions array
    const conditions = [];
    
    if (intent.location) {
      conditions.push(ilike(trips.destination, `%${intent.location}%`));
    }
    
    if (intent.startDate) {
      // Convert Date to ISO string date format
      conditions.push(gte(trips.startDate, intent.startDate.toISOString().split('T')[0]));
    }
    
    if (intent.endDate) {
      conditions.push(lte(trips.endDate, intent.endDate.toISOString().split('T')[0]));
    }
    
    // Apply all conditions at once
    const tripsResult = await db.select().from(trips)
      .where(conditions.length ? and(...conditions) : undefined)
      .offset(cursor)
      .limit(limit);
    
    if (tripsResult.length === 0) {
      return {
        message: `I couldn't find any trips${
          intent.location ? ` to ${intent.location}` : ""
        }${intent.startDate ? " for your selected dates" : ""}. Would you like to try different criteria?`,
        options: [
          "Show me trips to Paris",
          "Show me trips next month",
          "Show me hotels instead",
        ],
      }
    }
    
    return {
      message: `Here are some trips${
        intent.location ? ` to ${intent.location}` : ""
      } that you might enjoy:`,
      trips: tripsResult,
      options: [
        "Show me more trips",
        "Show me hotels instead",
        "I want to rent a car",
      ],
    }
  } catch (error) {
    console.error("Trip search error:", error)
    return {
      message: "Sorry, I couldn't search for trips right now. Please try again later.",
      options: ["Search for hotels", "Find a car rental"],
    }
  }
}

async function handleCarSearch(
  intent: Intent,
  cursor: number,
  limit: number
): Promise<ChatResult> {
  try {
    const conditions = [];
    
    if (intent.location) {
      conditions.push(ilike(cars.location, `%${intent.location}%`));
    }
    
    // Always add availability condition
    conditions.push(eq(cars.isAvailable, true));
    
    // Apply all conditions at once
    const carsResult = await db.select().from(cars)
      .where(and(...conditions))
      .offset(cursor)
      .limit(limit);
    
    if (carsResult.length === 0) {
      return {
        message: `I couldn't find any available cars${
          intent.location ? ` in ${intent.location}` : ""
        }. Would you like to try a different location?`,
        options: [
          "Show me cars in New York",
          "Show me cars in London",
          "Show me hotels instead",
        ],
      }
    }
    
    return {
      message: `Here are some available cars${
        intent.location ? ` in ${intent.location}` : ""
      }:`,
      cars: carsResult,
      options: [
        "Show me more cars",
        "Show me luxury cars",
        "I want to check hotels",
      ],
    }
  } catch (error) {
    console.error("Car search error:", error)
    return {
      message: "Sorry, I couldn't search for car rentals right now. Please try again later.",
      options: ["Search for hotels", "Find a trip"],
    }
  }
}

async function handleRoomAvailability(
  intent: Intent,
  cursor: number,
  limit: number
): Promise<ChatResult> {
  try {
    // First get available rooms based on date range
    // This is a simplified query - in reality you would join with roomAvailability
    // and check for conflicts with existing bookings
    
    let query = db.select().from(room)
    
    // For a real implementation, you would join with hotel and filter by location
    // For now we'll just limit results
    
    // Apply pagination
    const rooms = await query.offset(cursor).limit(limit)
    
    if (rooms.length === 0) {
      return {
        message: "I couldn't find any available rooms for your criteria. Would you like to try different dates?",
        options: [
          "Check next week",
          "Check next month",
          "Show me hotels instead",
        ],
      }
    }
    
    return {
      message: "Here are some available rooms that match your criteria:",
      rooms,
      options: [
        "Show me more rooms",
        "Show me hotels instead",
        "I want to book a room",
      ],
    }
  } catch (error) {
    console.error("Room availability error:", error)
    return {
      message: "Sorry, I couldn't check room availability right now. Please try again later.",
      options: ["Search for hotels", "Find a trip"],
    }
  }
}

async function handleBookingInfo(
  intent: Intent,
  cursor: number,
  limit: number
): Promise<ChatResult> {
  // In a real app, you would get the user ID from the session
  // For this example, we'll use a placeholder
  const userId = "user-placeholder-id"
  
  try {
    // Get the user's hotel bookings
    const hotelBookings = await db
      .select()
      .from(roomBookings)
      .where(eq(roomBookings.userId, userId))
      .limit(limit)
    
    // Get the user's car bookings
    const carRentals = await db
      .select()
      .from(carBookings)
      .where(eq(carBookings.user_id, userId))
      .limit(limit)
    
    // Get the user's trip bookings
    const tripReservations = await db
      .select()
      .from(tripBookings)
      .where(eq(tripBookings.userId, userId))
      .limit(limit)
    
    // Combine all bookings
    const allBookings = [
      ...hotelBookings.map(b => ({ ...b, type: 'hotel' })),
      ...carRentals.map(b => ({ ...b, type: 'car' })),
      ...tripReservations.map(b => ({ ...b, type: 'trip' }))
    ]
    
    if (allBookings.length === 0) {
      return {
        message: "You don't have any bookings yet. Would you like to explore some options?",
        options: [
          "Show me hotels",
          "Show me car rentals",
          "Show me trips",
        ],
      }
    }
    
    return {
      message: "Here are your current bookings:",
      bookings: allBookings,
      options: [
        "Show me my hotel bookings",
        "Show me my car rentals",
        "Show me my trip reservations",
      ],
    }
  } catch (error) {
    console.error("Booking info error:", error)
    return {
      message: "Sorry, I couldn't retrieve your booking information right now. Please try again later.",
      options: ["Show me hotels", "Show me car rentals"],
    }
  }
}
