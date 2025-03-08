import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { headers } from "next/headers"
import { updateTripBookingPaymentStatus } from "@/actions/tripBookingActions"
import { verifyTripPayment } from "@/services/tripPaymentService"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import Link from "next/link"

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: { bookingId?: string; paymentId?: string }
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/auth/signin")
  }

  const { bookingId, paymentId } = searchParams

  if (!bookingId) {
    redirect("/dashboard/bookings")
  }
  
  console.log("Payment success page loaded with params:", searchParams);

  try {
    // If payment ID is available, verify the payment
    if (paymentId) {
      try {
        console.log("Verifying payment with ID:", paymentId);
        const paymentData = await verifyTripPayment(paymentId)
        
        if (paymentData && paymentData.result?.status === "completed") {
          console.log("Payment verified as completed");
          await updateTripBookingPaymentStatus(
            parseInt(bookingId),
            "completed",
            "flouci"
          )
        } else {
          console.log("Payment verification failed, redirecting to failed page");
          redirect(`/trips/payment/failed?bookingId=${bookingId}`)
        }
      } catch (error) {
        console.error("Error verifying payment:", error)
        redirect(`/trips/payment/failed?bookingId=${bookingId}`)
      }
    } else {
      // If no payment ID but reached success page, update status anyway
      // This handles redirects from Flouci without paymentId in URL
      console.log("No payment ID provided, updating status as completed");
      await updateTripBookingPaymentStatus(parseInt(bookingId), "completed", "flouci")
    }
  } catch (error) {
    console.error("Error processing successful payment:", error);
    // We'll continue to show success page even if update fails
  }

  return (
    <div className="container max-w-lg mx-auto py-16 px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Your trip booking has been confirmed. Thank you for your payment.
        </p>
        
        <div className="space-y-3">
          <Link href="/dashboard/bookings" className="w-full block">
            <Button className="w-full">View My Bookings</Button>
          </Link>
          
          <Link href="/trips" className="w-full block">
            <Button variant="outline" className="w-full">Browse More Trips</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
