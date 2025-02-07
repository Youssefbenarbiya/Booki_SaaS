/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/flights/page.tsx
import { getFlights } from "@/actions/flightActions"
import Link from "next/link"
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
            className="mb-2 border p-4 rounded flex justify-between items-center"
          >
            {/* Flight information */}
            <div>
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
