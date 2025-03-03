import Image from "next/image"

type Room = {
  id: string
  name: string
  roomType: string
  description: string
  capacity: number
  pricePerNight: number
  images?: string[]
  amenities?: string[]
  availabilities?: {
    startDate: string
    endDate: string
    isAvailable: boolean
  }[]
}

type RoomsListProps = {
  rooms: Room[]
}

export default function RoomsList({ rooms }: RoomsListProps) {
  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Rooms</h2>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="bg-white rounded-lg shadow transition hover:shadow-lg overflow-hidden"
          >
            <figure className="relative h-56 w-full overflow-hidden">
              {room.images?.[0] ? (
                <Image
                  src={room.images[0]}
                  alt={room.name}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-200">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
            </figure>
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">
                  {room.name}
                </h3>
                <span className="rounded-full border border-gray-300 px-2 py-1 text-xs text-gray-600">
                  {room.roomType}
                </span>
              </div>
              <p className="text-gray-600 text-sm">{room.description}</p>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                <p>
                  <strong>Capacity:</strong> {room.capacity} guests
                </p>
                <p>
                  <strong>Price:</strong> ${room.pricePerNight}/night
                </p>
              </div>
              {room.images && room.images.length > 1 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {room.images.slice(1).map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-square overflow-hidden rounded transition hover:scale-105"
                    >
                      <Image
                        src={image}
                        alt={`${room.name} image ${index + 2}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
              {room.amenities && room.amenities.length > 0 && (
                <div className="mt-2">
                  <strong className="text-sm text-gray-800">
                    Room Amenities:
                  </strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {room.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="rounded-full border border-gray-300 px-2 py-1 text-xs text-gray-600"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {room.availabilities && room.availabilities.length > 0 && (
                <div className="mt-2">
                  <strong className="text-sm text-gray-800">
                    Availability:
                  </strong>
                  <div className="space-y-1 mt-1">
                    {room.availabilities.map((availability, index) => (
                      <div
                        key={index}
                        className={`text-xs p-1 rounded ${
                          availability.isAvailable
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {new Date(availability.startDate).toLocaleDateString()}{" "}
                        - {new Date(availability.endDate).toLocaleDateString()}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
