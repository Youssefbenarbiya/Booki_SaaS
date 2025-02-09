import { getTrips } from "@/actions/tripActions"
import Link from "next/link"
import Image from "next/image"
import { formatPrice } from "@/lib/utils"

export default async function TripsPage() {
  const trips = await getTrips()

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Trips</h1>
        <Link
          href="/admin/dashboard/trips/new"
          className="mt-4 sm:mt-0 inline-flex items-center rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add New Trip
        </Link>
      </div>

      {/* Trips Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {trips.map((trip) => (
          <div
            key={trip.id}
            className="bg-white rounded-lg shadow transition hover:shadow-lg"
          >
            {trip.images[0] && (
              <figure className="relative h-56 w-full overflow-hidden">
                <Image
                  src={trip.images[0].imageUrl}
                  alt={trip.name}
                  fill
                  className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                />
              </figure>
            )}
            <div className="p-4 space-y-2">
              <h2 className="text-xl font-semibold text-gray-800">
                {trip.name}
              </h2>
              <p className="text-sm text-gray-500">{trip.destination}</p>
              <p className="mt-2 font-medium text-lg text-green-600">
                {formatPrice(trip.price)}
              </p>
              <div className="flex items-center justify-between mt-4">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    trip.isAvailable
                      ? "text-green-800 bg-green-100"
                      : "text-red-800 bg-red-100"
                  }`}
                >
                  {trip.isAvailable ? "Available" : "Not Available"}
                </span>
                <div className="flex space-x-2">
                  <Link
                    href={`/admin/dashboard/trips/${trip.id}/edit`}
                    className="inline-flex items-center rounded-md border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/admin/dashboard/trips/${trip.id}`}
                    className="inline-flex items-center rounded-md bg-orange-600 px-3 py-1 text-sm font-medium text-white shadow hover:bg-blue-700 transition-colors"
                  >
                    View
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
