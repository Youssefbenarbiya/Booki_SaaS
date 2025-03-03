"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
import type { InferSelectModel } from "drizzle-orm"
import { room } from "@/db/schema"
import { BedDouble, Users } from "lucide-react"

interface RoomCardProps {
  room: InferSelectModel<typeof room>
  onBookRoom: (roomId: string) => void
  checkIn?: string
  checkOut?: string
}

export default function RoomCard({
  room,
  onBookRoom,
 
}: RoomCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="flex flex-col lg:flex-row">
        <div className="lg:w-1/3 relative h-48 lg:h-auto">
          {room.images && room.images.length > 0 && (
            <Image
              src={room.images[0]}
              alt={room.name}
              fill
              className="object-cover"
            />
          )}
        </div>
        <div className="p-6 flex-1">
          <div className="flex flex-col lg:flex-row justify-between">
            <div>
              <h3 className="text-lg font-semibold">{room.name}</h3>

              <div className="mt-2 flex flex-wrap gap-4">
                <div className="flex items-center text-sm text-gray-600">
                  <BedDouble className="h-4 w-4 mr-1" />
                  <span>{room.roomType}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-1" />
                  <span>Max {room.capacity} guests</span>
                </div>
              </div>

              <p className="mt-3 text-sm text-gray-600">{room.description}</p>

              <div className="mt-4">
                <h4 className="font-medium text-sm">Amenities</h4>
                <div className="mt-1 flex flex-wrap gap-2 text-xs">
                  {room.amenities &&
                    room.amenities.map((amenity, idx) => (
                      <span
                        key={idx}
                        className="bg-gray-100 text-gray-800 px-2 py-1 rounded"
                      >
                        {amenity}
                      </span>
                    ))}
                </div>
              </div>
            </div>

            <div className="mt-4 lg:mt-0 lg:ml-4 lg:text-right">
              <div className="text-xl font-bold text-orange-600">
                {formatPrice(Number(room.pricePerNight))}
                <span className="text-sm font-normal text-gray-600">
                  /night
                </span>
              </div>

              <Button
                onClick={() => onBookRoom(room.id)}
                className="mt-3 bg-orange-600 hover:bg-orange-700 text-white"
              >
                Book Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
