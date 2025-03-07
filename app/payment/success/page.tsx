import { updateBookingPaymentStatus } from "@/actions/roomBookingActions"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

interface PaymentSuccessPageProps {
  searchParams: {
    bookingId?: string
  }
}

export default async function PaymentSuccessPage({
  searchParams,
}: PaymentSuccessPageProps) {
  const { bookingId } = searchParams

  if (!bookingId) {
    redirect("/dashboard/bookings")
  }

  // Update booking payment status
  try {
    await updateBookingPaymentStatus(
      parseInt(bookingId),
      "completed",
      "flouci"
    )
  } catch (error) {
    console.error("Error updating booking payment status:", error)
  }

  return (
    <div className="container max-w-md mx-auto py-12">
      <Card className="p-8 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Your booking has been confirmed and your payment has been processed
          successfully.
        </p>
        <div className="space-y-4">
          <Button asChild className="w-full">
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