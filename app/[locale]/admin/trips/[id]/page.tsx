import { trips, tripImages, tripActivities } from "@/db/schema"
import { eq } from "drizzle-orm"
import db from "@/db/drizzle"
import Link from "next/link"
import { notFound } from "next/navigation"
import { TripApprovalActions } from "@/components/dashboard/admin/TripApprovalActions"
import Image from "next/image"
import { CheckCircle, XCircle } from "lucide-react"

export default async function TripDetailsPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>
}) {
  const { id, locale } = await params
  const tripId = parseInt(id)

  if (isNaN(tripId)) {
    return notFound()
  }

  // Fetch trip details with agency information
  const trip = await db.query.trips.findFirst({
    where: eq(trips.id, tripId),
    with: {
      agency: {
        with: {
          user: true,
        },
      },
    },
  })

  if (!trip) {
    return notFound()
  }

  // Fetch trip images
  const images = await db.query.tripImages.findMany({
    where: eq(tripImages.tripId, tripId),
  })

  // Fetch trip activities
  const activities = await db.query.tripActivities.findMany({
    where: eq(tripActivities.tripId, tripId),
  })

  // Determine if the trip has a discount
  const hasDiscount = trip.discountPercentage !== null
  const originalPrice = parseFloat(trip.originalPrice.toString()).toFixed(2)
  const discountedPrice = hasDiscount
    ? parseFloat(trip.priceAfterDiscount!.toString()).toFixed(2)
    : null

  // Calculate duration in days
  const durationInDays = Math.ceil(
    (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) /
      (1000 * 60 * 60 * 24)
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Link
          href={`/${locale}/admin/verify-offers`}
          className="text-indigo-600 hover:text-indigo-900 flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Offers List
        </Link>
        <div className="flex items-center">
          <span className="mr-2 text-sm text-gray-500">
            Status:{" "}
            <span className="uppercase font-semibold">{trip.status}</span>
          </span>
          {trip.status === "pending" && (
            <TripApprovalActions offerId={trip.id} />
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{trip.name}</h1>
          <p className="text-gray-600 mb-4">
            {trip.destination} • {new Date(trip.startDate).toLocaleDateString()}{" "}
            to {new Date(trip.endDate).toLocaleDateString()}
          </p>

          {/* Agency Information */}
          {trip.agency && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg flex items-center">
              <div className="flex-grow">
                <h3 className="font-medium">Agency Information</h3>
                <p className=" text-blue-900">
                  {trip.agency.agencyName}{" "}
                  <span className="ml-2 inline-flex items-center">
                    {trip.agency.isVerified ? (
                      <span className="text-green-600 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1 text-sm" />
                        Verified
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center text-sm">
                        <XCircle className="h-4 w-4 mr-1" />
                        Not Verified
                      </span>
                    )}
                  </span>
                </p>
                <p className="text-xs text-gray-500">
                  Contact: {trip.agency.contactEmail || trip.agency.user.email}
                </p>
              </div>
            </div>
          )}

          {/* Image Gallery */}
          {images.length > 0 ? (
            <div className="my-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Trip Images
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="overflow-hidden rounded-lg relative h-64"
                  >
                    <Image
                      src={image.imageUrl}
                      alt={`Image of ${trip.name}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                      priority={image.id === images[0]?.id} // Prioritize loading the first image
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="my-6 p-4 bg-gray-100 rounded-lg text-center">
              <p className="text-gray-500">No images available for this trip</p>
            </div>
          )}

          {/* Trip Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Trip Details
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Destination</p>
                    <p className="font-medium">{trip.destination}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Capacity</p>
                    <p className="font-medium">{trip.capacity} people</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="font-medium">
                      {new Date(trip.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">End Date</p>
                    <p className="font-medium">
                      {new Date(trip.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-medium">{durationInDays} days</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="font-medium">
                      {hasDiscount ? (
                        <>
                          <span className="line-through text-gray-400">
                            {trip.currency} {originalPrice}
                          </span>{" "}
                          <span className="text-green-600">
                            {trip.currency} {discountedPrice}
                          </span>
                          <span className="ml-1 text-xs text-green-600">
                            ({trip.discountPercentage}% off)
                          </span>
                        </>
                      ) : (
                        <span>
                          {trip.currency} {originalPrice}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Display discount details */}
                  {trip.groupDiscountEnabled && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Group Discount</p>
                      <p className="font-medium">
                        {trip.groupDiscountPercentage}% off for groups of{" "}
                        {trip.groupDiscountMinPeople}+ people
                      </p>
                    </div>
                  )}

                  {trip.childDiscountEnabled && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Child Discount</p>
                      <p className="font-medium">
                        {trip.childDiscountPercentage}% off for children
                      </p>
                    </div>
                  )}

                  {trip.advancePaymentEnabled && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Advance Payment</p>
                      <p className="font-medium">
                        {trip.advancePaymentPercentage}% required as advance
                        payment
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Description
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-line">
                  {trip.description || "No description provided."}
                </p>
              </div>
            </div>
          </div>

          {/* Activities */}
          {activities.length > 0 && (
            <div className="my-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Activities
              </h2>
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Activity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Schedule
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activities.map((activity) => (
                      <tr key={activity.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {activity.activityName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {activity.scheduledDate
                              ? new Date(
                                  activity.scheduledDate
                                ).toLocaleDateString()
                              : "Not scheduled"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500">
                            {activity.description || "No description provided."}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
