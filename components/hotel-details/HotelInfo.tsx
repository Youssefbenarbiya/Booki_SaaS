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
    <div className="space-y-6 bg-white p-6 rounded-lg shadow">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold text-gray-900">{hotel.name}</h2>
        <span className="rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800">
          {hotel.rating}★
        </span>
      </div>
      <div className="space-y-2 text-gray-700">
        <p>
          <strong>Location:</strong> {hotel.address}, {hotel.city},{" "}
          {hotel.country}
        </p>
        <p className="whitespace-pre-wrap text-gray-600">{hotel.description}</p>
        {hotel.amenities && hotel.amenities.length > 0 && (
          <div>
            <strong className="text-gray-800">Amenities:</strong>
            <div className="flex flex-wrap gap-2 mt-1">
              {hotel.amenities.map((amenity, index) => (
                <span
                  key={index}
                  className="rounded-full border border-gray-300 px-3 py-1 text-xs text-gray-700"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
