import {
  MapPin,
  Wifi,
  Coffee,
  Tv,
  Car,
  Snowflake,
  Utensils,
} from "lucide-react"

type HotelInfoProps = {
  hotel: {
    name: string
    rating: number
    address: string
    city: string
    country: string
    description: string
    amenities?: string[]
  }
}

export default function HotelInfo({ hotel }: HotelInfoProps) {
  return (
    <div className="mt-10">
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Overview</h2>
        <p className="text-gray-600 leading-relaxed">{hotel.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Amenities</h2>
          <div className="grid grid-cols-2 gap-y-4">
            <div className="flex items-center gap-2">
              <Wifi className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700">Free WiFi</span>
            </div>
            <div className="flex items-center gap-2">
              <Coffee className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700">Breakfast</span>
            </div>
            <div className="flex items-center gap-2">
              <Tv className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700">Flat-screen TV</span>
            </div>
            <div className="flex items-center gap-2">
              <Car className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700">Free parking</span>
            </div>
            <div className="flex items-center gap-2">
              <Snowflake className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700">Air conditioning</span>
            </div>
            <div className="flex items-center gap-2">
              <Utensils className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700">Restaurant</span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Location/Map</h2>
          <div className="relative h-[200px] rounded-lg overflow-hidden bg-gray-200">
            <div className="absolute inset-0 flex items-center justify-center">
              <MapPin className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="absolute bottom-2 right-2">
              <button className="bg-yellow-500 text-white text-xs font-medium px-3 py-1 rounded">
                View on map
              </button>
            </div>
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
