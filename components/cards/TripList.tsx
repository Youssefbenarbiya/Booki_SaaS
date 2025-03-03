import Image from "next/image"
import Link from "next/link"
import { formatPrice } from "@/lib/utils"

type Trip = Awaited<
  ReturnType<typeof import("@/actions/searchTrips").searchTrips>
>[number]

interface TripListProps {
  trips: Trip[]
}

export default function TripList({ trips }: TripListProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
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
                <p className="mt-2 font-medium text-lg text-green-600">
                  {formatPrice(Number(trip.price))}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    trip.capacity > 0
                      ? "text-green-800 bg-green-100"
                      : "text-red-800 bg-red-100"
                  }`}
                >
                  {trip.capacity > 0 ? "Available" : "Not Available"}
                </span>
                <div className="flex space-x-2">
                  <Link
                    href={`/trips/${trip.id}`}
                    className="inline-flex items-center rounded-md bg-orange-600 px-3 py-1 text-sm font-medium text-white shadow hover:bg-blue-700 transition-colors"
                  >
                    View Details
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
