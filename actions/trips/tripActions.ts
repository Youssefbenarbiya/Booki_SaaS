"use server";

import db from "@/db/drizzle";
import {
  trips,
  tripImages,
  tripActivities,
  user,
  agencyEmployees,
  agencies,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { sendTripApprovalRequest } from "../admin/adminNotifications";

const tripSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  destination: z.string().min(1, "Destination is required"),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  originalPrice: z.coerce.number().positive("Original price must be positive"),
  discountPercentage: z.coerce.number().min(0).max(100).optional().nullable(),
  priceAfterDiscount: z.coerce
    .number()
    .positive("Price after discount must be positive")
    .optional()
    .nullable(),
  capacity: z.coerce.number().int().positive("Capacity must be positive"),
  isAvailable: z.boolean().default(true),
  images: z.array(z.string()),
  currency: z.string().default("USD"),
  // Group Discount
  groupDiscountEnabled: z.boolean().optional().default(false),
  groupDiscountMinPeople: z.coerce.number().int().min(2).optional().nullable(),
  groupDiscountPercentage: z.coerce
    .number()
    .min(0)
    .max(100)
    .optional()
    .nullable(),
  // Time-specific Discount
  timeSpecificDiscountEnabled: z.boolean().optional().default(false),
  timeSpecificDiscountStartTime: z.string().optional().nullable(),
  timeSpecificDiscountEndTime: z.string().optional().nullable(),
  timeSpecificDiscountDays: z.array(z.string()).optional().nullable(),
  timeSpecificDiscountPercentage: z.coerce
    .number()
    .min(0)
    .max(100)
    .optional()
    .nullable(),
  // Child Discount
  childDiscountEnabled: z.boolean().optional().default(false),
  childDiscountPercentage: z.coerce
    .number()
    .min(0)
    .max(100)
    .optional()
    .nullable(),
  activities: z
    .array(
      z.object({
        activityName: z.string(),
        description: z.string().optional(),
        scheduledDate: z.coerce.date().optional(),
      })
    )
    .optional(),
  // Add advance payment fields
  advancePaymentEnabled: z.boolean().optional().nullable(),
  advancePaymentPercentage: z.coerce.number().min(0).max(100).optional().nullable(),
});

export type TripInput = z.infer<typeof tripSchema>;

// Helper function to get agency ID - works for both owners and employees
async function getAgencyId(userId: string) {
  // Check if user is an agency owner
  const userWithAgency = await db.query.user.findFirst({
    where: eq(user.id, userId),
    with: {
      agency: true,
    },
  });

  if (userWithAgency?.agency) {
    return userWithAgency.agency.userId;
  }

  // Check if user is an employee
  const employeeRecord = await db.query.agencyEmployees.findFirst({
    where: eq(agencyEmployees.employeeId, userId),
  });

  if (employeeRecord) {
    return employeeRecord.agencyId;
  }

  throw new Error("No agency found for this user - not an owner or employee");
}

export async function createTrip(tripData: TripInput) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  // Check if session user is an agency or has an agency association
  const agency = await db.query.agencies.findFirst({
    where: eq(agencies.userId, session.user.id),
  })

  if (!agency) {
    throw new Error("Only agencies can create trips")
  }

  // Instead of using a transaction, perform each operation sequentially
  try {
    // First insert trip data
    const [createdTripRow] = await db
      .insert(trips)
      .values({
        name: tripData.name,
        description: tripData.description || null,
        destination: tripData.destination,
        startDate: tripData.startDate,
        endDate: tripData.endDate,
        originalPrice: tripData.originalPrice.toString(),
        discountPercentage: tripData.discountPercentage || null,
        priceAfterDiscount: tripData.priceAfterDiscount
          ? tripData.priceAfterDiscount.toString()
          : null,
        currency: tripData.currency,
        capacity: tripData.capacity,
        isAvailable: tripData.isAvailable,
        // Use provided agency ID or fall back to current user's agency ID
        agencyId: agency.userId,
        createdBy: session.user.id,
        // Add discount types
        groupDiscountEnabled: tripData.groupDiscountEnabled || false,
        groupDiscountMinPeople: tripData.groupDiscountMinPeople || null,
        groupDiscountPercentage: tripData.groupDiscountPercentage || null,

        timeSpecificDiscountEnabled: tripData.timeSpecificDiscountEnabled || false,
        timeSpecificDiscountStartTime:
          tripData.timeSpecificDiscountStartTime || null,
        timeSpecificDiscountEndTime:
          tripData.timeSpecificDiscountEndTime || null,
        timeSpecificDiscountDays: tripData.timeSpecificDiscountDays || null,
        timeSpecificDiscountPercentage:
          tripData.timeSpecificDiscountPercentage || null,

        childDiscountEnabled: tripData.childDiscountEnabled || false,
        childDiscountPercentage: tripData.childDiscountPercentage || null,
        
        // Add advance payment fields
        advancePaymentEnabled: tripData.advancePaymentEnabled || false,
        advancePaymentPercentage: tripData.advancePaymentPercentage || null,
      })
      .returning({
        id: trips.id,
      })

    const tripId = createdTripRow.id

    // Insert images if provided
    if (tripData.images && tripData.images.length > 0) {
      await Promise.all(
        tripData.images.map((imageUrl) =>
          db.insert(tripImages).values({
            tripId: tripId,
            imageUrl: imageUrl,
          })
        )
      )
    }

    // Insert activities if provided
    if (tripData.activities && tripData.activities.length > 0) {
      await Promise.all(
        tripData.activities.map((activity) =>
          db.insert(tripActivities).values({
            tripId: tripId,
            activityName: activity.activityName,
            description: activity.description || null,
            scheduledDate: activity.scheduledDate || null,
          })
        )
      )
    }

    return { id: tripId }
  } catch (error) {
    console.error("Error creating trip:", error)
    throw error
  }
}

export async function getTrips() {
  try {
    // Get the current user's session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      console.log("No authenticated user found when getting trips");
      return [];
    }

    // Get the agency ID - works for both owners and employees
    const agencyId = await getAgencyId(session.user.id);

    // Get trips belonging to the user's agency
    const tripResults = await db.query.trips.findMany({
      where: eq(trips.agencyId, agencyId),
      with: {
        images: true,
        activities: true,
        bookings: true,
      },
    });

    return tripResults;
  } catch (error) {
    console.error("Error getting trips:", error);
    throw error;
  }
}

export async function getTripById(id: number) {
  try {
    const trip = await db.query.trips.findFirst({
      where: eq(trips.id, id),
      with: {
        images: true,
        activities: true,
        bookings: true,
        agency: {
          with: {
            user: true,
          },
        },
      },
    });
    return trip;
  } catch (error) {
    console.error("Error getting trip:", error);
    throw error;
  }
}

export async function updateTrip(tripId: number, tripData: TripInput) {
  try {
    const validatedData = tripSchema.parse(tripData);

    // Ensure isAvailable is false if capacity is 0
    const isAvailable =
      validatedData.capacity === 0 ? false : validatedData.isAvailable;

    console.log(
      "Updating trip with data:",
      JSON.stringify(
        {
          groupDiscountEnabled: validatedData.groupDiscountEnabled,
          groupDiscountMinPeople: validatedData.groupDiscountMinPeople,
          groupDiscountPercentage: validatedData.groupDiscountPercentage,
          timeSpecificDiscountEnabled:
            validatedData.timeSpecificDiscountEnabled,
          timeSpecificDiscountDays: validatedData.timeSpecificDiscountDays,
          childDiscountEnabled: validatedData.childDiscountEnabled,
          childDiscountPercentage: validatedData.childDiscountPercentage,
          advancePaymentEnabled: validatedData.advancePaymentEnabled,
          advancePaymentPercentage: validatedData.advancePaymentPercentage,
        },
        null,
        2
      )
    );

    // Update trip directly without using a transaction
    // First update the trip data
    const [updatedTrip] = await db
      .update(trips)
      .set({
        name: validatedData.name,
        description: validatedData.description || null,
        destination: validatedData.destination,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        originalPrice: validatedData.originalPrice.toString(),
        discountPercentage: validatedData.discountPercentage ?? null,
        priceAfterDiscount:
          validatedData.priceAfterDiscount?.toString() ?? null,
        currency: validatedData.currency,
        capacity: validatedData.capacity,
        isAvailable: isAvailable,
        updatedAt: new Date(),
        // Include discount fields
        groupDiscountEnabled: validatedData.groupDiscountEnabled ?? false,
        groupDiscountMinPeople: validatedData.groupDiscountMinPeople ?? null,
        groupDiscountPercentage: validatedData.groupDiscountPercentage ?? null,

        timeSpecificDiscountEnabled:
          validatedData.timeSpecificDiscountEnabled ?? false,
        timeSpecificDiscountStartTime:
          validatedData.timeSpecificDiscountStartTime ?? null,
        timeSpecificDiscountEndTime:
          validatedData.timeSpecificDiscountEndTime ?? null,
        timeSpecificDiscountDays:
          validatedData.timeSpecificDiscountDays ?? null,
        timeSpecificDiscountPercentage:
          validatedData.timeSpecificDiscountPercentage ?? null,

        childDiscountEnabled: validatedData.childDiscountEnabled ?? false,
        childDiscountPercentage: validatedData.childDiscountPercentage ?? null,
        
        // Include advance payment fields
        advancePaymentEnabled: validatedData.advancePaymentEnabled ?? false,
        advancePaymentPercentage: validatedData.advancePaymentPercentage ?? null,
      })
      .where(eq(trips.id, tripId))
      .returning();

    // Then update images - first delete existing images
    await db.delete(tripImages).where(eq(tripImages.tripId, tripId));
    
    // Then insert new images if any
    if (validatedData.images.length > 0) {
      await db.insert(tripImages).values(
        validatedData.images.map((url) => ({
          tripId: tripId,
          imageUrl: url,
        }))
      );
    }

    // Update activities - first delete existing activities
    await db.delete(tripActivities).where(eq(tripActivities.tripId, tripId));
    
    // Then insert new activities if any
    if (validatedData.activities?.length) {
      await db.insert(tripActivities).values(
        validatedData.activities.map((activity) => ({
          tripId: tripId,
          activityName: activity.activityName,
          description: activity.description,
          scheduledDate: activity.scheduledDate?.toISOString(),
        }))
      );
    }

    revalidatePath("/agency/dashboard/trips");
    revalidatePath("/");
    return updatedTrip;
  } catch (error) {
    console.error("Error updating trip:", error);
    throw error;
  }
}

export async function archiveTrip(id: number) {
  try {
    // Check if trip has any bookings
    const trip = await db.query.trips.findFirst({
      where: eq(trips.id, id),
      with: {
        bookings: true,
      },
    });

    if (!trip) {
      throw new Error("Trip not found");
    }

    // If trip has bookings, prevent archiving
    if (trip.bookings && trip.bookings.length > 0) {
      throw new Error(
        "Cannot archive a trip with existing bookings. Please contact the agency."
      );
    }

    const [archivedTrip] = await db
      .update(trips)
      .set({
        isAvailable: false,
        status: "archived",
        updatedAt: new Date(),
      })
      .where(eq(trips.id, id))
      .returning();

    revalidatePath("/agency/dashboard/trips");
    revalidatePath("/");
    return archivedTrip;
  } catch (error) {
    console.error("Error archiving trip:", error);
    throw error;
  }
}

export async function publishTrip(id: number) {
  try {
    const [publishedTrip] = await db
      .update(trips)
      .set({
        isAvailable: true,
        status: "pending", // Will need admin approval
        updatedAt: new Date(),
      })
      .where(eq(trips.id, id))
      .returning();

    // Send notification email to admin
    await sendTripApprovalRequest(id);

    revalidatePath("/agency/dashboard/trips");
    revalidatePath("/");
    return publishedTrip;
  } catch (error) {
    console.error("Error publishing trip:", error);
    throw error;
  }
}

// Keep the deleteTrip function for backward compatibility or admin purposes
export async function deleteTrip(id: number) {
  try {
    const [deletedTrip] = await db
      .delete(trips)
      .where(eq(trips.id, id))
      .returning();

    revalidatePath("/agency/dashboard/trips");
    revalidatePath("/");
    return deletedTrip;
  } catch (error) {
    console.error("Error deleting trip:", error);
    throw error;
  }
}
