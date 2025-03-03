import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function HotelHeader({ hotelName }: { hotelName: string }) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-medium">{hotelName}</h1>
        <div className="flex items-center">
          <span className="text-yellow-500">★★★★★</span>
          <span className="text-xs text-gray-500 ml-1">(5.0)</span>
        </div>
      </div>
      <Link
        href="/"
        className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        See all hotels
      </Link>
    </div>
  )
}
