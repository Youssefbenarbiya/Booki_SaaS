import { getTripById } from "@/actions/tripActions"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { formatPrice } from "@/lib/utils"
import DeleteTripButton from "./DeleteTripButton"

export default async function TripDetailsPage({
  params,
}: {
  params: Promise<{ tripId: string }>
}) {
  const { tripId } = await params
  const trip = await getTripById(parseInt(tripId))

  if (!trip) {
    notFound()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Trip Details</h1>
        <div className="flex flex-wrap gap-3 mt-4 sm:mt-0">
          <Link
            href="/admin/dashboard/trips"
            className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            Back to Trips
          </Link>
          <Link
            href={`/admin/dashboard/trips/${trip.id}/edit`}
            className="inline-flex items-center rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            Edit Trip
          </Link>
          <DeleteTripButton tripId={trip.id} />
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Images Gallery */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Images</h2>
          <div className="grid grid-cols-2 gap-4">
            {trip.images.map((image, index) => (
              <div
                key={image.id}
                className="relative aspect-video rounded-lg overflow-hidden shadow hover:shadow-md transition-shadow duration-300"
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
        <div className="space-y-6 bg-white p-6 rounded-lg shadow">
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Basic Information
            </h2>
            <div className="space-y-2 text-gray-700">
              <div>
                <span className="font-medium">Name:</span>{" "}
                <span className="text-gray-900">{trip.name}</span>
              </div>
              <div>
                <span className="font-medium">Destination:</span>{" "}
                <span className="text-gray-900">{trip.destination}</span>
              </div>
              <div>
                <span className="font-medium">Price:</span>{" "}
                <span className="text-gray-900">{formatPrice(trip.price)}</span>
              </div>
              <div>
                <span className="font-medium">Capacity:</span>{" "}
                <span className="text-gray-900">{trip.capacity} persons</span>
              </div>
              <div>
                <span className="font-medium">Status:</span>{" "}
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    trip.isAvailable
                      ? "text-green-800 bg-green-100"
                      : "text-red-800 bg-red-100"
                  }`}
                >
                  {trip.isAvailable ? "Available" : "Not Available"}
                </span>
              </div>
              <div>
                <span className="font-medium">Duration:</span>{" "}
                <span className="text-gray-900">
                  {new Date(trip.startDate).toLocaleDateString()} -{" "}
                  {new Date(trip.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
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
                Activities
              </h2>
              <div className="space-y-4">
                {trip.activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-300"
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
        </div>
      </div>
    </div>
  )
}
