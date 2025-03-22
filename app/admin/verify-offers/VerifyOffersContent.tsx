import { TripApprovalActions } from "@/components/dashboard/admin/TripApprovalActions"
import Link from "next/link"
import TabNavigation from "./TabNavigation"
import { getStatusCounts, getTripsByStatus } from "./serverFunctions"

// Force dynamic rendering so data is fetched on every navigation
export const dynamic = "force-dynamic"
export const revalidate = 0

interface VerifyOffersContentProps {
  status: string
}

export default async function VerifyOffersContent({
  status,
}: VerifyOffersContentProps) {
  // Mapping for display labels
  const statusLabels = {
    pending: "Pending Verification",
    approved: "Approved Offers",
    rejected: "Rejected Offers",
  }

  // Fetch counts and trips based on status using separate server functions
  const statusCounts = await getStatusCounts()
  const filteredTrips = await getTripsByStatus(status)
  const tripsCount = filteredTrips.length

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Trip Offers</h1>

      {/* Client component for navigation tabs */}
      <TabNavigation statusCounts={statusCounts} statusLabels={statusLabels} />

      <h2 className="text-xl font-medium text-gray-800">
        {statusLabels[status as keyof typeof statusLabels]}
      </h2>

      {tripsCount > 0 ? (
        <div id="filtered-trips">
          <div className="bg-white rounded-md shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trip Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destination
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTrips.map((trip) => {
                  // Determine if the trip has a discount
                  const hasDiscount = trip.discountPercentage !== null
                  const originalPrice = parseFloat(
                    trip.originalPrice.toString()
                  ).toFixed(2)
                  const discountedPrice = hasDiscount
                    ? parseFloat(trip.priceAfterDiscount!.toString()).toFixed(2)
                    : null

                  return (
                    <tr key={trip.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {trip.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {trip.destination}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(trip.startDate).toLocaleDateString()} -{" "}
                          {new Date(trip.endDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {hasDiscount ? (
                            <>
                              <span className="line-through text-gray-400">
                                ${originalPrice}
                              </span>{" "}
                              <span className="text-green-600">
                                ${discountedPrice}
                              </span>
                            </>
                          ) : (
                            <span>${originalPrice}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-3 items-center">
                          <Link
                            href={`/admin/trips/${trip.id}`}
                            className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded-md text-sm font-medium"
                          >
                            View Details
                          </Link>
                          {status === "pending" && (
                            <TripApprovalActions tripId={trip.id} />
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-md shadow">
          <p className="text-gray-500">No {status} offers found</p>
        </div>
      )}
    </div>
  )
}
