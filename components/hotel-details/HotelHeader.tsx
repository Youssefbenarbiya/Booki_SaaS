import Link from "next/link"

export default function HotelHeader() {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
      <h1 className="text-3xl font-bold text-gray-900">Hotel Details</h1>
      <div className="flex flex-wrap gap-3 mt-4 sm:mt-0">
        <Link
          href="/"
          className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          Back to Hotels
        </Link>
      </div>
    </div>
  )
}
