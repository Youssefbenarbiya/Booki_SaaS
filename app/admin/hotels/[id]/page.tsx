import db from "@/db/drizzle"
import { hotel } from "@/db/schema"
import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import HotelLocationMap from "@/components/HotelLocationMap"

export default async function HotelDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  const hotelId = params.id

  const hotelDetails = await db.query.hotel.findFirst({
    where: eq(hotel.id, hotelId),
    with: {
      rooms: true,
    },
  })

  if (!hotelDetails) {
    notFound()
  }

  const statusColor =
    {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    }[hotelDetails.status] || "bg-gray-100 text-gray-800"

  return (
    <div className="container py-6 max-w-4xl">
      <div className="mb-6">
        <Link
          href="/admin/verify-offers?tab=hotel"
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Hotel Listings
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Hotel details header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {hotelDetails.name}
              </h1>
              <p className="text-gray-600">
                {hotelDetails.address}, {hotelDetails.city},{" "}
                {hotelDetails.country}
              </p>
              <div className="flex items-center mt-2">
                <span className="text-amber-500">★</span>
                <span className="ml-1">{hotelDetails.rating} stars</span>
              </div>
            </div>
            <Badge className={statusColor}>{hotelDetails.status}</Badge>
          </div>
        </div>

        {/* Hotel Images */}
        {hotelDetails.images && hotelDetails.images.length > 0 && (
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold mb-3">Hotel Images</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {hotelDetails.images.map((image, index) => (
                <div
                  key={index}
                  className="relative h-36 rounded-lg overflow-hidden"
                >
                  <Image
                    src={image}
                    alt={`${hotelDetails.name} view ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hotel details content */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">Description</h2>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-700">{hotelDetails.description}</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">Amenities</h2>
              <div className="bg-gray-50 p-4 rounded-md">
                <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {hotelDetails.amenities?.map((amenity, i) => (
                    <li key={i} className="flex items-center">
                      <span className="mr-2">•</span>
                      {amenity}
                    </li>
                  )) || <p>No amenities listed</p>}
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">
                Room Types & Pricing
              </h2>
              <div className="bg-gray-50 p-4 rounded-md space-y-8">
                {hotelDetails.rooms && hotelDetails.rooms.length > 0 ? (
                  hotelDetails.rooms.map((room) => (
                    <div
                      key={room.id}
                      className="border-b pb-6 last:border-0 last:pb-0"
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-lg">{room.name}</h3>
                        <div className="text-right">
                          <div>
                            <span className="font-semibold">
                              Adult: $
                              {parseFloat(
                                room.pricePerNightAdult.toString()
                              ).toFixed(2)}
                            </span>
                            <span className="block text-sm text-gray-500">
                              per night
                            </span>
                          </div>
                          <div>
                            <span className="font-semibold">
                              Child: $
                              {parseFloat(
                                room.pricePerNightChild.toString()
                              ).toFixed(2)}
                            </span>
                            <span className="block text-sm text-gray-500">
                              per night
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Room Images */}
                      {room.images && room.images.length > 0 && (
                        <div className="mt-3">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {room.images.map((image, idx) => (
                              <div
                                key={idx}
                                className="relative h-24 rounded overflow-hidden"
                              >
                                <Image
                                  src={image}
                                  alt={`${room.name} view ${idx + 1}`}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <p className="text-sm text-gray-600 mt-3">
                        {room.description}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          Capacity: {room.capacity}
                        </span>
                        <span className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          Type: {room.roomType}
                        </span>
                      </div>

                      {/* Room Amenities */}
                      {room.amenities && room.amenities.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700">
                            Room Amenities:
                          </p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {room.amenities.map((amenity, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                              >
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p>No room information available</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-xl font-semibold mb-3">Hotel Location</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{hotelDetails.address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">City</p>
                  <p className="font-medium">{hotelDetails.city}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Country</p>
                  <p className="font-medium">{hotelDetails.country}</p>
                </div>
                {hotelDetails.latitude && hotelDetails.longitude && (
                  <div>
                    <p className="text-sm text-gray-500">Coordinates</p>
                    <p className="font-medium">
                      {hotelDetails.latitude}, {hotelDetails.longitude}
                    </p>
                  </div>
                )}
              </div>

              {/* Add the map component */}
              {hotelDetails.latitude && hotelDetails.longitude && (
                <div className="mt-4 h-64 rounded-md overflow-hidden border border-gray-200">
                  <HotelLocationMap
                    latitude={hotelDetails.latitude}
                    longitude={hotelDetails.longitude}
                    height="400px"
                    readOnly={true}
                    enableNavigation={true}
                  />
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-xl font-semibold mb-3">Details</h2>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="font-medium">
                    {hotelDetails.createdAt
                      ? new Date(hotelDetails.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-medium">
                    {hotelDetails.updatedAt
                      ? new Date(hotelDetails.updatedAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium capitalize">
                    {hotelDetails.status}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
