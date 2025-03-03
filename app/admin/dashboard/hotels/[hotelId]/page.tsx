import { getHotelById } from "@/actions/hotelActions"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import DeleteHotelButton from "./DeleteHotelButton"


export default async function HotelDetailsPage({
  params,
}: {
  params: Promise<{ hotelId: string }>
}) {
  const { hotelId } = await params

  const hotel = await getHotelById(hotelId)
  if (!hotel) {
    notFound()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Hotel Details</h1>
        <div className="flex flex-wrap gap-3 mt-4 sm:mt-0">
          <Link
            href="/admin/dashboard/hotels"
            className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Back to Hotels
          </Link>
          <Link
            href={`/admin/dashboard/hotels/${hotel.id}/edit`}
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 transition"
          >
            Edit Hotel
          </Link>
          <DeleteHotelButton hotelId={hotel.id} />
        </div>
      </div>

      {/* Hotel Information */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Images Gallery */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Images</h2>
          <div className="grid grid-cols-2 gap-4">
            {hotel.images && hotel.images.length > 0 ? (
              hotel.images.map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-video rounded-lg overflow-hidden shadow transition hover:shadow-lg"
                >
                  <Image
                    src={image}
                    alt={`${hotel.name} image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))
            ) : (
              <p className="text-gray-500">No images available</p>
            )}
          </div>
        </div>

        {/* Hotel Details */}
        <div className="space-y-6 bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-gray-900">
              {hotel.name}
            </h2>
            <span className="rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800">
              {hotel.rating}★
            </span>
          </div>
          <div className="space-y-2 text-gray-700">
            <p>
              <strong>Location:</strong> {hotel.address}, {hotel.city},{" "}
              {hotel.country}
            </p>
            <p className="whitespace-pre-wrap text-gray-600">
              {hotel.description}
            </p>
            {hotel.amenities && hotel.amenities.length > 0 && (
              <div>
                <strong className="text-gray-800">Amenities:</strong>
                <div className="flex flex-wrap gap-2 mt-1">
                  {hotel.amenities.map((amenity, index) => (
                    <span
                      key={index}
                      className="rounded-full border border-gray-300 px-3 py-1 text-xs text-gray-700"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rooms Section */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Rooms</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {hotel.rooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-lg shadow transition hover:shadow-lg overflow-hidden"
            >
              {/* Room Image */}
              <figure className="relative h-56 w-full overflow-hidden">
                {room.images?.[0] ? (
                  <Image
                    src={room.images[0]}
                    alt={room.name}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-200">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
              </figure>
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {room.name}
                  </h3>
                  <span className="rounded-full border border-gray-300 px-2 py-1 text-xs text-gray-600">
                    {room.roomType}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{room.description}</p>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                  <p>
                    <strong>Capacity:</strong> {room.capacity} guests
                  </p>
                  <p>
                    <strong>Price:</strong> ${room.pricePerNight}/night
                  </p>
                </div>
                {/* Additional Room Images Gallery */}
                {room.images && room.images.length > 1 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {room.images.slice(1).map((image, index) => (
                      <div
                        key={index}
                        className="relative aspect-square overflow-hidden rounded transition hover:scale-105"
                      >
                        <Image
                          src={image}
                          alt={`${room.name} image ${index + 2}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
                {room.amenities && room.amenities.length > 0 && (
                  <div className="mt-2">
                    <strong className="text-sm text-gray-800">
                      Room Amenities:
                    </strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {room.amenities.map((amenity, index) => (
                        <span
                          key={index}
                          className="rounded-full border border-gray-300 px-2 py-1 text-xs text-gray-600"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {room.availabilities && room.availabilities.length > 0 && (
                  <div className="mt-2">
                    <strong className="text-sm text-gray-800">
                      Availability:
                    </strong>
                    <div className="space-y-1 mt-1">
                      {room.availabilities.map((availability, index) => (
                        <div
                          key={index}
                          className={`text-xs p-1 rounded ${
                            availability.isAvailable
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {new Date(
                            availability.startDate
                          ).toLocaleDateString()}{" "}
                          -{" "}
                          {new Date(availability.endDate).toLocaleDateString()}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
