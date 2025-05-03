"use server";

import {
  tripBookings,
  roomBookings,
  carBookings,
  trips,
  hotel,
  room,
  cars,
  user,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import db from "@/db/drizzle";
import { headers } from "next/headers";

export type BookingType = "car" | "trip" | "hotel";

// Fetch all bookings for a user
export async function getUserBookings(type: BookingType) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }

  const userId = session.user.id;

  try {
    switch (type) {
      case "car":
        return await db.query.carBookings.findMany({
          where: eq(carBookings.user_id, userId),
          with: {
            car: true,
          },
          orderBy: (carBookings, { desc }) => [desc(carBookings.createdAt)],
        });

      case "trip":
        return await db.query.tripBookings.findMany({
          where: eq(tripBookings.userId, userId),
          with: {
            trip: true,
          },
          orderBy: (tripBookings, { desc }) => [desc(tripBookings.bookingDate)],
        });

      case "hotel":
        return await db.query.roomBookings.findMany({
          where: eq(roomBookings.userId, userId),
          with: {
            room: {
              with: {
                hotel: true,
              },
            },
          },
          orderBy: (roomBookings, { desc }) => [desc(roomBookings.bookingDate)],
        });

      default:
        throw new Error("Invalid booking type");
    }
  } catch (error) {
    console.error(`Error fetching ${type} bookings:`, error);
    throw new Error(`Failed to fetch ${type} bookings`);
  }
}

// Cancel a booking
export async function cancelBooking(type: BookingType, bookingId: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }

  try {
    switch (type) {
      case "car":
        await db
          .update(carBookings)
          .set({ status: "cancelled" })
          .where(eq(carBookings.id, bookingId));
        break;

      case "trip":
        await db
          .update(tripBookings)
          .set({ status: "cancelled" })
          .where(eq(tripBookings.id, bookingId));
        break;

      case "hotel":
        await db
          .update(roomBookings)
          .set({ status: "cancelled" })
          .where(eq(roomBookings.id, bookingId));
        break;

      default:
        throw new Error("Invalid booking type");
    }

    revalidatePath("/[locale]/bookings");
    revalidatePath("/[locale]/agency/dashboard/bookings");
    return { success: true, message: "Booking cancelled successfully" };
  } catch (error) {
    console.error(`Error cancelling ${type} booking:`, error);
    throw new Error(`Failed to cancel ${type} booking`);
  }
}

// Fetch booking details
export async function getBookingDetails(type: BookingType, bookingId: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }

  try {
    switch (type) {
      case "car":
        const carBooking = await db.query.carBookings.findFirst({
          where: eq(carBookings.id, bookingId),
          with: {
            car: true,
          },
        });

        if (carBooking) {
          // Get user details
          const userData = await db.query.user.findFirst({
            where: eq(user.id, carBooking.user_id),
            columns: {
              id: true,
              name: true,
              email: true,
              image: true,
              phoneNumber: true,
              address: true,
            },
          });

          return {
            ...carBooking,
            user: userData || undefined,
          };
        }

        return carBooking;

      case "trip":
        const tripBooking = await db.query.tripBookings.findFirst({
          where: eq(tripBookings.id, bookingId),
          with: {
            trip: {
              with: {
                images: true,
                activities: true,
              },
            },
          },
        });

        if (tripBooking) {
          // Get user details
          const userData = await db.query.user.findFirst({
            where: eq(user.id, tripBooking.userId),
            columns: {
              id: true,
              name: true,
              email: true,
              image: true,
              phoneNumber: true,
              address: true,
            },
          });

          return {
            ...tripBooking,
            user: userData || undefined,
          };
        }

        return tripBooking;

      case "hotel":
        const hotelBooking = await db.query.roomBookings.findFirst({
          where: eq(roomBookings.id, bookingId),
          with: {
            room: {
              with: {
                hotel: true,
              },
            },
          },
        });

        if (hotelBooking) {
          // Get user details
          const userData = await db.query.user.findFirst({
            where: eq(user.id, hotelBooking.userId),
            columns: {
              id: true,
              name: true,
              email: true,
              image: true,
              phoneNumber: true,
              address: true,
            },
          });

          return {
            ...hotelBooking,
            user: userData || undefined,
          };
        }

        return hotelBooking;

      default:
        throw new Error("Invalid booking type");
    }
  } catch (error) {
    console.error(`Error fetching ${type} booking details:`, error);
    throw new Error(`Failed to fetch ${type} booking details`);
  }
}

// Get all bookings for admin or agency
export async function getAllBookings(type: BookingType) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (
    !session?.user?.id ||
    !["admin", "agency owner", "employee"].includes(session.user.role as string)
  ) {
    throw new Error("Unauthorized access");
  }

  try {
    // For agency users, only show bookings for their own offerings
    const isAgency =
      session.user.role === "agency owner" || session.user.role === "employee";

    // Let's get the agencyId based on the user
    const userQuery = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
      with: {
        agency: true,
      },
    });

    const agencyId = userQuery?.agency?.userId;

    console.log("Agency ID for bookings:", agencyId);

    switch (type) {
      case "car":
        // For car bookings, we need to join with the cars table to filter by agency
        const carResults = await db
          .select()
          .from(carBookings)
          .innerJoin(cars, eq(carBookings.car_id, cars.id))
          .where(
            isAgency && agencyId ? eq(cars.agencyId, agencyId) : undefined
          );

        // Format the results to include car details
        return await Promise.all(
          carResults.map(async (result) => {
            const car = await db.query.cars.findFirst({
              where: eq(cars.id, result.car_bookings.car_id),
            });

            return {
              ...result.car_bookings,
              car,
            };
          })
        );

      case "trip":
        // For trip bookings, we need to join with the trips table to filter by agency
        const tripResults = await db
          .select()
          .from(tripBookings)
          .innerJoin(trips, eq(tripBookings.tripId, trips.id))
          .where(
            isAgency && agencyId ? eq(trips.agencyId, agencyId) : undefined
          );

        // Format the results to include trip details
        return await Promise.all(
          tripResults.map(async (result) => {
            const trip = await db.query.trips.findFirst({
              where: eq(trips.id, result.trip_bookings.tripId),
              with: {
                images: true,
              },
            });

            const userData = await db.query.user.findFirst({
              where: eq(user.id, result.trip_bookings.userId),
              columns: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
              },
            });

            return {
              ...result.trip_bookings,
              trip,
              user: userData,
            };
          })
        );

      case "hotel":
        // For hotel bookings, we need to join with the room and hotel tables to filter by agency
        const hotelResults = await db
          .select()
          .from(roomBookings)
          .innerJoin(room, eq(roomBookings.roomId, room.id))
          .innerJoin(hotel, eq(room.hotelId, hotel.id))
          .where(
            isAgency && agencyId ? eq(hotel.agencyId, agencyId) : undefined
          );

        // Format the results to include hotel and room details
        return await Promise.all(
          hotelResults.map(async (result) => {
            const roomData = await db.query.room.findFirst({
              where: eq(room.id, result.room_bookings.roomId),
              with: {
                hotel: true,
              },
            });

            const userData = await db.query.user.findFirst({
              where: eq(user.id, result.room_bookings.userId),
              columns: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
              },
            });

            return {
              ...result.room_bookings,
              room: roomData,
              user: userData,
            };
          })
        );

      default:
        throw new Error("Invalid booking type");
    }
  } catch (error) {
    console.error(`Error fetching all ${type} bookings:`, error);
    throw new Error(`Failed to fetch all ${type} bookings`);
  }
}

// Update booking status
export async function updateBookingStatus(
  type: BookingType,
  bookingId: number,
  status: string
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (
    !session?.user?.id ||
    !["admin", "agency"].includes(session.user.role as string)
  ) {
    throw new Error("Unauthorized access");
  }

  try {
    switch (type) {
      case "car":
        await db
          .update(carBookings)
          .set({ status })
          .where(eq(carBookings.id, bookingId));
        break;

      case "trip":
        await db
          .update(tripBookings)
          .set({ status })
          .where(eq(tripBookings.id, bookingId));
        break;

      case "hotel":
        await db
          .update(roomBookings)
          .set({ status })
          .where(eq(roomBookings.id, bookingId));
        break;

      default:
        throw new Error("Invalid booking type");
    }

    revalidatePath("/[locale]/admin/bookings");
    revalidatePath("/[locale]/agency/dashboard/bookings");
    return { success: true, message: `Booking status updated to ${status}` };
  } catch (error) {
    console.error(`Error updating ${type} booking status:`, error);
    throw new Error(`Failed to update ${type} booking status`);
  }
}
