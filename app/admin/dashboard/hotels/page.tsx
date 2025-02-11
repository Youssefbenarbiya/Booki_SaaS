import { getHotels } from "@/actions/hotelActions"
import Link from "next/link"
import Image from "next/image"
import DeleteHotelButton from "./[hotelId]/DeleteHotelButton"

export default async function HotelsPage() {
  const hotels = await getHotels()

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Hotels</h1>
        <Link
          href="/admin/dashboard/hotels/new"
          className="mt-4 sm:mt-0 inline-flex items-center rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
        >
          Add New Hotel
        </Link>
      </div>

      {/* Hotels List */}
      <div className="space-y-6">
        {hotels.map((hotel) => (
          <div
            key={hotel.id}
            className="bg-white rounded-2xl shadow-md overflow-hidden transition transform hover:scale-[1.02] hover:shadow-lg w-full flex flex-col md:flex-row items-center"
          >
            {/* Hotel Image */}
            <figure className="relative w-full md:w-1/3 h-48 md:h-56 flex-shrink-0">
              {hotel.images?.[0] ? (
                <Image
                  src={hotel.images[0]}
                  alt={hotel.name}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-200">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
            </figure>

            {/* Hotel Details */}
            <div className="p-5 w-full md:w-2/3 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">
                  {hotel.name}
                </h2>
                <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-800">
                  {hotel.rating}★
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {hotel.city}, {hotel.country}
              </p>
              <p className="text-gray-700 line-clamp-2">{hotel.description}</p>
              <p className="text-sm font-medium text-gray-600">
                🏨 {hotel.rooms.length} Room
                {hotel.rooms.length !== 1 ? "s" : ""}
              </p>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-end gap-2 mt-4">
                <Link
                  href={`/admin/dashboard/hotels/${hotel.id}`}
                  className="inline-flex items-center rounded-md border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  View Details
                </Link>
                <Link
                  href={`/admin/dashboard/hotels/${hotel.id}/edit`}
                  className="inline-flex items-center rounded-md bg-orange-600 px-3 py-1 text-sm font-medium text-white shadow hover:bg-orange-700 transition"
                >
                  Edit
                </Link>
                <DeleteHotelButton hotelId={hotel.id} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
