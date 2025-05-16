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
  agencies,
  wallet,
  walletTransactions,
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

// Mark a booking payment as complete (for advance payments)
export async function completePayment(type: BookingType, bookingId: number) {
  try {
    console.log(`completePayment called with type=${type}, id=${bookingId}`);
    
    // Use the correct auth method for server components
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    console.log("Session in completePayment:", {
      userId: session?.user?.id,
      userRole: session?.user?.role,
    });
    
    // First check if user is authenticated
    if (!session?.user?.id) {
      console.log("Authentication failed in completePayment");
      throw new Error("Unauthorized: Authentication required");
    }
    
    // Check if user has the required role
    const allowedRoles = ["admin", "agency owner", "employee"];
    const userRole = session.user.role as string;
    
    if (!allowedRoles.includes(userRole)) {
      console.log(`Authorization failed in completePayment: User role '${userRole}' not in allowed roles`);
      throw new Error(`Unauthorized: Only ${allowedRoles.join(", ")} can complete payments`);
    }
    
    // Check if the booking exists before updating
    let booking;
    let paymentAmount = 0;
    let agencyId = '';
    
    switch (type) {
      case "car":
        booking = await db.query.carBookings.findFirst({
          where: eq(carBookings.id, bookingId),
          with: {
            car: true,
          }
        });
        if (booking && booking.car && booking.car.agencyId) {
          paymentAmount = Number(booking.total_price);
          agencyId = booking.car.agencyId;
        }
        break;
      case "trip":
        booking = await db.query.tripBookings.findFirst({
          where: eq(tripBookings.id, bookingId),
          with: {
            trip: true,
          }
        });
        if (booking && booking.trip && booking.trip.agencyId) {
          paymentAmount = Number(booking.totalPrice);
          agencyId = booking.trip.agencyId;
        }
        break;
      case "hotel":
        booking = await db.query.roomBookings.findFirst({
          where: eq(roomBookings.id, bookingId),
          with: {
            room: {
              with: {
                hotel: true
              }
            }
          }
        });
        if (booking && booking.room && booking.room.hotel && booking.room.hotel.agencyId) {
          paymentAmount = Number(booking.totalPrice);
          agencyId = booking.room.hotel.agencyId;
        }
        break;
      default:
        throw new Error(`Invalid booking type: ${type}`);
    }
    
    if (!booking) {
      console.log(`Booking not found: type=${type}, id=${bookingId}`);
      throw new Error(`${type} booking with ID ${bookingId} not found`);
    }
    
    if (!agencyId) {
      console.log(`Agency ID not found for booking: type=${type}, id=${bookingId}`);
      throw new Error('Agency not found for this booking');
    }
    
    console.log(`Booking found, updating status: type=${type}, id=${bookingId}`);

    // Update the booking status and payment status
    switch (type) {
      case "car":
        await db
          .update(carBookings)
          .set({ 
            status: "completed", 
            paymentStatus: "completed",
            paymentDate: new Date()
          })
          .where(eq(carBookings.id, bookingId));
        break;

      case "trip":
        await db
          .update(tripBookings)
          .set({ 
            status: "completed",
            paymentStatus: "completed",
            paymentDate: new Date()
          })
          .where(eq(tripBookings.id, bookingId));
        break;

      case "hotel":
        await db
          .update(roomBookings)
          .set({ 
            status: "completed",
            paymentStatus: "completed",
            paymentDate: new Date()
          })
          .where(eq(roomBookings.id, bookingId));
        break;

      default:
        throw new Error("Invalid booking type");
    }

    console.log(`Successfully updated booking: type=${type}, id=${bookingId}`);
    
    // Find the agency's user information
    const agency = await db.query.agencies.findFirst({
      where: eq(agencies.userId, agencyId),
    });
    
    if (!agency) {
      console.log(`Agency not found for ID: ${agencyId}`);
      throw new Error('Agency not found with the given ID');
    }
    
    // Find or create wallet for this agency
    let agencyWallet = await db.query.wallet.findFirst({
      where: eq(wallet.userId, agencyId),
    });
    
    if (!agencyWallet) {
      console.log("No wallet found for agency, creating one");
      const newWallet = await db
        .insert(wallet)
        .values({
          userId: agencyId,
          balance: "0",
        })
        .returning();
        
      agencyWallet = newWallet[0];
    }
    
    // Get current wallet balance
    const currentBalance = parseFloat(agencyWallet.balance || "0");
    const validatedPaymentAmount = isNaN(paymentAmount) ? 0 : paymentAmount;
    const newBalance = currentBalance + validatedPaymentAmount;

    console.log(`Wallet balance calculation:`, {
      currentBalance,
      paymentAmount: validatedPaymentAmount,
      newBalance
    });

    // Update wallet balance
    await db
      .update(wallet)
      .set({
        balance: newBalance.toString(),
        updatedAt: new Date(),
      })
      .where(eq(wallet.id, agencyWallet.id));
      
    // Record transaction in wallet_transactions
    await db
      .insert(walletTransactions)
      .values({
        walletId: agencyWallet.id,
        amount: validatedPaymentAmount.toString(),
        type: "booking_payment",
        status: "completed",
        description: `Payment received for ${type} booking #${bookingId}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    
    console.log(`Added ${validatedPaymentAmount} to agency wallet. New balance: ${newBalance}`);
    
    // Revalidate relevant paths
    revalidatePath("/[locale]/user/profile/bookingHistory");
    revalidatePath("/[locale]/agency/dashboard/bookings");
    revalidatePath(`/[locale]/agency/dashboard/bookings/${type}/${bookingId}`);
    revalidatePath(`/[locale]/agency/dashboard/wallet`);
    
    return { success: true, message: "Payment marked as completed successfully" };
  } catch (error) {
    console.error(`Error completing payment for ${type} booking:`, error);
    throw new Error(`Failed to complete payment: ${error instanceof Error ? error.message : String(error)}`);
  }
}
