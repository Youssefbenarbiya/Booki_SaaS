
import { HotelCard } from "./HotelCard"

type Hotel = Awaited<
  ReturnType<typeof import("@/actions/hotelActions").getHotels>
>[number]

interface HotelListProps {
  hotels: Hotel[]
}

export default function HotelList({ hotels }: HotelListProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {hotels.map((hotel) => (
        <HotelCard key={hotel.id} hotel={hotel} />
      ))}
    </div>
  )
}
