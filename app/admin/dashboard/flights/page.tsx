/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/flights/page.tsx
import { getFlights } from "@/actions/flightActions"
import Link from "next/link"
import Image from "next/image"
import DeleteFlightButton from "./[flightId]/DeleteFlightButton"

export default async function FlightsPage() {
  const flights = await getFlights()
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Flights</h1>
      <Link
        href="/admin/dashboard/flights/new"
        className="btn btn-primary mb-4"
      >
        Add New Flight
      </Link>
      <ul>
        {flights.map((flight: any) => (
          <li
            key={flight.id}
            className="mb-2 border p-4 rounded flex gap-4 items-center"
          >
            {/* Flight image */}
            <div className="relative w-32 h-32 flex-shrink-0">
              {flight.images?.[0] ? (
                <Image
                  src={flight.images[0]}
                  alt={flight.flightNumber}
                  fill
                  className="object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
            </div>

            {/* Flight information */}
            <div className="flex-grow">
              <p>
                <strong>{flight.flightNumber}</strong>:{" "}
                {flight.departureAirport} → {flight.arrivalAirport}
              </p>
              <p>
                Departure: {new Date(flight.departureTime).toLocaleString()} |{" "}
                Arrival: {new Date(flight.arrivalTime).toLocaleString()}
              </p>
              <p>
                Price: ${flight.price} | Seats: {flight.availableSeats}
              </p>
              <Link
                href={`/admin/dashboard/flights/${flight.id}`}
                className="text-blue-500"
              >
                View Details
              </Link>
            </div>

            {/* Action buttons: Edit and Delete */}
            <div className="flex flex-col space-y-2">
              <Link
                href={`/admin/dashboard/flights/${flight.id}/edit`}
                className="btn btn-secondary"
              >
                Edit
              </Link>
              <DeleteFlightButton flightId={flight.id} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
