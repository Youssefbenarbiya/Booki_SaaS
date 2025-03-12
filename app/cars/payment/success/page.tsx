"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle, Calendar, Car, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { verifyCarPayment } from "@/services/carPayment"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import db from "@/db/drizzle"
import { carBookings } from "@/db/schema"
import { eq } from "drizzle-orm"

export default function CarPaymentSuccessPage() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("bookingId") || "Unknown"
  const [paymentVerified, setPaymentVerified] = useState(false)
  const [bookingDetails, setBookingDetails] = useState<{
    carName: string
    totalPrice: string
    startDate: string
    endDate: string
  } | null>(null)

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // In real app, fetch booking details from your API
        const mockBooking = {
          carName: "Sample Car",
          totalPrice: "500.00",
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 86400000 * 3).toISOString(),
          paymentId: "mock_payment_id"
        }

        const verification = await verifyCarPayment(mockBooking.paymentId)
        
        if (verification.result?.status === "SUCCESS") {
          // Update payment status in database
          await db.update(carBookings)
            .set({
              paymentStatus: "paid",
              paymentDate: new Date(),
              status: "confirmed"
            })
            .where(eq(carBookings.id, parseInt(bookingId)))
          
          setPaymentVerified(true)
          setBookingDetails(mockBooking)
          toast.success("Payment verified successfully")
        } else {
          toast.error("Payment verification failed")
        }
      } catch (error) {
        console.error("Payment verification error:", error)
        toast.error("Error verifying payment")
      }
    }

    verifyPayment()
  }, [bookingId])

  if (!paymentVerified) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 flex flex-col items-center">
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-4 rounded-full">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-xl text-gray-600">
          Your rental for {bookingDetails?.carName} is confirmed.
        </p>
      </div>

      <Card className="w-full max-w-lg mb-8 border border-gray-200 shadow-md">
        <CardHeader className="bg-gray-50 pb-4">
          <CardTitle>Rental Details</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start">
              <Car className="h-5 w-5 mt-0.5 mr-3 text-gray-500" />
              <div>
                <p className="font-semibold">Reservation ID</p>
                <p className="text-gray-600">{bookingId}</p>
              </div>
            </div>

            <div className="flex items-start">
              <Calendar className="h-5 w-5 mt-0.5 mr-3 text-gray-500" />
              <div>
                <p className="font-semibold">Rental Period</p>
                <p className="text-gray-600">
                  {new Date(bookingDetails?.startDate || "").toLocaleDateString()} - {" "}
                  {new Date(bookingDetails?.endDate || "").toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <CreditCard className="h-5 w-5 mt-0.5 mr-3 text-gray-500" />
              <div>
                <p className="font-semibold">Total Payment</p>
                <p className="text-gray-600">${bookingDetails?.totalPrice}</p>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div>
            <h3 className="font-semibold mb-2">Next Steps</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Confirmation email with pickup instructions sent</li>
              <li>Bring valid ID and driving license for verification</li>
              <li>Inspect the car before driving off</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 sm:flex-row justify-between">
          <Button asChild variant="outline">
            <Link href="/user/rentals">View My Rentals</Link>
          </Button>
          <Button asChild>
            <Link href="/cars">Browse More Cars</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 