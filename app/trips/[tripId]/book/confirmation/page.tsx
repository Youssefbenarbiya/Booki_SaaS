import { auth } from "@/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { getTripById } from "@/actions/tripActions"
import { formatPrice } from "@/lib/utils"

export default async function BookingConfirmationPage({
  params,
}: {
  params: { tripId: string }
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/auth/signin")
  }

  const trip = await getTripById(parseInt(params.tripId))

  if (!trip) {
    redirect("/trips")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="card bg-base-100 shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
            <p className="text-gray-600">
              Thank you for booking your trip with us.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Trip Details</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Trip:</span> {trip.name}</p>
                <p><span className="font-medium">Destination:</span> {trip.destination}</p>
                <p>
                  <span className="font-medium">Duration:</span>{" "}
                  {new Date(trip.startDate).toLocaleDateString()} -{" "}
                  {new Date(trip.endDate).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-medium">Price:</span>{" "}
                  {formatPrice(trip.price)}
                </p>
              </div>
            </div>

            <div className="divider"></div>

            <div className="text-center space-y-4">
              <p className="text-gray-600">
                You will receive a confirmation email shortly with all the details.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard/bookings" className="btn btn-primary">
                  View My Bookings
                </Link>
                <Link href="/" className="btn btn-outline">
                  Browse More Trips
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 