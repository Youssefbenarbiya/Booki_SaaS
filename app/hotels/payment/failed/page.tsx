import { updateBookingPaymentStatus } from "@/actions/roomBookingActions"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

interface PaymentFailedPageProps {
  searchParams: {
    bookingId?: string
    paymentMethod?: string
  }
}

export default async function PaymentFailedPage({
  searchParams,
}: PaymentFailedPageProps) {
  const { bookingId, paymentMethod = "flouci" } = searchParams

  if (!bookingId) {
    redirect("/dashboard/bookings")
  }

  // Update booking payment status with the correct payment method
  try {
    await updateBookingPaymentStatus(
      parseInt(bookingId),
      "failed",
      paymentMethod.toUpperCase()
    )
  } catch (error) {
    console.error("Error updating booking payment status:", error)
  }

  return (
    <div className="container max-w-md mx-auto py-12">
      <Card className="p-8 text-center">
        <div className="flex justify-center mb-4">
          <AlertCircle className="h-16 w-16 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
        <p className="text-gray-600 mb-6">
          We couldn&apos;t process your payment. Please try again or contact
          customer support if the problem persists.
        </p>
        <div className="space-y-4">
          <Button asChild className="w-full bg-red-600 hover:bg-red-700">
            <Link href={`/dashboard/bookings`}>View My Bookings</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </Card>
    </div>
  )
}
