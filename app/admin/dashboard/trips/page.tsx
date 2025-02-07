import { getTrips } from "@/actions/tripActions"
import Link from "next/link"
import Image from "next/image"
import { formatPrice } from "@/lib/utils"

export default async function TripsPage() {
  const trips = await getTrips()

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Trips</h1>
        <Link href="/admin/dashboard/trips/new" className="btn btn-primary">
          Add New Trip
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {trips.map((trip) => (
          <div key={trip.id} className="card bg-base-100 shadow-lg">
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
              <p className="font-semibold">{formatPrice(trip.price)}</p>
              <div className="flex justify-between items-center mt-4">
                <span className={`badge ${trip.isAvailable ? 'badge-success' : 'badge-error'}`}>
                  {trip.isAvailable ? 'Available' : 'Not Available'}
                </span>
                <div className="card-actions justify-end">
                  <Link
                    href={`/admin/dashboard/trips/${trip.id}/edit`}
                    className="btn btn-sm btn-outline"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/admin/dashboard/trips/${trip.id}`}
                    className="btn btn-sm btn-primary"
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