import { getTripById } from "@/actions/tripActions"
import { auth } from "@/auth"
import { notFound, redirect } from "next/navigation"
import { headers } from "next/headers"
import BookingForm from "./BookingForm"
import { formatPrice } from "@/lib/utils"

export default async function BookTripPage({
  params,
}: {
  params: Promise<{ tripId: string }>
}) {
  const { tripId } = await params
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/auth/signin")
  }

  const trip = await getTripById(parseInt(tripId))

  if (!trip || !trip.isAvailable) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Book Your Trip</h1>
      <div className="grid gap-8 md:grid-cols-2">
        {/* Trip Summary */}
        <div className="card bg-base-100 shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Trip Summary</h2>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Trip:</span> {trip.name}
            </p>
            <p>
              <span className="font-medium">Destination:</span>{" "}
              {trip.destination}
            </p>
            <p>
              <span className="font-medium">Duration:</span>{" "}
              {new Date(trip.startDate).toLocaleDateString()} -{" "}
              {new Date(trip.endDate).toLocaleDateString()}
            </p>
            <p>
              <span className="font-medium">Price per Person:</span>{" "}
              {formatPrice(trip.price)}
            </p>
            <p>
              <span className="font-medium">Available Spots:</span>{" "}
              {trip.capacity}
            </p>
          </div>
        </div>

        {/* Booking Form */}
        <BookingForm
          tripId={trip.id}
          maxSeats={trip.capacity}
          pricePerSeat={parseFloat(trip.price)}
          userId={session.user.id}
        />
      </div>
    </div>
  )
}
