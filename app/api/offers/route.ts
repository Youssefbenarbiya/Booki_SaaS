import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { desc, eq, sql, and, or, not } from "drizzle-orm";
import { trips, hotel, cars } from "@/db/schema";

export async function GET() {
  try {
    // Fetch top trips with discounts
    const topTrips = await db.query.trips.findMany({
      where: and(
        eq(trips.isAvailable, true),
        eq(trips.status, "approved"),
        not(eq(trips.discountPercentage, null))
      ),
      orderBy: [desc(trips.discountPercentage)],
      limit: 6,
      with: {
        images: true,
      },
    });

    // Fetch top hotels
    const topHotels = await db.query.hotel.findMany({
      where: and(eq(hotel.status, "approved")),
      limit: 6,
    });

    // Fetch top cars with discounts
    const topCars = await db.query.cars.findMany({
      where: and(
        eq(cars.isAvailable, true),
        eq(cars.status, "approved"),
        not(eq(cars.discountPercentage, null))
      ),
      orderBy: [desc(cars.discountPercentage)],
      limit: 6,
    });

    // Format trip data
    const formattedTrips = topTrips.map((trip) => ({
      id: trip.id,
      name: trip.name,
      description: trip.description,
      price: parseFloat(trip.originalPrice.toString()),
      currency: trip.currency,
      discount: trip.discountPercentage,
      image: trip.images?.[0]?.imageUrl || "/placeholder.svg",
      location: trip.destination,
      type: "trip",
    }));

    // Format hotel data
    const formattedHotels = topHotels.map((h) => ({
      id: h.id,
      name: h.name,
      description: h.description,
      // Since we don't have direct price in hotel, use a placeholder or lowest room price
      price: 100, // This should be replaced with actual logic to get lowest room price
      currency: "TND",
      discount: 10, // This is a placeholder, replace with actual discount if available
      image: h.images[0] || "/placeholder.svg",
      location: `${h.city}, ${h.country}`,
      type: "hotel",
    }));

    // Format car data
    const formattedCars = topCars.map((car) => ({
      id: car.id,
      name: `${car.brand} ${car.model}`,
      description: `${car.year} ${car.color} ${car.category}`,
      price: parseFloat(car.originalPrice.toString()),
      currency: car.currency,
      discount: car.discountPercentage,
      image: car.images[0] || "/placeholder.svg",
      location: car.location,
      type: "car",
    }));

    // Combine all offers and sort by discount percentage
    const allOffers = [...formattedTrips, ...formattedHotels, ...formattedCars]
      .sort((a, b) => (b.discount || 0) - (a.discount || 0))
      .slice(0, 12);

    return NextResponse.json(allOffers);
  } catch (error) {
    console.error("Error fetching offers:", error);
    return NextResponse.json(
      { error: "Failed to fetch offers" },
      { status: 500 }
    );
  }
}
