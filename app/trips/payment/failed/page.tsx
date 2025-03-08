import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { headers } from "next/headers"
import { updateTripBookingPaymentStatus } from "@/actions/tripBookingActions"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export default async function PaymentFailedPage({
  searchParams,
}: {
  searchParams: { bookingId?: string }
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

  // Update the booking payment status to failed
  await updateTripBookingPaymentStatus(parseInt(bookingId), "failed", "flouci")

  return (
    <div className="container max-w-lg mx-auto py-16 px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-4">
          <AlertCircle className="h-16 w-16 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
        <p className="text-gray-600 mb-6">
          Your payment could not be processed. Please try again or use a different payment method.
        </p>
        
        <div className="space-y-3">
          <Link href={`/trips/${bookingId}/book`} className="w-full block">
            <Button className="w-full">Try Again</Button>
          </Link>
          
          <Link href="/dashboard/bookings" className="w-full block">
            <Button variant="outline" className="w-full">View My Bookings</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
