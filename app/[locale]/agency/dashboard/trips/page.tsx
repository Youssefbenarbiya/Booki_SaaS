import Link from "next/link"
import { getTrips } from "@/actions/trips/tripActions"
import { TripsTable } from "./trips-table"
import { columns, TripType } from "./columns"
import { Locale } from "@/i18n/routing"

interface TripsPageProps {
  params: {
    locale: Locale
  }
}

export default async function TripsPage({ params }: TripsPageProps) {
  const { locale } = params
  const trips = await getTrips()

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Trips</h1>
        <Link
          href={`/${locale}/agency/dashboard/trips/new`}
          className="mt-4 sm:mt-0 inline-flex items-center rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add New Trip
        </Link>
      </div>

      {/* Trips Table - replacing the previous list view */}
      <TripsTable columns={columns} data={trips as TripType[]} />
    </div>
  )
}
