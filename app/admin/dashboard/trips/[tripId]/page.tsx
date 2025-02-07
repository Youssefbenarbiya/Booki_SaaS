import { getTripById } from "@/actions/tripActions"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { formatPrice } from "@/lib/utils"
import DeleteTripButton from "./DeleteTripButton"

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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Trip Details</h1>
        <div className="flex gap-2">
          <Link href="/admin/dashboard/trips" className="btn btn-outline">
            Back to Trips
          </Link>
          <Link
            href={`/admin/dashboard/trips/${trip.id}/edit`}
            className="btn btn-secondary"
          >
            Edit Trip
          </Link>
          <DeleteTripButton tripId={trip.id} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Images Gallery */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Images</h2>
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
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="grid gap-2">
              <div>
                <span className="font-medium">Name:</span> {trip.name}
              </div>
              <div>
                <span className="font-medium">Destination:</span>{" "}
                {trip.destination}
              </div>
              <div>
                <span className="font-medium">Price:</span>{" "}
                {formatPrice(trip.price)}
              </div>
              <div>
                <span className="font-medium">Capacity:</span> {trip.capacity}{" "}
                persons
              </div>
              <div>
                <span className="font-medium">Status:</span>{" "}
                <span
                  className={`badge ${
                    trip.isAvailable ? "badge-success" : "badge-error"
                  }`}
                >
                  {trip.isAvailable ? "Available" : "Not Available"}
                </span>
              </div>
              <div>
                <span className="font-medium">Duration:</span>{" "}
                {new Date(trip.startDate).toLocaleDateString()} -{" "}
                {new Date(trip.endDate).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="whitespace-pre-wrap">{trip.description}</p>
          </div>

          {/* Activities Section */}
          {trip.activities.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Activities</h2>
              <div className="space-y-4">
                {trip.activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="card bg-base-100 shadow-sm p-4"
                  >
                    <h3 className="font-medium">{activity.activityName}</h3>
                    {activity.description && (
                      <p className="text-sm text-gray-600">
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