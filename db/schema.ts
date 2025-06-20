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
  numeric,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("customer"),
  phoneNumber: text("phone_number"),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  address: text("address"),
  country: text("country"),
  region: text("region"),
  banned: boolean("banned").notNull().default(false),
  banReason: text("ban_reason"),
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

// --------------
// Trip Related
// --------------

// Trips table
// export const trips = pgTable("trips", {
//   id: serial("id").primaryKey(),
//   name: varchar("name", { length: 255 }).notNull(),
//   description: text("description"),
//   destination: varchar("destination", { length: 255 }).notNull(),
//   startDate: date("start_date").notNull(),
//   endDate: date("end_date").notNull(),
//   price: decimal("price", { precision: 10, scale: 2 }).notNull(),
//   capacity: integer("capacity").notNull(),
//   isAvailable: boolean("is_available").default(true),
//   status: varchar("status", { length: 50 }).notNull().default("pending"),
//   agencyId: text("agency_id").references(() => user.id),
//   createdAt: timestamp("created_at").defaultNow(),
//   updatedAt: timestamp("updated_at").defaultNow(),
// })
export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  destination: varchar("destination", { length: 255 }).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  originalPrice: decimal("original_price", {
    precision: 10,
    scale: 2,
  }).notNull(),
  discountPercentage: integer("discount_percentage"),
  priceAfterDiscount: decimal("priceAfterDiscount", {
    precision: 10,
    scale: 2,
  }),
  currency: varchar("currency", { length: 10 }).default("TND").notNull(),
  // Group discount fields
  groupDiscountEnabled: boolean("group_discount_enabled").default(false),
  groupDiscountMinPeople: integer("group_discount_min_people"),
  groupDiscountPercentage: integer("group_discount_percentage"),
  // Time-specific discount fields
  timeSpecificDiscountEnabled: boolean(
    "time_specific_discount_enabled"
  ).default(false),
  timeSpecificDiscountStartTime: varchar("time_specific_discount_start_time", {
    length: 10,
  }),
  timeSpecificDiscountEndTime: varchar("time_specific_discount_end_time", {
    length: 10,
  }),
  timeSpecificDiscountDays: text("time_specific_discount_days").array(),
  timeSpecificDiscountPercentage: integer("time_specific_discount_percentage"),
  // Child discount fields
  childDiscountEnabled: boolean("child_discount_enabled").default(false),
  childDiscountPercentage: integer("child_discount_percentage"),
  // Advance payment fields
  advancePaymentEnabled: boolean("advance_payment_enabled").default(false),
  advancePaymentPercentage: integer("advance_payment_percentage"),
  capacity: integer("capacity").notNull(),
  isAvailable: boolean("is_available").default(true),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  rejectionReason: text("rejection_reason"),
  agencyId: text("agency_id").references(() => agencies.userId), // Changed to reference agencies.userId (which is text type)
  createdBy: text("created_by").references(() => user.id), // Added new field to track creator
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})
// Trip Images table
export const tripImages = pgTable("trip_images", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id")
    .notNull()
    .references(() => trips.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
})

// Trip Activities table
export const tripActivities = pgTable("trip_activities", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id")
    .notNull()
    .references(() => trips.id, { onDelete: "cascade" }),
  activityName: varchar("activity_name", { length: 255 }).notNull(),
  description: text("description"),
  scheduledDate: date("scheduled_date"),
  createdAt: timestamp("created_at").defaultNow(),
})

// Trip Bookings table
export const tripBookings = pgTable("trip_bookings", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id")
    .notNull()
    .references(() => trips.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  seatsBooked: integer("seats_booked").notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  bookingDate: timestamp("booking_date").defaultNow(),
  paymentId: varchar("payment_id", { length: 255 }),
  paymentStatus: varchar("payment_status", { length: 50 }).default("pending"),
  paymentMethod: varchar("payment_method", { length: 50 }),
  paymentDate: timestamp("payment_date"),
  paymentCurrency: varchar("payment_currency", { length: 10 }),
  originalCurrency: varchar("original_currency", { length: 10 }),
  originalPricePerSeat: decimal("original_price_per_seat", {
    precision: 10,
    scale: 2,
  }),
  paymentType: varchar("payment_type", { length: 20 }).default("full"),
  advancePaymentPercentage: integer("advance_payment_percentage"),
  fullPrice: decimal("full_price", { precision: 10, scale: 2 }),
})

// Trip Relations
export const tripsRelations = relations(trips, ({ many, one }) => ({
  images: many(tripImages),
  activities: many(tripActivities),
  bookings: many(tripBookings),
  agency: one(agencies, {
    // Updated to reference agencies table
    fields: [trips.agencyId],
    references: [agencies.userId], // Reference the text-type userId field instead of id
  }),
  creator: one(user, {
    fields: [trips.createdBy],
    references: [user.id],
  }),
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

// -------------------
// Hotel & Room Related
// -------------------

// Hotel table
export const hotel = pgTable("hotel", {
  id: varchar("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description").notNull(),
  address: text("address").notNull(),
  city: varchar("city").notNull(),
  country: varchar("country").notNull(),
  rating: integer("rating").notNull(),
  latitude: text("latitude"),
  longitude: text("longitude"),
  amenities: text("amenities").array().default([]).notNull(),
  images: text("images").array().default([]).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  rejectionReason: text("rejection_reason"),
  agencyId: text("agency_id").references(() => agencies.userId),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// Room table
export const room = pgTable("room", {
  id: varchar("id").primaryKey(),
  hotelId: varchar("hotel_id")
    .notNull()
    .references(() => hotel.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  description: text("description").notNull(),
  capacity: integer("capacity").notNull(),
  pricePerNightAdult: decimal("price_per_night_adult", {
    precision: 10,
    scale: 2,
  }).notNull(),
  pricePerNightChild: decimal("price_per_night_child", {
    precision: 10,
    scale: 2,
  }).notNull(),
  currency: varchar("currency", { length: 10 }).default("TND").notNull(),
  roomType: varchar("room_type").notNull(), // e.g., "single", "double", "suite"
  amenities: text("amenities").array().default([]).notNull(),
  images: text("images").array().default([]).notNull(),
  // Add advance payment fields
  advancePaymentEnabled: boolean("advance_payment_enabled").default(false),
  advancePaymentPercentage: integer("advance_payment_percentage"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// Room Availability table
export const roomAvailability = pgTable("room_availability", {
  id: varchar("id").primaryKey(),
  roomId: varchar("room_id")
    .notNull()
    .references(() => room.id, { onDelete: "cascade" }),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  isAvailable: boolean("is_available").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// Room Bookings table (new)
export const roomBookings = pgTable("room_bookings", {
  id: serial("id").primaryKey(),
  roomId: varchar("room_id")
    .notNull()
    .references(() => room.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  checkIn: date("check_in").notNull(),
  checkOut: date("check_out").notNull(),
  totalPrice: decimal("total_price", {
    precision: 10,
    scale: 2,
  }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  bookingDate: timestamp("booking_date").defaultNow(),
  paymentId: varchar("payment_id", { length: 255 }),
  paymentStatus: varchar("payment_status", { length: 50 }).default("pending"),
  paymentMethod: varchar("payment_method", { length: 50 }),
  paymentDate: timestamp("payment_date"),
  paymentCurrency: varchar("payment_currency", { length: 10 }),
  originalCurrency: varchar("original_currency", { length: 10 }),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  adultCount: integer("adult_count").default(1),
  childCount: integer("child_count").default(0),
  infantCount: integer("infant_count").default(0),
  paymentType: varchar("payment_type", { length: 20 }).default("full"),
  advancePaymentPercentage: integer("advance_payment_percentage"),
  fullPrice: decimal("full_price", { precision: 10, scale: 2 }),
})

// Hotel & Room Relations
export const hotelRelations = relations(hotel, ({ many, one }) => ({
  rooms: many(room),
  agency: one(agencies, {
    // Added relation to agency
    fields: [hotel.agencyId],
    references: [agencies.userId],
  }),
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

export const roomBookingsRelations = relations(roomBookings, ({ one }) => ({
  room: one(room, {
    fields: [roomBookings.roomId],
    references: [room.id],
  }),
  user: one(user, {
    fields: [roomBookings.userId],
    references: [user.id],
  }),
}))

export const cars = pgTable("cars", {
  id: serial("id").primaryKey(),
  model: varchar("model", { length: 100 }).notNull(),
  brand: varchar("brand", { length: 100 }).notNull(),
  year: integer("year").notNull(),
  plateNumber: varchar("plate_number", { length: 20 }).notNull().unique(),
  color: varchar("color", { length: 50 }).notNull(),
  originalPrice: decimal("original_price", {
    precision: 10,
    scale: 2,
  }).notNull(),
  discountPercentage: integer("discount_percentage"),
  priceAfterDiscount: decimal("priceAfterDiscount", {
    precision: 10,
    scale: 2,
  }),
  currency: varchar("currency", { length: 10 }).default("TND").notNull(),
  images: text("images").array().default([]).notNull(),
  isAvailable: boolean("is_available").default(true),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  rejectionReason: text("rejection_reason"),
  agencyId: text("agency_id").references(() => agencies.userId),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  seats: integer("seats").notNull().default(4),
  category: text("category").notNull(),
  location: text("location").notNull(),
  // Add advance payment fields
  advancePaymentEnabled: boolean("advance_payment_enabled").default(false),
  advancePaymentPercentage: integer("advance_payment_percentage"),
})

// Car Bookings table
export const carBookings = pgTable("car_bookings", {
  id: serial("id").primaryKey(),
  car_id: integer("car_id")
    .notNull()
    .references(() => cars.id, { onDelete: "cascade" }),
  user_id: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  start_date: timestamp("start_date").notNull(),
  end_date: timestamp("end_date").notNull(),
  total_price: numeric("total_price").notNull(),
  status: text("status").notNull().default("pending"),
  paymentId: varchar("payment_id", { length: 255 }),
  paymentStatus: varchar("payment_status", { length: 50 }).default("pending"),
  paymentMethod: varchar("payment_method", { length: 50 }),
  paymentDate: timestamp("payment_date").defaultNow().notNull(),
  paymentCurrency: varchar("payment_currency", { length: 10 }),
  originalCurrency: varchar("original_currency", { length: 10 }),
  originalPrice: numeric("original_price"),
  advancePaymentPercentage: integer("advance_payment_percentage"),
  fullName: text("full_name"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  drivingLicense: text("driving_license"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const carsRelations = relations(cars, ({ many, one }) => ({
  bookings: many(carBookings),
  agency: one(agencies, {
    fields: [cars.agencyId],
    references: [agencies.userId],
  }),
}))

// Car Bookings Relations
export const carBookingsRelations = relations(carBookings, ({ one }) => ({
  car: one(cars, {
    fields: [carBookings.car_id],
    references: [cars.id],
  }),
  user: one(user, {
    fields: [carBookings.user_id],
    references: [user.id],
  }),
}))

// Blog Categories table
export const blogCategories = pgTable("blog_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})
// Blogs table
export const blogs = pgTable("blogs", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  featuredImage: text("featured_image"),
  images: text("images").array().default([]).notNull(),
  published: boolean("published").default(false).notNull(),
  publishedAt: timestamp("published_at"),
  categoryId: integer("category_id").references(() => blogCategories.id),
  authorId: text("author_id").references(() => user.id),
  agencyId: text("agency_id").references(() => agencies.userId),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  rejectionReason: text("rejection_reason"),
  views: integer("views").default(0),
  readTime: integer("read_time"),
  tags: text("tags").array().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})
// Blog Relations
export const blogRelations = relations(blogs, ({ one }) => ({
  category: one(blogCategories, {
    fields: [blogs.categoryId],
    references: [blogCategories.id],
  }),
  author: one(user, {
    fields: [blogs.authorId],
    references: [user.id],
  }),
}))
export const blogCategoriesRelations = relations(
  blogCategories,
  ({ many }) => ({
    blogs: many(blogs),
  })
)

// User Favorites table
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  itemType: varchar("item_type", { length: 50 }).notNull(), // "trip", "hotel", "car"
  itemId: varchar("item_id", { length: 100 }).notNull(), // The ID of the favorited item
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Add unique constraint to prevent duplicate favorites
export const favoritesConstraint = pgTable("favorites_constraint", {
  id: serial("id").primaryKey(),
  userId_itemType_itemId: varchar("user_id_item_type_item_id").unique(),
})

// Favorites Relations
export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(user, {
    fields: [favorites.userId],
    references: [user.id],
  }),
}))

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'info', 'success', 'warning', 'error'
  read: boolean("read").default(false).notNull(),
  relatedItemType: varchar("related_item_type", { length: 50 }), // 'trip', 'booking', etc.
  relatedItemId: integer("related_item_id"), // ID of the related item
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Notification Relations
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(user, {
    fields: [notifications.userId],
    references: [user.id],
  }),
}))

// Agencies table
export const agencies = pgTable("agencies", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" })
    .unique(),
  agencyUniqueId: varchar("agency_unique_id", { length: 20 })
    .notNull()
    .unique(),
  agencyName: varchar("agency_name", { length: 255 }).notNull().unique(),
  agencyType: varchar("agency_type", { length: 50 }).notNull(), // travel or car_rental
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  country: text("country"),
  region: text("region"),
  address: text("address"),
  logo: text("logo"),
  // Add verification document fields
  rneDocument: text("rne_document"),
  patenteDocument: text("patente_document"),
  cinDocument: text("cin_document"),
  isVerified: boolean("is_verified").default(false),
  verificationStatus: varchar("verification_status", { length: 50 }).default(
    "pending"
  ),
  verificationRejectionReason: text("verification_rejection_reason"),
  verificationSubmittedAt: timestamp("verification_submitted_at"),
  verificationReviewedAt: timestamp("verification_reviewed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const userRelations = relations(user, ({ many, one }) => ({
  favorites: many(favorites),
  sessions: many(session),
  accounts: many(account),
  notifications: many(notifications),
  agency: one(agencies, {
    fields: [user.id],
    references: [agencies.userId],
  }),
  paymentMethods: many(paymentMethods),
  // ...other existing relations...
}))

export const agenciesRelations = relations(agencies, ({ one, many }) => ({
  user: one(user, {
    fields: [agencies.userId],
    references: [user.id],
  }),
  hotels: many(hotel), // Added hotels relation
}))

export const agencyEmployees = pgTable("agency_employees", {
  id: serial("id").primaryKey(),
  employeeId: text("employee_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  agencyId: text("agency_id")
    .notNull()
    .references(() => agencies.userId, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
})

// Add relations for agencyEmployees
export const agencyEmployeesRelations = relations(
  agencyEmployees,
  ({ one }) => ({
    employee: one(user, {
      fields: [agencyEmployees.employeeId],
      references: [user.id],
    }),
    agency: one(agencies, {
      fields: [agencyEmployees.agencyId],
      references: [agencies.userId],
    }),
  })
)

// Chat messages table
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  postId: varchar("post_id", { length: 100 }).notNull(),
  postType: varchar("post_type", { length: 20 }).notNull(), // 'trip', 'car', 'hotel', 'room'
  senderId: text("sender_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  receiverId: text("receiver_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  type: varchar("type", { length: 20 }).notNull().default("text"), // 'text', 'image', 'notification'
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  customerId: varchar("customer_id"),
})

// Chat messages relations
export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  sender: one(user, {
    fields: [chatMessages.senderId],
    references: [user.id],
  }),
  receiver: one(user, {
    fields: [chatMessages.receiverId],
    references: [user.id],
  }),
}))

// Support Chat System
export const support_tickets = pgTable("support_tickets", {
  id: text("id").primaryKey(),
  subject: text("subject").notNull(),
  status: text("status").notNull().default("open"), // "open", "closed", "pending"
  agencyId: text("agency_id").notNull(),
  agencyName: text("agency_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const support_messages = pgTable("support_messages", {
  id: text("id").primaryKey(),
  ticketId: text("ticket_id")
    .notNull()
    .references(() => support_tickets.id, { onDelete: "cascade" }),
  senderId: text("sender_id").notNull(),
  receiverId: text("receiver_id").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull().default("text"), // "text", "image", etc.
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  senderRole: text("sender_role").notNull(), // "agency" or "admin"
})

// Support tables relations
export const supportTicketsRelations = relations(
  support_tickets,
  ({ many }) => ({
    messages: many(support_messages),
  })
)

export const supportMessagesRelations = relations(
  support_messages,
  ({ one }) => ({
    ticket: one(support_tickets, {
      fields: [support_messages.ticketId],
      references: [support_tickets.id],
    }),
  })
)

// Wallet table to store balance information
export const wallet = pgTable("wallet", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  balance: decimal("balance", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  currency: varchar("currency", { length: 10 }).default("TND").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Transaction types: deposit, withdrawal, payment, refund, etc.
export const walletTransactions = pgTable("wallet_transactions", {
  id: serial("id").primaryKey(),
  walletId: serial("wallet_id")
    .notNull()
    .references(() => wallet.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // deposit, withdrawal, payment, refund
  status: varchar("status", { length: 50 }).notNull().default("completed"),
  description: text("description"),
  reference: text("reference"), // Reference to external transaction (booking ID, etc.)
  referenceType: varchar("reference_type", { length: 50 }), // trip_booking, room_booking, car_booking
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Payment Methods table
export const paymentMethods = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(), // bank_account, flouci
  name: varchar("name", { length: 100 }).notNull(), // User-friendly name for this payment method
  details: text("details").notNull(), // JSON string or specific details
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Update withdrawal requests table to reference payment method
export const withdrawalRequests = pgTable("withdrawal_requests", {
  id: serial("id").primaryKey(),
  walletId: serial("wallet_id")
    .notNull()
    .references(() => wallet.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, approved, rejected
  approvedBy: text("approved_by").references(() => user.id),
  approvedAt: timestamp("approved_at"),
  rejectedBy: text("rejected_by").references(() => user.id),
  rejectedAt: timestamp("rejected_at"),
  rejectionReason: text("rejection_reason"),
  paymentMethod: varchar("payment_method", { length: 50 }),
  paymentDetails: text("payment_details"),
  paymentMethodId: integer("payment_method_id").references(
    () => paymentMethods.id
  ), // Add reference to payment method
  receiptUrl: text("receipt_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Relations
export const walletRelations = relations(wallet, ({ one, many }) => ({
  user: one(user, {
    fields: [wallet.userId],
    references: [user.id],
  }),
  transactions: many(walletTransactions),
  withdrawalRequests: many(withdrawalRequests),
}))

export const walletTransactionsRelations = relations(
  walletTransactions,
  ({ one }) => ({
    wallet: one(wallet, {
      fields: [walletTransactions.walletId],
      references: [wallet.id],
    }),
  })
)

// Add payment methods relations
export const paymentMethodsRelations = relations(
  paymentMethods,
  ({ one, many }) => ({
    user: one(user, {
      fields: [paymentMethods.userId],
      references: [user.id],
    }),
    withdrawalRequests: many(withdrawalRequests),
  })
)

export const withdrawalRequestsRelations = relations(
  withdrawalRequests,
  ({ one }) => ({
    wallet: one(wallet, {
      fields: [withdrawalRequests.walletId],
      references: [wallet.id],
    }),
    user: one(user, {
      fields: [withdrawalRequests.userId],
      references: [user.id],
    }),
    approver: one(user, {
      fields: [withdrawalRequests.approvedBy],
      references: [user.id],
    }),
    rejecter: one(user, {
      fields: [withdrawalRequests.rejectedBy],
      references: [user.id],
    }),
    paymentMethod: one(paymentMethods, {
      fields: [withdrawalRequests.paymentMethodId],
      references: [paymentMethods.id],
    }),
  })
)

// Admin Notifications
export const adminNotifications = pgTable("admin_notifications", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // agency_verification, new_trip, new_car, new_hotel, new_blog
  entityId: text("entity_id").notNull(), // ID of the related entity (agency, trip, car, hotel, blog)
  entityType: varchar("entity_type", { length: 50 }).notNull(), // agency, trip, car, hotel, blog
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

