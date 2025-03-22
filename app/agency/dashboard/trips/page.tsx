import Link from "next/link"
import Image from "next/image"
import { formatPrice } from "@/lib/utils"
import DeleteTripButton from "./[tripId]/DeleteTripButton"
import { getTrips } from "@/actions/trips/tripActions"

export default async function TripsPage() {
  const trips = await getTrips()

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Trips</h1>
        <Link
          href="/agency/dashboard/trips/new"
          className="mt-4 sm:mt-0 inline-flex items-center rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add New Trip
        </Link>
      </div>

      {/* Trips List */}
      <div className="flex flex-col gap-6">
        {trips.map((trip) => (
          <div
            key={trip.id}
            className="bg-white rounded-lg shadow transition hover:shadow-lg flex overflow-hidden"
          >
            {trip.images[0] && (
              <figure className="relative w-1/3 h-40 overflow-hidden">
                <Image
                  src={trip.images[0].imageUrl}
                  alt={trip.name}
                  fill
                  className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                />
              </figure>
            )}
            <div className="p-4 w-2/3 space-y-2 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {trip.name}
                </h2>
                <p className="text-sm text-gray-500">{trip.destination}</p>
                <div className="mt-2 space-y-1">
                  {trip.discountPercentage ? (
                    <>
                      <p className="text-sm text-gray-500 line-through">
                        Original: {formatPrice(trip.originalPrice)}
                      </p>
                      <p className="font-medium text-lg text-green-600 flex items-center gap-2">
                        {formatPrice(
                          trip.priceAfterDiscount || trip.originalPrice
                        )}
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                          {trip.discountPercentage}% OFF
                        </span>
                      </p>
                    </>
                  ) : (
                    <p className="font-medium text-lg text-gray-900">
                      {formatPrice(trip.originalPrice)}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
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
                    href={`/agency/dashboard/trips/${trip.id}/edit`}
                    className="inline-flex items-center rounded-md border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/agency/dashboard/trips/${trip.id}`}
                    className="inline-flex items-center rounded-md bg-orange-600 px-3 py-1 text-sm font-medium text-white shadow hover:bg-blue-700 transition-colors"
                  >
                    View
                  </Link>
                  <DeleteTripButton tripId={trip.id} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
