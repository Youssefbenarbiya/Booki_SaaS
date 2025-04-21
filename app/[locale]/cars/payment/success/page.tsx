"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle, Download } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Separator } from "@/components/ui/separator"
import { generateCarBookingPDF } from "@/actions/cars/generateCarBookingPDF"
interface BookingDetails {
  booking: {
    id: number
    startDate: string
    endDate: string
    totalPrice: number
    status: string
    paymentStatus: string
    paymentMethod: string
    drivingLicense: string
    paymentDate?: string
    paymentId?: string
  }
  car: {
    brand: string
    model: string
    plateNumber: string
    color: string
    year: number
    category?: string
    transmission?: string
    fuelType?: string
    features?: string[]
    images?: string[]
  } | null
  user: {
    name: string
    email: string
    phoneNumber: string | null
    address: string | null
    image: string | null
  } | null
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("bookingId")
  const [booking, setBooking] = useState<BookingDetails | null>(null)

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (bookingId) {
        try {
          const res = await fetch(`/api/booking/${bookingId}`)
          if (res.ok) {
            const data = await res.json()
            setBooking(data)
          } else {
            console.error("Failed to fetch booking details")
          }
        } catch (error) {
          console.error("Error fetching booking details:", error)
        }
      }
    }
    fetchBookingDetails()
  }, [bookingId])

  const handleDownloadPDF = () => {
    if (!booking || !booking.car || !booking.user) return

    // Prepare data for PDF generation
    const carData = {
      id: booking.booking.id,
      name: `${booking.car.brand} ${booking.car.model}`,
      model: booking.car.model,
      make: booking.car.brand,
      year: booking.car.year,
      color: booking.car.color,
      licensePlate: booking.car.plateNumber,
      category: booking.car.category,
      transmission: booking.car.transmission,
      fuelType: booking.car.fuelType,
      features: booking.car.features || [],
      image: booking.car.images?.[0],
    }

    const bookingData = {
      id: booking.booking.id,
      startDate: booking.booking.startDate,
      endDate: booking.booking.endDate,
      totalPrice: booking.booking.totalPrice,
      status: booking.booking.status,
      paymentStatus: booking.booking.paymentStatus,
      paymentMethod: booking.booking.paymentMethod,
      paymentDate: booking.booking.paymentDate,
      paymentId: booking.booking.paymentId,
    }

    const customerData = {
      fullName: booking.user.name,
      email: booking.user.email,
      phone: booking.user.phoneNumber || undefined,
      address: booking.user.address || undefined,
      drivingLicense: booking.booking.drivingLicense,
    }

    // Generate and download the PDF
    generateCarBookingPDF(carData, bookingData, customerData)
  }

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">Your booking has been confirmed. Thank you for your reservation!</p>
          <Link href="/cars">
            <Button variant="default" className="w-full">
              Browse More Cars
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center">
      <div className="max-w-2xl w-full bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-gray-600">Your booking has been confirmed. Thank you for your reservation!</p>
        </div>

        <Separator className="my-6" />

        {/* Booking Details */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Booking Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Booking ID</p>
                <p className="font-medium">{booking.booking.id}</p>
              </div>
              {booking.car && (
                <>
                  <div>
                    <p className="text-gray-500">Vehicle</p>
                    <p className="font-medium">
                      {booking.car.brand} {booking.car.model} ({booking.car.year})
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Plate Number</p>
                    <p className="font-medium">{booking.car.plateNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Color</p>
                    <p className="font-medium">{booking.car.color}</p>
                  </div>
                </>
              )}
              <div>
                <p className="text-gray-500">Total Amount</p>
                <p className="font-medium">${booking.booking.totalPrice}</p>
              </div>
              <div>
                <p className="text-gray-500">Start Date</p>
                <p className="font-medium">{new Date(booking.booking.startDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-500">End Date</p>
                <p className="font-medium">{new Date(booking.booking.endDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Customer Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
            {booking.user && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Full Name</p>
                  <p className="font-medium">{booking.user.name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium">{booking.user.email}</p>
                </div>
                <div>
                  <p className="text-gray-500">Phone</p>
                  <p className="font-medium">{booking.user.phoneNumber || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-500">Address</p>
                  <p className="font-medium">{booking.user.address || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-500">Driving License</p>
                  <p className="font-medium">{booking.booking.drivingLicense}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col space-y-3 mt-8">
          <Button
            onClick={handleDownloadPDF}
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Booking Confirmation
          </Button>

          <Link href="/user/profile/bookingHistory">
            <Button variant="default" className="w-full">
              View My Bookings
            </Button>
          </Link>

          <Link href="/">
            <Button variant="outline" className="w-full">
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

