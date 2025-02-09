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
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="grid gap-10 md:grid-cols-2">
        {/* Images Gallery */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {trip.images.map((image, index) => (
              <div
                key={image.id}
                className="relative aspect-video rounded-lg overflow-hidden shadow transition-transform duration-300 hover:scale-105"
              >
                <Image
                  src={image.imageUrl}
                  alt={`${trip.name} image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Trip Details */}
        <div className="bg-white rounded-lg shadow p-8 space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{trip.name}</h1>
            <p className="text-lg text-gray-500 mt-2">{trip.destination}</p>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold text-green-600">
              {formatPrice(trip.price)}
            </div>
            <div className="text-sm text-gray-500">
              {trip.capacity} spots available
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Trip Duration
            </h2>
            <p className="text-gray-600">
              {new Date(trip.startDate).toLocaleDateString()} -{" "}
              {new Date(trip.endDate).toLocaleDateString()}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Description
            </h2>
            <p className="text-gray-600 whitespace-pre-wrap">
              {trip.description}
            </p>
          </div>

          {/* Activities Section */}
          {trip.activities.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Included Activities
              </h2>
              <div className="space-y-4">
                {trip.activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-300"
                  >
                    <h3 className="font-medium text-gray-800">
                      {activity.activityName}
                    </h3>
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
            <div className="bg-red-50 border border-red-300 text-red-700 p-4 rounded-lg mt-8">
              This trip is currently not available for booking.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
