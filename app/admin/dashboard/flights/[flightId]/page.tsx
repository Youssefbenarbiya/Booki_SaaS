// app/dashboard/flights/[flightId]/page.tsx
import { getFlightById } from "@/actions/flightActions"
import Link from "next/link"
import DeleteFlightButton from "./DeleteFlightButton"

export default async function FlightDetailPage({
  params,
}: {
  params: { flightId: string } | Promise<{ flightId: string }>
}) {
  const resolvedParams = await Promise.resolve(params)
  const flight = await getFlightById(resolvedParams.flightId)
  if (!flight) {
    return <p>Flight not found</p>
  }
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Flight Detail</h1>
      <div className="border p-4 rounded">
        <p>
          <strong>{flight.flightNumber}</strong>
        </p>
        <p>
          {flight.departureAirport} → {flight.arrivalAirport}
        </p>
        <p>Departure: {new Date(flight.departureTime).toLocaleString()}</p>
        <p>Arrival: {new Date(flight.arrivalTime).toLocaleString()}</p>
        <p>Price: ${flight.price}</p>
        <p>Available Seats: {flight.availableSeats}</p>
      </div>
      <div className="mt-4">
        <Link
          href={`/admin/dashboard/flights/${flight.id}/edit`}
          className="btn btn-secondary mr-2"
        >
          Edit Flight
        </Link>
        <DeleteFlightButton flightId={flight.id} />
      </div>
    </div>
  )
}
