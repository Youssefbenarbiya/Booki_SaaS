import { getHotels } from "@/actions/hotelActions"
import Link from "next/link"
import Image from "next/image"
import DeleteHotelButton from "./[hotelId]/DeleteHotelButton"

export default async function HotelsPage() {
  const hotels = await getHotels()

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Hotels</h1>
        <Link href="/admin/dashboard/hotels/new" className="btn btn-primary">
          Add New Hotel
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {hotels.map((hotel) => (
          <div
            key={hotel.id}
            className="card bg-base-100 shadow-xl"
          >
            {/* Hotel Image */}
            <figure className="relative h-48">
              {hotel.images?.[0] ? (
                <Image
                  src={hotel.images[0]}
                  alt={hotel.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
            </figure>

            <div className="card-body">
              <h2 className="card-title">
                {hotel.name}
                <div className="badge badge-secondary">{hotel.rating}★</div>
              </h2>
              <p className="text-sm text-gray-600">
                {hotel.city}, {hotel.country}
              </p>
              <p className="line-clamp-2">{hotel.description}</p>
              <p className="text-sm">
                {hotel.rooms.length} Room{hotel.rooms.length !== 1 ? "s" : ""}
              </p>

              <div className="card-actions justify-end mt-4">
                <Link
                  href={`/admin/dashboard/hotels/${hotel.id}`}
                  className="btn btn-sm btn-outline"
                >
                  View Details
                </Link>
                <Link
                  href={`/admin/dashboard/hotels/${hotel.id}/edit`}
                  className="btn btn-sm btn-secondary"
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