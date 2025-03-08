import { auth } from "@/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { updateBookingPaymentStatus } from "@/actions/tripBookingActions"

export default async function PaymentFailedPage({
  searchParams,
}: {
  searchParams: { bookingId: string; tripId?: string }
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/auth/signin")
  }

  const { bookingId } = searchParams

  if (!bookingId) {
    redirect("/dashboard/bookings")
  }

  // Update booking status to failed
  try {
    await updateBookingPaymentStatus(parseInt(bookingId), "failed")
  } catch (error) {
    console.error("Error updating booking status:", error)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="card bg-base-100 shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2">Payment Failed</h1>
            <p className="text-gray-600">
              We were unable to process your payment. Please try again.
            </p>
          </div>

          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={searchParams.tripId ? `/trips/${searchParams.tripId}/book` : "/trips"}
                  className="btn btn-primary"
                >
                  {searchParams.tripId ? "Try Again" : "Browse Trips"}
                </Link>
                <Link href="/trips" className="btn btn-outline">
                  Browse Other Trips
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 