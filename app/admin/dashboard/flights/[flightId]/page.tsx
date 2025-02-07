// app/dashboard/flights/[flightId]/page.tsx
import { getFlightById } from "@/actions/flightActions"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import DeleteFlightButton from "./DeleteFlightButton"

export default async function FlightDetailsPage({
  params,
}: {
  params: { flightId: string }
}) {
  const flight = await getFlightById(params.flightId)

  if (!flight) {
    notFound()
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Flight Details</h1>
        <Link href="/admin/dashboard/flights" className="btn btn-secondary">
          Back to Flights
        </Link>
      </div>

      {/* Flight Information */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Flight Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <p>
            <strong>Flight Number:</strong> {flight.flightNumber}
          </p>
          <p>
            <strong>Route:</strong> {flight.departureAirport} →{" "}
            {flight.arrivalAirport}
          </p>
          <p>
            <strong>Departure:</strong>{" "}
            {new Date(flight.departureTime).toLocaleString()}
          </p>
          <p>
            <strong>Arrival:</strong>{" "}
            {new Date(flight.arrivalTime).toLocaleString()}
          </p>
          <p>
            <strong>Price:</strong> ${flight.price}
          </p>
          <p>
            <strong>Available Seats:</strong> {flight.availableSeats}
          </p>
        </div>
      </div>

      {/* Flight Images */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Flight Images</h2>
        {flight.images && flight.images.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {flight.images.map((image: string, index: number) => (
              <div key={index} className="relative aspect-video">
                <Image
                  src={image}
                  alt={`Flight ${flight.flightNumber} image ${index + 1}`}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No images available</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex gap-4">
        <Link
          href={`/admin/dashboard/flights/${flight.id}/edit`}
          className="btn btn-primary"
        >
          Edit Flight
        </Link>
        <DeleteFlightButton flightId={flight.id} />
      </div>
    </div>
  )
}
