import { trips } from "@/db/schema"
import { eq } from "drizzle-orm"
import db from "@/db/drizzle"
import { TripApprovalActions } from "@/components/dashboard/admin/TripApprovalActions"

export default async function VerifyOffersPage() {
  // Fetch pending trips
  const pendingTrips = await db.query.trips.findMany({
    where: eq(trips.status, "pending"),
  })

  const pendingCount = pendingTrips.length

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Verify Offers</h1>

      {pendingCount > 0 && (
        <div id="pending-trips">
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
                {pendingTrips.map((trip) => {
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
                          {/* Display price with or without discount */}
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
                        <TripApprovalActions tripId={trip.id} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pendingCount === 0 && (
        <div className="text-center py-12 bg-white rounded-md shadow">
          <p className="text-gray-500">No pending offers to verify</p>
        </div>
      )}
    </div>
  )
}
