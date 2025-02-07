import {
  boolean,
  pgTable,
  text,
  timestamp,
  integer,
  varchar,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("user"),
  phoneNumber: text("phone_number"),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  address: text("address"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
})

export const flight = pgTable("flight", {
  id: varchar("id").primaryKey(),
  flightNumber: varchar("flight_number").notNull(),
  departureAirport: varchar("departure_airport").notNull(),
  arrivalAirport: varchar("arrival_airport").notNull(),
  departureTime: timestamp("departure_time").notNull(),
  arrivalTime: timestamp("arrival_time").notNull(),
  price: varchar("price").notNull(),
  availableSeats: integer("available_seats").notNull(),
  images: text("images").array().default([]).notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
})

export const hotel = pgTable("hotel", {
  id: varchar("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description").notNull(),
  address: text("address").notNull(),
  city: varchar("city").notNull(),
  country: varchar("country").notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  amenities: text("amenities").array().default([]).notNull(),
  images: text("images").array().default([]).notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
})

export const room = pgTable("room", {
  id: varchar("id").primaryKey(),
  hotelId: varchar("hotel_id")
    .notNull()
    .references(() => hotel.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  description: text("description").notNull(),
  capacity: integer("capacity").notNull(),
  pricePerNight: varchar("price_per_night").notNull(),
  roomType: varchar("room_type").notNull(), // e.g., "single", "double", "suite"
  amenities: text("amenities").array().default([]).notNull(),
  images: text("images").array().default([]).notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
})

export const roomAvailability = pgTable("room_availability", {
  id: varchar("id").primaryKey(),
  roomId: varchar("room_id")
    .notNull()
    .references(() => room.id, { onDelete: "cascade" }),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isAvailable: boolean("is_available").notNull().default(true),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
})

export const hotelRelations = relations(hotel, ({ many }) => ({
  rooms: many(room),
}))

export const roomRelations = relations(room, ({ one, many }) => ({
  hotel: one(hotel, {
    fields: [room.hotelId],
    references: [hotel.id],
  }),
  availabilities: many(roomAvailability),
}))

export const roomAvailabilityRelations = relations(
  roomAvailability,
  ({ one }) => ({
    room: one(room, {
      fields: [roomAvailability.roomId],
      references: [room.id],
    }),
  })
)
