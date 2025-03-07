"use client"

import Image from "next/image"
import Link from "next/link"
import { formatPrice } from "@/lib/utils"
import type { InferSelectModel } from "drizzle-orm"
import { hotel, room } from "@/db/schema"

type Hotel = InferSelectModel<typeof hotel> & {
  rooms: Array<InferSelectModel<typeof room>>
}

interface HotelCardProps {
  hotel: Hotel
}

export function HotelCard({ hotel }: HotelCardProps) {
  // Add console log to debug
  console.log("Hotel data:", hotel.id)

  return (
    <div className="card bg-white shadow-xl rounded-lg overflow-hidden">
      {hotel.images?.[0] && (
        <figure className="relative h-48">
          <Image
            src={hotel.images[0]}
            alt={hotel.name}
            fill
            className="object-cover"
          />
        </figure>
      )}
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold">{hotel.name}</h2>
            <p className="text-sm text-muted-foreground">
              {hotel.city}, {hotel.country}
            </p>
          </div>
          <div className="flex items-center">
            <span className="text-orange-500">★</span>
            <span className="ml-1">{hotel.rating}</span>
          </div>
        </div>

        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
          {hotel.description}
        </p>

        <div className="mt-4 flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">Starting from</p>
            <p className="text-lg font-semibold">
              {formatPrice(
                Math.min(
                  ...hotel.rooms.map((room) => Number(room.pricePerNightChild))
                )
              )}
              <span className="text-sm font-normal text-muted-foreground">
                /night
              </span>
            </p>
          </div>
          <Link
            href={`/hotels/${hotel.id}`}
            className="inline-flex items-center justify-center rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  )
}
