"use client"

import Image from "next/image"
import Link from "next/link"
import { formatPrice } from "@/lib/utils"
import type { InferSelectModel } from "drizzle-orm"
import { hotel, room } from "@/db/schema"
import { Heart } from "lucide-react"
import { useFavorite } from "@/lib/hooks/useFavorite"
import { useCurrency } from "@/lib/contexts/CurrencyContext"
import { useParams } from "next/navigation"

type Hotel = InferSelectModel<typeof hotel> & {
  rooms: Array<InferSelectModel<typeof room>>
}

interface HotelCardProps {
  hotel: Hotel
}

export function HotelCard({ hotel }: HotelCardProps) {
  const { isFavorite, toggleFavorite, isLoading } = useFavorite(
    hotel.id,
    "hotel"
  )

  // Get locale from URL params
  const params = useParams()
  const locale = params.locale as string

  // Use the currency context for conversion
  const { currency, convertPrice } = useCurrency()

  // Get the minimum room price
  const getMinRoomPrice = () => {
    if (!hotel.rooms || hotel.rooms.length === 0) return 0

    // Find the room with the minimum price
    const minPriceRoom = hotel.rooms.reduce((minRoom, currentRoom) => {
      const currentPrice = Number(currentRoom.pricePerNightChild)
      const minPrice = Number(minRoom.pricePerNightChild)
      return currentPrice < minPrice ? currentRoom : minRoom
    }, hotel.rooms[0])

    // Get the room's currency or default to TND
    const roomCurrency = minPriceRoom.currency || "TND"

    // Convert the minimum price to the selected currency
    const convertedPrice = convertPrice(
      Number(minPriceRoom.pricePerNightChild),
      roomCurrency
    )

    return convertedPrice
  }

  // Calculate the converted minimum price
  const convertedMinPrice = getMinRoomPrice()

  return (
    <div className="card bg-white shadow-xl rounded-lg overflow-hidden">
      {hotel.images?.[0] && (
        <figure className="relative h-48">
          {/* Add favorite button */}
          <button
            onClick={(e) => {
              e.preventDefault()
              toggleFavorite()
            }}
            disabled={isLoading}
            className="absolute top-3 left-3 z-10 bg-black/30 p-2 rounded-full hover:bg-black/50 transition-colors"
          >
            <Heart
              className={`h-5 w-5 ${
                isFavorite ? "fill-red-500 text-red-500" : "text-white"
              }`}
            />
          </button>

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
              {formatPrice(convertedMinPrice, { currency })}
              <span className="text-sm font-normal text-muted-foreground">
                /night
              </span>
            </p>
          </div>
          <Link
            href={`/${locale}/hotels/${hotel.id}`}
            className="inline-flex items-center justify-center rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  )
}
