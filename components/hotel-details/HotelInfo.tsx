import { MapPin, Star } from "lucide-react"
import HotelLocationMap from "../HotelLocationMap"

interface HotelInfoProps {
  hotel: {
    name: string
    rating: number
    address: string
    city: string
    country: string
    description: string
    amenities: string[] | null
    latitude?: number | string
    longitude?: number | string
  }
}

export default function HotelInfo({ hotel }: HotelInfoProps) {
  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-2xl font-bold">{hotel.name}</h2>
        <div className="flex items-center">
          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
          <span className="ml-1 text-sm font-medium">{hotel.rating}</span>
        </div>
      </div>

      <p className="text-gray-500 mb-4">
        {hotel.address}, {hotel.city}, {hotel.country}
      </p>

      <div className="prose max-w-none mb-6">
        <p>{hotel.description}</p>
      </div>

      {hotel.amenities && hotel.amenities.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Hotel Amenities</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {hotel.amenities.map((amenity, index) => (
              <div
                key={index}
                className="bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-700"
              >
                {amenity}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Location/Map</h2>
          <div className="relative h-[200px] rounded-lg overflow-hidden">
            <HotelLocationMap
              latitude={hotel.latitude}
              longitude={hotel.longitude}
              height="200px"
              readOnly={true}
            />
          </div>
          <p className="mt-2 text-sm text-gray-600 flex items-start">
            <MapPin className="h-4 w-4 text-gray-500 mr-1 mt-0.5" />
            {hotel.address}, {hotel.city}, {hotel.country}
          </p>
        </div>
      </div>
    </div>
  )
}
