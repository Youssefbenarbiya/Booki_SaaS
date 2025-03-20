import Link from "next/link"
import { trips } from "@/db/schema"
import { eq } from "drizzle-orm"
import { Card } from "@/components/ui/card"
import db from "@/db/drizzle"
import { TripApprovalActions } from "@/components/admin/TripApprovalActions"

export default async function DashboardPage() {
  // Fetch counts for dashboard overview
  const pendingTrips = await db.query.trips.findMany({
    where: eq(trips.status, "pending"),
  })

  const pendingCount = pendingTrips.length

  // You could add more stats here
  const allTrips = await db.query.trips.findMany()
  const totalTrips = allTrips.length

  const allUsers = await db.query.user.findMany()
  const totalUsers = allUsers.length

  const allBookings = await db.query.tripBookings.findMany()
  const totalBookings = allBookings.length

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 shadow-md">
          <h3 className="font-semibold text-lg">Pending Trips</h3>
          <p className="text-3xl font-bold">{pendingCount}</p>
          <Link href="#pending-trips" className="text-blue-500 text-sm">
            View all
          </Link>
        </Card>

        <Card className="p-4 shadow-md">
          <h3 className="font-semibold text-lg">Total Trips</h3>
          <p className="text-3xl font-bold">{totalTrips}</p>
        </Card>

        <Card className="p-4 shadow-md">
          <h3 className="font-semibold text-lg">Users</h3>
          <p className="text-3xl font-bold">{totalUsers}</p>
        </Card>

        <Card className="p-4 shadow-md">
          <h3 className="font-semibold text-lg">Bookings</h3>
          <p className="text-3xl font-bold">{totalBookings}</p>
        </Card>
      </div>

      {pendingCount > 0 && (
        <div id="pending-trips" className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Trips Pending Approval</h2>
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
                {pendingTrips.map((trip) => (
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
                        ${parseFloat(trip.price.toString()).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <TripApprovalActions tripId={trip.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
