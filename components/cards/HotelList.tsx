import { HotelCard } from "./HotelCard"
import type { InferSelectModel } from "drizzle-orm"
import { hotel, room } from "@/db/schema"

type Hotel = InferSelectModel<typeof hotel> & {
  rooms: Array<InferSelectModel<typeof room>>
}

interface HotelListProps {
  hotels: Hotel[]
}

export default function HotelList({ hotels }: HotelListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {hotels.map((hotel) => (
        <HotelCard key={hotel.id} hotel={hotel} />
      ))}
    </div>
  )
}
