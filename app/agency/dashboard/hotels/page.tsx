import { getHotels } from "@/actions/hotels&rooms/hotelActions"
import Link from "next/link"
import { HotelsTable } from "./hotels-table"
import { columns, HotelType } from "./columns"

export default async function HotelsPage() {
  const hotels = await getHotels()

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Hotels</h1>
        <Link
          href="/agency/dashboard/hotels/new"
          className="mt-4 sm:mt-0 inline-flex items-center rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
        >
          Add New Hotel
        </Link>
      </div>

      {/* Hotels Table - replacing the previous list view */}
      <HotelsTable columns={columns} data={hotels as HotelType[]} />
    </div>
  )
}
