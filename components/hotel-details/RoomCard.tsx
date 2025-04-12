"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
import type { InferSelectModel } from "drizzle-orm"
import type { room } from "@/db/schema"
import { BedDouble, Users } from "lucide-react"
import Link from "next/link"
import { useCurrency } from "@/lib/contexts/CurrencyContext"

interface RoomCardProps {
  room: InferSelectModel<typeof room>
  onBookRoom: (roomId: string) => void
  checkIn?: string
  checkOut?: string
}

export default function RoomCard({ room }: RoomCardProps) {
  // Use the currency context for conversion
  const { currency, convertPrice } = useCurrency()
  
  // Get the room's base currency or default to TND
  const roomCurrency = room.currency || "TND"
  
  // Convert the price to the selected currency
  const convertedPrice = convertPrice(Number(room.pricePerNightAdult), roomCurrency)
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
      <div className="relative h-48">
        {room.images && room.images.length > 0 && (
          <Image
            src={room.images[0] || "/placeholder.svg"}
            alt={room.name}
            fill
            className="object-cover"
          />
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-medium">{room.name}</h3>
        <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
          <div className="flex items-center">
            <BedDouble className="h-4 w-4 mr-1" />
            <span>{room.roomType}</span>
          </div>
          <span>•</span>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            <span>Max {room.capacity}</span>
          </div>
        </div>

        <div className="mt-2 text-sm text-gray-600 line-clamp-2">
          {room.description}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="text-lg font-semibold">
            <span className="text-black">
              {formatPrice(convertedPrice, { currency })}
            </span>
            <span className="text-sm font-normal text-gray-500">/night</span>
          </div>
          <Button
            asChild
            className="bg-yellow-500 hover:bg-yellow-600 text-white border-none"
          >
            <Link href={`/hotels/${room.hotelId}/rooms/${room.id}/book`}>
              Book now
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
