"use client";

import { useState, useCallback, useRef } from "react"
import { chatAction, Message, ChatResult } from "@/components/chat/chat"

export interface UseChatBotResult {
  messages: Message[];
  loading: boolean;
  sendMessage: (message: string) => Promise<void>;
  handleOptionClick: (option: string) => Promise<void>;
  loadMore: (type: string) => Promise<void>;
}

export function useChatBot(initialMessages: Message[] = []): UseChatBotResult {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [loading, setLoading] = useState(false);
  const cursorsRef = useRef<Record<string, number>>({
    hotels: 0,
    trips: 0,
    cars: 0,
    rooms: 0,
    bookings: 0,
  });

  // Helper function to convert ChatResult to Message
  const createBotMessageFromResult = useCallback(
    (result: ChatResult): Message => {
      return {
        type: "bot",
        content: result.message,
        options: result.options,
      };
    },
    []
  );

  // Handle sending a message to the chatbot
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      // Add user message to the chat
      const userMessage: Message = {
        type: "user",
        content,
      };

      setMessages((prev) => [...prev, userMessage]);
      setLoading(true);

      try {
        // Call the server action with the user's message
        const result = await chatAction(content, 0, 3);

        // Create a basic message from the result
        const botMessage = createBotMessageFromResult(result);

        // Update the chat with the bot's response
        setMessages((prev) => [...prev, botMessage]);

        // Reset cursors for any new search
        if (result.hotels) cursorsRef.current.hotels = 3;
        if (result.trips) cursorsRef.current.trips = 3;
        if (result.cars) cursorsRef.current.cars = 3;
        if (result.rooms) cursorsRef.current.rooms = 3;
        if (result.bookings) cursorsRef.current.bookings = 3;

        // If there are search results, add a specialized message with the results
        if (
          result.hotels?.length ||
          result.trips?.length ||
          result.cars?.length ||
          result.rooms?.length ||
          result.bookings?.length
        ) {
          // Here you would typically render a specialized component for the results
          // But for this example, we'll just add the data as a special message property
          const resultsMessage: Message & { data?: any } = {
            type: "bot",
            content: "Here are the results:",
            data: {
              hotels: result.hotels,
              trips: result.trips,
              cars: result.cars,
              rooms: result.rooms,
              bookings: result.bookings,
            },
          };

          setMessages((prev) => [...prev, resultsMessage]);
        }
      } catch (error) {
        console.error("Error sending message:", error);

        // Add an error message
        const errorMessage: Message = {
          type: "bot",
          content: "Sorry, I encountered an error. Please try again.",
          options: ["Show me hotels", "Find a car rental", "Search for trips"],
        };

        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setLoading(false);
      }
    },
    [createBotMessageFromResult]
  );

  // Handle clicking on an option button
  const handleOptionClick = useCallback(
    async (option: string) => {
      // Add the user's selected option as a message
      const userMessage: Message = {
        type: "user",
        content: option,
      };

      setMessages((prev) => [...prev, userMessage]);
      setLoading(true);

      try {
        // Call the server action with the selected option
        const result = await chatAction(option, 0, 3);

        // Create a basic message from the result
        const botMessage = createBotMessageFromResult(result);

        // Update the chat with the bot's response
        setMessages((prev) => [...prev, botMessage]);

        // Reset cursors for any new search
        if (result.hotels) cursorsRef.current.hotels = 3;
        if (result.trips) cursorsRef.current.trips = 3;
        if (result.cars) cursorsRef.current.cars = 3;
        if (result.rooms) cursorsRef.current.rooms = 3;
        if (result.bookings) cursorsRef.current.bookings = 3;

        // If there are search results, add a specialized message with the results
        if (
          result.hotels?.length ||
          result.trips?.length ||
          result.cars?.length ||
          result.rooms?.length ||
          result.bookings?.length
        ) {
          // Here you would typically render a specialized component for the results
          const resultsMessage: Message & { data?: any } = {
            type: "bot",
            content: "Here are the results:",
            data: {
              hotels: result.hotels,
              trips: result.trips,
              cars: result.cars,
              rooms: result.rooms,
              bookings: result.bookings,
            },
          };

          setMessages((prev) => [...prev, resultsMessage]);
        }
      } catch (error) {
        console.error("Error handling option:", error);

        // Add an error message
        const errorMessage: Message = {
          type: "bot",
          content: "Sorry, I encountered an error. Please try again.",
          options: ["Show me hotels", "Find a car rental", "Search for trips"],
        };

        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setLoading(false);
      }
    },
    [createBotMessageFromResult]
  );

  // Load more results of a specific type
  const loadMore = useCallback(
    async (type: string) => {
      setLoading(true);

      try {
        // Get the last search query from the messages
        // This is a simplification - in a real app, you'd use a more robust approach
        const lastUserQuery = findLastUserQuery(messages);

        if (!lastUserQuery) {
          setLoading(false);
          return;
        }

        // Get the current cursor for this type
        const cursor =
          cursorsRef.current[type as keyof typeof cursorsRef.current] || 0;

        // Call the server action with the pagination parameters
        const result = await chatAction(lastUserQuery, cursor, 3);

        // Update the cursor for next time
        if (result[type as keyof ChatResult]?.length) {
          cursorsRef.current[type as keyof typeof cursorsRef.current] =
            cursor + 3;
        }

        // Add a message with just the new results
        if (
          result.hotels?.length ||
          result.trips?.length ||
          result.cars?.length ||
          result.rooms?.length ||
          result.bookings?.length
        ) {
          const moreResultsMessage: Message & { data?: any } = {
            type: "bot",
            content: `Here are more ${type}:`,
            data: {
              hotels: result.hotels,
              trips: result.trips,
              cars: result.cars,
              rooms: result.rooms,
              bookings: result.bookings,
            },
          };

          setMessages((prev) => [...prev, moreResultsMessage]);
        } else {
          // No more results
          const noMoreResultsMessage: Message = {
            type: "bot",
            content: `No more ${type} found. Would you like to try a different search?`,
            options: [
              "Show me hotels",
              "Find a car rental",
              "Search for trips",
            ],
          };

          setMessages((prev) => [...prev, noMoreResultsMessage]);
        }
      } catch (error) {
        console.error("Error loading more results:", error);

        // Add an error message
        const errorMessage: Message = {
          type: "bot",
          content: "Sorry, I couldn't load more results. Please try again.",
          options: ["Show me hotels", "Find a car rental", "Search for trips"],
        };

        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setLoading(false);
      }
    },
    [messages]
  );

  // Helper to find the last user query in the messages
  function findLastUserQuery(messages: Message[]): string | null {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].type === "user") {
        return messages[i].content;
      }
    }
    return null;
  }

  return {
    messages,
    loading,
    sendMessage,
    handleOptionClick,
    loadMore,
  };
}
