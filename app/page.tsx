import { getTrips } from "@/actions/tripActions"
import Image from "next/image"
import Link from "next/link"
import { formatPrice } from "@/lib/utils"

export default async function HomePage() {
  const trips = await getTrips()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Available Trips</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {trips.map((trip) => (
          <div key={trip.id} className="card bg-base-100 shadow-xl">
            {trip.images[0] && (
              <figure className="relative h-48">
                <Image
                  src={trip.images[0].imageUrl}
                  alt={trip.name}
                  fill
                  className="object-cover"
                />
              </figure>
            )}
            <div className="card-body">
              <h2 className="card-title">{trip.name}</h2>
              <p className="text-sm text-gray-600">{trip.destination}</p>
              <div className="flex justify-between items-center mt-2">
                <p className="font-semibold">{formatPrice(trip.price)}</p>
                <span className="text-sm">
                  {trip.capacity} spots available
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-2">
                {new Date(trip.startDate).toLocaleDateString()} -{" "}
                {new Date(trip.endDate).toLocaleDateString()}
              </div>
              <div className="card-actions justify-end mt-4">
                <Link
                  href={`/trips/${trip.id}`}
                  className="btn btn-primary"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
