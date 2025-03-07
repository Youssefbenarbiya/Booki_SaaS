import * as z from "zod"

const availabilitySchema = z.object({
  id: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
  isAvailable: z.boolean().default(true),
})

export const roomSchema = z.object({
  id: z.string().optional(), // Optional for new rooms
  name: z.string().min(1, "Room name is required"),
  description: z.string().min(1, "Description is required"),
  capacity: z.number().int().positive("Capacity must be positive"),
  pricePerNightChild: z.number().positive("Adult price must be positive"),
  pricePerNightAdult: z.number().positive("Child price must be positive"),
  roomType: z.enum(["single", "double", "suite", "family"]),
  amenities: z.array(z.string()),
  images: z.array(z.string()).default([]),
  availabilities: z.array(availabilitySchema).optional(),
})

export const hotelSchema = z.object({
  name: z.string().min(1, "Hotel name is required"),
  description: z.string().min(1, "Description is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  rating: z.number().int().min(1).max(5),
  amenities: z.array(z.string()),
  images: z.array(z.string()).max(10).optional(),
  rooms: z.array(roomSchema),
})

export type HotelInput = z.infer<typeof hotelSchema>
export type RoomInput = z.infer<typeof roomSchema>
export type AvailabilityInput = z.infer<typeof availabilitySchema>
