import { getTripById } from "@/actions/tripActions"
import { notFound } from "next/navigation"
import Image from "next/image"
import { formatPrice } from "@/lib/utils"
import BookTripButton from "./BookTripButton"

export default async function TripDetailsPage({
  params,
}: {
  params: { tripId: string }
}) {
  const trip = await getTripById(parseInt(params.tripId))

  if (!trip) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        {/* Images Gallery */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {trip.images.map((image, index) => (
              <div key={image.id} className="relative aspect-video">
                <Image
                  src={image.imageUrl}
                  alt={`${trip.name} image ${index + 1}`}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Trip Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{trip.name}</h1>
            <p className="text-xl text-gray-600 mt-2">{trip.destination}</p>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold">{formatPrice(trip.price)}</div>
            <div className="text-gray-600">
              {trip.capacity} spots available
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Trip Duration</h2>
            <p>
              {new Date(trip.startDate).toLocaleDateString()} -{" "}
              {new Date(trip.endDate).toLocaleDateString()}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-600 whitespace-pre-wrap">
              {trip.description}
            </p>
          </div>

          {/* Activities Section */}
          {trip.activities.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Included Activities</h2>
              <div className="space-y-4">
                {trip.activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="card bg-base-100 shadow-sm p-4"
                  >
                    <h3 className="font-medium">{activity.activityName}</h3>
                    {activity.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {activity.description}
                      </p>
                    )}
                    {activity.scheduledDate && (
                      <p className="text-sm text-gray-500 mt-2">
                        Scheduled for:{" "}
                        {new Date(activity.scheduledDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Booking Section */}
          {trip.isAvailable ? (
            <div className="mt-8">
              <BookTripButton tripId={trip.id} />
            </div>
          ) : (
            <div className="alert alert-error mt-8">
              This trip is currently not available for booking.
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 