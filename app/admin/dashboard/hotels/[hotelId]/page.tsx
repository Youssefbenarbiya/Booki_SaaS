import { getHotelById } from "@/actions/hotelActions"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import DeleteHotelButton from "./DeleteHotelButton"

export default async function HotelDetailsPage({
  params,
}: {
  params: { hotelId: string }
}) {
  const hotel = await getHotelById(params.hotelId)

  if (!hotel) {
    notFound()
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Hotel Details</h1>
        <div className="flex gap-2">
          <Link href="/admin/dashboard/hotels" className="btn btn-outline">
            Back to Hotels
          </Link>
          <Link
            href={`/admin/dashboard/hotels/${hotel.id}/edit`}
            className="btn btn-secondary"
          >
            Edit Hotel
          </Link>
          <DeleteHotelButton hotelId={hotel.id} />
        </div>
      </div>

      {/* Hotel Information */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Images Gallery */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Images</h2>
          <div className="grid grid-cols-2 gap-4">
            {hotel.images && hotel.images.length > 0 ? (
              hotel.images.map((image, index) => (
                <div key={index} className="relative aspect-video">
                  <Image
                    src={image}
                    alt={`${hotel.name} image ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              ))
            ) : (
              <p className="text-gray-500">No images available</p>
            )}
          </div>
        </div>

        {/* Hotel Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">{hotel.name}</h2>
            <span className="badge badge-secondary">{hotel.rating}★</span>
          </div>

          <div className="grid gap-2">
            <p className="text-gray-600">
              <strong>Location:</strong> {hotel.address}, {hotel.city},{" "}
              {hotel.country}
            </p>
            <p className="whitespace-pre-wrap">{hotel.description}</p>
            {hotel.amenities && hotel.amenities.length > 0 && (
              <div>
                <strong>Amenities:</strong>
                <div className="flex flex-wrap gap-2 mt-1">
                  {hotel.amenities.map((amenity, index) => (
                    <span key={index} className="badge badge-outline">
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
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Rooms</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {hotel.rooms.map((room) => (
            <div key={room.id} className="card bg-base-100 shadow-xl">
              {/* Room Image */}
              <figure className="relative h-48">
                {room.images?.[0] ? (
                  <Image
                    src={room.images[0]}
                    alt={room.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
              </figure>

              <div className="card-body">
                <h3 className="card-title">
                  {room.name}
                  <div className="badge badge-outline">{room.roomType}</div>
                </h3>
                <p className="text-sm">{room.description}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p>
                    <strong>Capacity:</strong> {room.capacity} guests
                  </p>
                  <p>
                    <strong>Price:</strong> ${room.pricePerNight}/night
                  </p>
                </div>

                {/* Room Images Gallery */}
                {room.images && room.images.length > 1 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {room.images.slice(1).map((image, index) => (
                      <div key={index} className="relative aspect-square">
                        <Image
                          src={image}
                          alt={`${room.name} image ${index + 2}`}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {room.amenities && room.amenities.length > 0 && (
                  <div className="mt-2">
                    <strong className="text-sm">Room Amenities:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {room.amenities.map((amenity, index) => (
                        <span
                          key={index}
                          className="badge badge-sm badge-outline"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Room Availability */}
                {room.availabilities && room.availabilities.length > 0 && (
                  <div className="mt-2">
                    <strong className="text-sm">Availability:</strong>
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
                          {new Date(availability.startDate).toLocaleDateString()} -{" "}
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