import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import Link from "next/link"

export default function PaymentSuccessPage() {
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Your payment has been processed successfully. Thank you for your
          booking!
        </p>

        <div className="flex flex-col space-y-3">
          <Link href="/user/profile/bookingHistory">
            <Button variant="default" className="w-full">
              View My Bookings
            </Button>
          </Link>
          <Link href="/trips">
            <Button variant="outline" className="w-full">
              Browse More Trips
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
