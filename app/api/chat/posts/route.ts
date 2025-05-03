/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import db from "@/db/drizzle"
import { trips, hotel, room, cars } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get("id")
    const postType = searchParams.get("type")

    if (!postId || !postType) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      )
    }

    // Define a type for consistent post details
    type PostDetails = {
      id: string | number
      name: string
      [key: string]: any
    }

    let postDetails: PostDetails | null = null

    // Fetch details based on post type
    switch (postType) {
      case "trip":
        const tripData = await db.query.trips.findFirst({
          where: eq(trips.id, parseInt(postId)),
          columns: {
            id: true,
            name: true,
            destination: true,
          },
        })
        if (tripData) {
          postDetails = tripData as PostDetails
        }
        break

      case "hotel":
        const hotelData = await db.query.hotel.findFirst({
          where: eq(hotel.id, postId),
          columns: {
            id: true,
            name: true,
            city: true,
          },
        })
        if (hotelData) {
          postDetails = hotelData as PostDetails
        }
        break

      case "room":
        // For rooms, we need to join with the hotel to get a meaningful name
        const roomData = await db.query.room.findFirst({
          where: eq(room.id, postId),
          columns: {
            id: true,
            name: true,
            hotelId: true,
          },
          with: {
            hotel: {
              columns: {
                name: true,
              },
            },
          },
        })

        if (roomData) {
          postDetails = {
            id: roomData.id,
            name: `${roomData.name} at ${roomData.hotel.name}`,
          }
        }
        break

      case "car":
        const carData = await db.query.cars.findFirst({
          where: eq(cars.id, parseInt(postId)),
          columns: {
            id: true,
            brand: true,
            model: true,
          },
        })

        if (carData) {
          postDetails = {
            id: carData.id,
            name: `${carData.brand} ${carData.model}`,
            brand: carData.brand,
            model: carData.model,
          }
        }
        break

      default:
        return NextResponse.json(
          { error: "Invalid post type" },
          { status: 400 }
        )
    }

    if (!postDetails) {
      return NextResponse.json(
        {
          error: `${
            postType.charAt(0).toUpperCase() + postType.slice(1)
          } not found`,
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: postDetails.id,
      name: postDetails.name,
      type: postType,
    })
  } catch (error) {
    console.error("Error fetching post data:", error)
    return NextResponse.json(
      { error: "Failed to fetch post data" },
      { status: 500 }
    )
  }
}
