import Link from "next/link"
import Image from "next/image"
import { formatPrice } from "@/lib/utils"

interface RoomsListProps {
  rooms: Array<{
    id: string
    name: string
    description: string | null
    capacity: number | null
    pricePerNightChild: string
    pricePerNightAdult: string
    roomType: string | null
    images: string[] | null
    amenities: string[] | null
    hotelId: string
  }>
}

export default function RoomsList({ rooms }: RoomsListProps) {
  if (!rooms.length) {
    return (
      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <p className="text-center text-gray-500">No rooms available</p>
      </div>
    )
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Available Rooms</h2>
      <div className="space-y-6">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="border border-gray-200 rounded-lg overflow-hidden bg-white"
          >
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative h-64 md:h-full">
                {room.images && room.images.length > 0 ? (
                  <Image
                    src={room.images[0]}
                    alt={room.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-100">
                    <p className="text-gray-400">No image available</p>
                  </div>
                )}
              </div>
              <div className="p-4 md:col-span-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{room.name}</h3>
                    <p className="text-sm text-gray-500">
                      {room.roomType} • Up to {room.capacity} guests
                    </p>
                  </div>
                  <p className="text-lg font-bold">
                    {formatPrice(room.pricePerNightChild)}
                    <span className="text-sm font-normal text-gray-500">
                      /night
                    </span>
                  </p>
                </div>

                <p className="mt-2 text-gray-700">{room.description}</p>

                {/* Room Amenities */}
                {room.amenities && room.amenities.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-sm mb-2">Amenities</h4>
                    <div className="flex flex-wrap gap-2">
                      {room.amenities.map((amenity, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-800 text-xs rounded-full px-2 py-1"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 flex justify-end">
                  <Link
                    href={`/hotels/${room.hotelId}/rooms/${room.id}/book`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
