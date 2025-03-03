import RoomCard from "./RoomCard"

type Room = {
  id: string
  name: string
  roomType: string
  description: string
  capacity: number
  pricePerNight: number
  hotelId: string
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
  onBookRoom?: (roomId: string) => void
}

export default function RoomsList({ rooms, onBookRoom }: RoomsListProps) {
  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Available rooms</h2>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
              in
            </div>
            <span>Check-in</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
              out
            </div>
            <span>Check-out</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room as any} onBookRoom={onBookRoom} />
        ))}
      </div>

      <div className="mt-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Our customers say</h2>
          <button className="bg-yellow-500 text-white px-4 py-2 rounded text-sm font-medium">
            View all reviews
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white p-4 rounded-lg border border-gray-200"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                <div>
                  <p className="font-medium">Guest Name</p>
                  <div className="text-yellow-500 text-sm">★★★★★</div>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Great hotel with amazing amenities. The staff was very friendly
                and helpful. Would definitely stay here again!
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
