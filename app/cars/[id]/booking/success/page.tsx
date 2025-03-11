"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle, Calendar, Car, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function BookingSuccessPage() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("bookingId") || "Unknown"
  const carName = searchParams.get("carName") || "your car"
  const totalPrice = searchParams.get("totalPrice") || "0.00"

  // Extract the date strings once to prevent unnecessary re-renders
  const startDateString = searchParams.get("startDate")
  const endDateString = searchParams.get("endDate")

  // Format the dates safely outside of the render cycle
  const startDate = startDateString
    ? new Date(startDateString).toLocaleDateString()
    : "Not specified"
  const endDate = endDateString
    ? new Date(endDateString).toLocaleDateString()
    : "Not specified"

  return (
    <div className="container mx-auto px-4 py-12 flex flex-col items-center">
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-4 rounded-full">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
        <p className="text-xl text-gray-600">
          Your reservation for {carName} has been successfully processed.
        </p>
      </div>

      <Card className="w-full max-w-lg mb-8 border border-gray-200 shadow-md">
        <CardHeader className="bg-gray-50 pb-4">
          <CardTitle>Booking Details</CardTitle>
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
                  {startDate} - {endDate}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <CreditCard className="h-5 w-5 mt-0.5 mr-3 text-gray-500" />
              <div>
                <p className="font-semibold">Total Payment</p>
                <p className="text-gray-600">${totalPrice}</p>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div>
            <h3 className="font-semibold mb-2">What&apos;s Next?</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>
                A confirmation email has been sent to your registered email
                address
              </li>
              <li>
                Present your confirmation email and ID at the pickup location
              </li>
              <li>
                Please arrive 15 minutes before your scheduled pickup time
              </li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 sm:flex-row justify-between">
          <Button asChild variant="outline">
            <Link href="/user/profile/bookingHistory">View My Bookings</Link>
          </Button>
          <Button asChild>
            <Link href="/?type=rent">Browse More Cars</Link>
          </Button>
        </CardFooter>
      </Card>

      <div className="text-center text-gray-500">
        <p>Need help? Contact our customer support at support@carrentals.com</p>
      </div>
    </div>
  )
}
