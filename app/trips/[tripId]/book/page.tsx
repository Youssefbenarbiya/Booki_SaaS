import { auth } from "@/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getTripById } from "@/actions/trips/tripActions"
import BookingForm from "./BookingForm"
import { Separator } from "@/components/ui/separator"
import { formatPrice, formatDateRange } from "@/lib/utils"
import SignInRedirectMessage from "@/app/(auth)/sign-in/SignInRedirectMessage"

export default async function BookTripPage({
  params,
}: {
  params: { tripId: string }
  searchParams: { travelers?: string; date?: string }
}) {
  const { tripId } = await params

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session || !session.user) {
    return (
      <SignInRedirectMessage
        callbackUrl={`/sign-in?callbackUrl=/trips/${tripId}/book`}
      />
    )
  }

  const tripIdNum = parseInt(tripId)
  const trip = await getTripById(tripIdNum)

  if (!trip) {
    redirect("/?type=trips")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Complete Your Booking</h1>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">Trip Summary</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">{trip.name}</h3>
                  <p className="text-sm text-gray-600">{trip.destination}</p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Dates</span>
                    <span className="font-medium">
                      {formatDateRange(trip.startDate, trip.endDate)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Price per person</span>
                    <span className="font-medium">
                      {formatPrice(trip.price)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Available seats</span>
                    <span className="font-medium">{trip.capacity}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <BookingForm
              tripId={trip.id}
              maxSeats={trip.capacity}
              pricePerSeat={Number(trip.price)}
              userId={session.user.id}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
