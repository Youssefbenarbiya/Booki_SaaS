import Link from "next/link"
import { trips } from "@/db/schema"
import { eq } from "drizzle-orm"
import { Card } from "@/components/ui/card"
import db from "@/db/drizzle"

export default async function DashboardPage() {
  // Fetch counts for dashboard overview
  const pendingTrips = await db.query.trips.findMany({
    where: eq(trips.status, "pending"),
  })

  const pendingCount = pendingTrips.length
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
          <Link href="/admin/verify-offers" className="text-blue-500 text-sm">
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
    </div>
  )
}
