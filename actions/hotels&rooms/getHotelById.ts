"use server";

import { eq } from "drizzle-orm";
import db from "@/db/drizzle";
export async function getHotelById(hotelId: string) {
  try {
    const result = await db.query.hotel.findFirst({
      where: (hotels) => eq(hotels.id, hotelId),
      with: {
        rooms: {
          with: {
            availabilities: true,
          },
        },
        agency: {
          with: {
            user: true,
          },
        },
      },
    });
    return result;
  } catch (error) {
    console.error("Error getting hotel:", error);
    throw error;
  }
}
