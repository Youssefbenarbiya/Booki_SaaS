import { auth } from "@/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getTripById } from "@/actions/trips/tripActions"
import BookingForm from "./BookingForm"

import SignInRedirectMessage from "@/app/(auth)/sign-in/SignInRedirectMessage"
import TripSummary from "./TripSummary"

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

  // Calculate effective price (discounted or original)
  const hasDiscount = trip.discountPercentage && trip.discountPercentage > 0
  const effectivePrice =
    hasDiscount && trip.priceAfterDiscount
      ? Number(trip.priceAfterDiscount)
      : Number(trip.originalPrice)
      
  // Determine the original currency of the trip
  // This could come from the database or be set as a default
  // For this example, we'll assume it's stored in trip.currency or default to TND
  const tripCurrency = trip.currency || "TND"

  // Ensure hasDiscount is a boolean
  const isDiscounted = Boolean(hasDiscount)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Complete Your Booking</h1>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <TripSummary 
              trip={trip}
              effectivePrice={effectivePrice}
              originalCurrency={tripCurrency}
              hasDiscount={isDiscounted}
            />
          </div>

          <div>
            <BookingForm
              tripId={trip.id}
              maxSeats={trip.capacity}
              pricePerSeat={effectivePrice}
              userId={session.user.id}
              originalCurrency={tripCurrency}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
