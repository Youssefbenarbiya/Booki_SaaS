import { auth } from "@/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { updateBookingPaymentStatus } from "@/actions/tripBookingActions"
import { verifyPayment } from "@/services/flouciPayment"

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: { bookingId: string }
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

  // Verify payment status
  try {
    const paymentResult = await verifyPayment(bookingId)
    if (paymentResult.success) {
      await updateBookingPaymentStatus(parseInt(bookingId), "completed")
    }
  } catch (error) {
    console.error("Error verifying payment:", error)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="card bg-base-100 shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-gray-600">
              Thank you for your payment. Your booking has been confirmed.
            </p>
          </div>

          <div className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-gray-600">
                You will receive a confirmation email shortly with all the
                details.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard/bookings" className="btn btn-primary">
                  View My Bookings
                </Link>
                <Link href="/trips" className="btn btn-outline">
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