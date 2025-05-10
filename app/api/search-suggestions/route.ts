import { NextResponse } from "next/server";
import { hotel, trips, cars } from "@/db/schema";
import { like, or } from "drizzle-orm";
import db from "@/db/drizzle";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "";
  const type = searchParams.get("type") || "trips";

  try {
    let suggestions: string[] = [];

    if (type === "hotels") {
      // Search for hotel cities, countries
      const hotelData = await db
        .select({
          city: hotel.city,
          country: hotel.country,
        })
        .from(hotel)
        .where(
          or(like(hotel.city, `%${query}%`), like(hotel.country, `%${query}%`))
        )
        .limit(10);

      // Extract unique locations
      const cities = [...new Set(hotelData.map((item) => item.city))];
      const countries = [...new Set(hotelData.map((item) => item.country))];

      suggestions = [...cities, ...countries];
    } else if (type === "trips") {
      // Search for trip destinations
      const tripData = await db
        .select({
          destination: trips.destination,
          name: trips.name,
        })
        .from(trips)
        .where(
          or(
            like(trips.destination, `%${query}%`),
            like(trips.name, `%${query}%`)
          )
        )
        .limit(10);

      // Extract unique destinations
      const destinations = [
        ...new Set(tripData.map((item) => item.destination)),
      ];
      const names = [...new Set(tripData.map((item) => item.name))];

      suggestions = [...destinations, ...names];
    } else if (type === "rent") {
      // Search for car locations
      const carData = await db
        .select({
          location: cars.location,
        })
        .from(cars)
        .where(like(cars.location, `%${query}%`))
        .limit(10);

      // Extract unique locations
      suggestions = [...new Set(carData.map((item) => item.location))];
    }

    // // If no suggestions were found, return some defaults
    // if (suggestions.length === 0) {
    //   if (type === "hotels") {
    //     suggestions = ["Paris", "London", "New York", "Tokyo", "Rome"];
    //   } else if (type === "trips") {
    //     suggestions = [
    //       "Beach Vacation",
    //       "Mountain Retreat",
    //       "City Tour",
    //       "Adventure Trip",
    //     ];
    //   } else if (type === "rent") {
    //     suggestions = ["Airport", "City Center", "Train Station", "Hotel"];
    //   }
    // }

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return NextResponse.json(
      { error: "Failed to fetch suggestions" },
      { status: 500 }
    );
  }
}
