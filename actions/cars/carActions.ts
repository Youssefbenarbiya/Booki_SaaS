"use server";

import { cars, agencies, agencyEmployees } from "@/db/schema";
import { eq, and, sql, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import db from "@/db/drizzle";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { CarFormValues } from "@/app/[locale]/agency/dashboard/cars/types";
import { sendCarApprovalRequest } from "../admin/adminNotifications";

// Helper function to get the current session
async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    throw new Error("Unauthorized: No session found");
  }
  return session;
}

// Helper function to get the current user's agency ID
async function getAgencyId() {
  try {
    const session = await getSession();

    // First check if the user is an agency owner
    const agency = await db.query.agencies.findFirst({
      where: eq(agencies.userId, session.user.id),
    });

    if (agency) {
      return session.user.id; // Using the user ID as agencyId as per your schema
    }

    // If not an owner, check if they're an employee
    const employeeRecord = await db.query.agencyEmployees.findFirst({
      where: eq(agencyEmployees.employeeId, session.user.id),
    });

    if (employeeRecord) {
      return employeeRecord.agencyId;
    }

    console.error("No agency found for user ID:", session.user.id);
    throw new Error("No agency found for this user - not an owner or employee");
  } catch (error) {
    console.error("Error getting agency ID:", error);
    throw error;
  }
}

export async function getCars() {
  try {
    const agencyId = await getAgencyId();

    const allCars = await db.query.cars.findMany({
      where: (cars, { eq }) => eq(cars.agencyId, agencyId),
      orderBy: (cars, { desc }) => [desc(cars.createdAt)],
    });

    return { cars: allCars };
  } catch (error) {
    console.error("Failed to fetch cars:", error);
    throw new Error("Failed to fetch cars");
  }
}

export async function getCarById(id: number) {
  try {
    // Optionally, you can also check for session here if needed
    await getSession();

    const car = await db.query.cars.findFirst({
      where: eq(cars.id, id),
      with: {
        agency: {
          with: {
            user: true,
          },
        },
        bookings: true, // Include bookings information
      },
    });

    if (!car) {
      throw new Error("Car not found");
    }

    return { car };
  } catch (error) {
    console.error(`Failed to fetch car with ID ${id}:`, error);
    throw new Error("Failed to fetch car");
  }
}

export async function createCar(data: CarFormValues) {
  try {
    // Get session and agency for current user
    const agencyId = await getAgencyId();

    // Process discount fields: if discountPercentage exists and priceAfterDiscount is not provided, calculate it.
    const discountPercentage = data.discountPercentage;
    let priceAfterDiscount = data.priceAfterDiscount;
    if (discountPercentage !== undefined && discountPercentage !== null) {
      if (priceAfterDiscount === undefined || priceAfterDiscount === null) {
        priceAfterDiscount =
          Number(data.originalPrice) - (Number(data.originalPrice) * discountPercentage) / 100;
      }
    }

    // Ensure a car is marked as not available if the checkbox was unchecked
    // This is similar to how we handle it for trips
    const isAvailable =
      data.isAvailable !== undefined && data.isAvailable !== null
        ? data.isAvailable
        : true;

    // Process images to ensure they are strings
    const processedImages = Array.isArray(data.images)
      ? data.images.map(img => typeof img === 'string' ? img : img.imageUrl)
      : [];

    // Create car with discount fields included and always set status to "pending" for new cars
    const newCar = await db
      .insert(cars)
      .values({
        model: data.model,
        brand: data.brand,
        year: data.year,
        plateNumber: data.plateNumber,
        color: data.color,
        originalPrice: data.originalPrice.toString(),
        currency: data.currency || "TND",
        discountPercentage: discountPercentage ?? undefined,
        priceAfterDiscount:
          priceAfterDiscount !== undefined && priceAfterDiscount !== null
            ? priceAfterDiscount.toString()
            : undefined,
        isAvailable: isAvailable,
        images: processedImages,
        agencyId: agencyId,
        seats: data.seats || 4,
        category: data.category,
        location: data.location,
        status: "pending", // Always set to pending for admin approval
      })
      .returning();

    // Always send notification email to admin for new cars
    await sendCarApprovalRequest(newCar[0].id);

    revalidatePath("/agency/dashboard/cars");
    return { car: newCar[0] };
  } catch (error) {
    console.error("Failed to create car - detailed error:", error);

    // Duplicate plate number error handling
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (
      (errorMessage.toLowerCase().includes("duplicate") &&
        errorMessage.toLowerCase().includes("plate_number")) ||
      (errorMessage.toLowerCase().includes("unique") &&
        errorMessage.toLowerCase().includes("plate_number"))
    ) {
      throw new Error(
        "Plate Number must be unique. This plate number is already registered."
      );
    }

    throw new Error("Failed to create car");
  }
}

export async function updateCar(id: number, data: CarFormValues) {
  try {
    // Ensure the user is authenticated before updating
    await getSession();

    // Process discount fields: calculate discounted price if needed.
    const discountPercentage = data.discountPercentage;
    let priceAfterDiscount = data.priceAfterDiscount;
    if (discountPercentage !== undefined && discountPercentage !== null) {
      if (priceAfterDiscount === undefined || priceAfterDiscount === null) {
        priceAfterDiscount =
          Number(data.originalPrice) - (Number(data.originalPrice) * discountPercentage) / 100;
      }
    }

    // Ensure isAvailable is explicitly set
    const isAvailable =
      data.isAvailable !== undefined && data.isAvailable !== null
        ? data.isAvailable
        : true;

    // Process images to ensure they are strings
    const processedImages = Array.isArray(data.images)
      ? data.images.map(img => typeof img === 'string' ? img : img.imageUrl)
      : [];

    const updatedCar = await db
      .update(cars)
      .set({
        model: data.model,
        brand: data.brand,
        year: data.year,
        plateNumber: data.plateNumber,
        color: data.color,
        originalPrice: data.originalPrice.toString(),
        currency: data.currency || "TND",
        discountPercentage: discountPercentage ?? null,
        priceAfterDiscount:
          priceAfterDiscount !== undefined && priceAfterDiscount !== null
            ? priceAfterDiscount.toString()
            : null,
        isAvailable: isAvailable,
        images: processedImages,
        updatedAt: new Date(),
        seats: data.seats || 4,
        category: data.category,
        location: data.location,
        status: data.status || undefined, // Preserve existing status if not provided
      })
      .where(eq(cars.id, id))
      .returning();

    revalidatePath("/agency/dashboard/cars");
    return { car: updatedCar[0] };
  } catch (error) {
    console.error(`Failed to update car with ID ${id}:`, error);

    // Duplicate plate number error handling
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (
      errorMessage.toLowerCase().includes("duplicate") &&
      errorMessage.toLowerCase().includes("plate_number")
    ) {
      throw new Error(
        "Plate Number must be unique. This plate number is already registered."
      );
    }

    throw new Error("Failed to update car");
  }
}

export async function deleteCar(id: number) {
  try {
    // Ensure the user is authenticated before deleting
    await getSession();

    await db.delete(cars).where(eq(cars.id, id));
    revalidatePath("/agency/dashboard/cars");
    return { success: true };
  } catch (error) {
    console.error(`Failed to delete car with ID ${id}:`, error);
    throw new Error("Failed to delete car");
  }
}

export async function searchCars(
  pickupLocation: string,
  pickupDate: string,
  returnDate: string
) {
  try {
    // Add logging to debug the search parameters
    console.log("Searching cars with params:", {
      pickupLocation,
      pickupDate,
      returnDate,
    });

    // Validate and normalize inputs
    if (!pickupLocation || pickupLocation.trim() === "") {
      console.log("No pickup location provided, returning all available cars");
      const allAvailableCars = await db.query.cars.findMany({
        where: (cars, { eq }) => eq(cars.isAvailable, true),
      });
      console.log(
        `Found ${allAvailableCars.length} available cars (no location filter)`
      );
      return allAvailableCars;
    }

    // Convert the location to lowercase for case-insensitive search
    const normalizedLocation = pickupLocation.trim().toLowerCase();
    console.log("Normalized location search term:", normalizedLocation);

    // Use SQL LOWER function for case-insensitive comparison to avoid null issues
    const searchResults = await db
      .select()
      .from(cars)
      .where(
        and(
          eq(cars.isAvailable, true),
          sql`LOWER(COALESCE(${
            cars.location
          }, '')) LIKE ${`%${normalizedLocation}%`}`
        )
      );

    console.log(
      `Found ${searchResults.length} cars matching location: ${normalizedLocation}`
    );

    // If no cars found with the exact search, try a more flexible search
    if (searchResults.length === 0) {
      console.log(
        "No cars found with exact location match, trying broader search"
      );
      // Try alternative search by splitting the location and searching for parts
      const locationParts = normalizedLocation.split(/\s+/);
      const fallbackResults = await db
        .select()
        .from(cars)
        .where(
          and(
            eq(cars.isAvailable, true),
            or(
              ...locationParts.map(
                (part) =>
                  sql`LOWER(COALESCE(${cars.location}, '')) LIKE ${`%${part}%`}`
              )
            )
          )
        );

      console.log(`Found ${fallbackResults.length} cars in fallback search`);
      return fallbackResults;
    }

    return searchResults;
  } catch (error) {
    console.error("Failed to search cars:", error);
    // Return empty array instead of throwing to prevent UI errors
    return [];
  }
}

/**
 * Gets the availability information for a specific car.
 * Returns an array of booked date ranges that should be disabled in the calendar.
 */
export async function getCarAvailability(carId: number) {
  try {
    if (!carId) {
      throw new Error("Car ID is required");
    }

    // Ensure the user is authenticated before fetching bookings
    await getSession();

    // Get all bookings for this car
    const bookings = await db.query.carBookings.findMany({
      where: (carBookings, { eq }) => eq(carBookings.car_id, carId),
      orderBy: (carBookings, { asc }) => [asc(carBookings.start_date)],
    });

    // Format the bookings into date ranges that should be disabled
    const bookedDateRanges = bookings.map((booking) => ({
      startDate: new Date(booking.start_date),
      endDate: new Date(booking.end_date),
      bookingId: booking.id,
    }));

    return {
      success: true,
      bookedDateRanges,
    };
  } catch (error) {
    console.error(`Failed to get availability for car ${carId}:`, error);
    return {
      success: false,
      error: "Failed to get car availability information",
      bookedDateRanges: [],
    };
  }
}

export async function archiveCar(id: number) {
  try {
    // Check if car has any bookings
    const car = await db.query.cars.findFirst({
      where: eq(cars.id, id),
      with: {
        bookings: true,
      },
    });

    if (!car) {
      throw new Error("Car not found");
    }

    // If car has bookings, prevent archiving
    if (car.bookings && car.bookings.length > 0) {
      throw new Error(
        "Cannot archive a car with existing bookings. Please contact the agency."
      );
    }

    const [archivedCar] = await db
      .update(cars)
      .set({
        isAvailable: false,
        status: "archived",
        updatedAt: new Date(),
      })
      .where(eq(cars.id, id))
      .returning();

    revalidatePath("/agency/dashboard/cars");
    revalidatePath("/");
    return { car: archivedCar };
  } catch (error) {
    console.error(`Failed to archive car with ID ${id}:`, error);
    throw error;
  }
}

export async function publishCar(id: number) {
  try {
    const [publishedCar] = await db
      .update(cars)
      .set({
        isAvailable: true,
        status: "pending", // Will need admin approval
        updatedAt: new Date(),
      })
      .where(eq(cars.id, id))
      .returning();

    // Send notification email to admin
    await sendCarApprovalRequest(id);

    revalidatePath("/agency/dashboard/cars");
    revalidatePath("/");
    return { car: publishedCar };
  } catch (error) {
    console.error(`Failed to publish car with ID ${id}:`, error);
    throw error;
  }
}
