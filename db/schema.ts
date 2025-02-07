import {
  boolean,
  pgTable,
  text,
  timestamp,
  integer,
  varchar,
  serial,
  date,
  decimal,
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

export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  destination: varchar("destination", { length: 255 }).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  capacity: integer("capacity").notNull(),
  isAvailable: boolean("is_available").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export const tripImages = pgTable("trip_images", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id")
    .references(() => trips.id, { onDelete: "cascade" })
    .notNull(),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
})

export const tripActivities = pgTable("trip_activities", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id")
    .references(() => trips.id, { onDelete: "cascade" })
    .notNull(),
  activityName: varchar("activity_name", { length: 255 }).notNull(),
  description: text("description"),
  scheduledDate: date("scheduled_date"),
  createdAt: timestamp("created_at").defaultNow(),
})

export const tripBookings = pgTable("trip_bookings", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id")
    .references(() => trips.id, { onDelete: "cascade" })
    .notNull(),
  userId: text("user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  seatsBooked: integer("seats_booked").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  bookingDate: timestamp("booking_date").defaultNow(),
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

export const tripsRelations = relations(trips, ({ many }) => ({
  images: many(tripImages),
  activities: many(tripActivities),
  bookings: many(tripBookings),
}))

export const tripImagesRelations = relations(tripImages, ({ one }) => ({
  trip: one(trips, {
    fields: [tripImages.tripId],
    references: [trips.id],
  }),
}))

export const tripActivitiesRelations = relations(tripActivities, ({ one }) => ({
  trip: one(trips, {
    fields: [tripActivities.tripId],
    references: [trips.id],
  }),
}))

export const tripBookingsRelations = relations(tripBookings, ({ one }) => ({
  trip: one(trips, {
    fields: [tripBookings.tripId],
    references: [trips.id],
  }),
  user: one(user, {
    fields: [tripBookings.userId],
    references: [user.id],
  }),
}))
