/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import Link from "next/link"
import { generateTripBookingPDF } from "@/actions/trips/generateTripBookingPDF"
import { formatPrice } from "@/lib/utils"

export default function PaymentSuccessPage() {
  // Get bookingId from query parameters
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("bookingId")
  const paymentId = searchParams.get("paymentId") // Flouci returns a paymentId

  const [tripData, setTripData] = useState<any>(null)
  const [bookingData, setBookingData] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!bookingId) {
      setError("No booking ID provided.")
      setLoading(false)
      return
    }

    async function fetchBookingData() {
      try {
        // If this success page was called with a paymentId, it's from Flouci and we need to verify
        if (paymentId) {
          // Verify the Flouci payment first
          const verifyRes = await fetch(`/api/payment/trip-verify?paymentId=${paymentId}&bookingId=${bookingId}`)
          if (!verifyRes.ok) {
            throw new Error("Failed to verify payment")
          }
          const verifyData = await verifyRes.json()
          if (!verifyData.success) {
            throw new Error("Payment verification failed")
          }
        }

        // Now get the booking data
        const res = await fetch(`/api/trip-booking?bookingId=${bookingId}`)
        if (!res.ok) {
          throw new Error("Failed to fetch booking data.")
        }
        const data = await res.json()
        // Expected API response: { booking: {...}, trip: {...} }
        setBookingData(data.booking)
        setTripData(data.trip)
        // Ensure that the booking contains user details; if not, you might have to adjust your API response.
        setUserData(data.booking?.user || null)
        setLoading(false)
      } catch (err) {
        console.error(err)
        setError("Error fetching booking data.")
        setLoading(false)
      }
    }

    fetchBookingData()
  }, [bookingId, paymentId])

  const handleDownloadPDF = () => {
    if (tripData && bookingData && userData) {
      generateTripBookingPDF(tripData, bookingData, userData)
    } else {
      alert("Missing data for PDF generation.")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p>Loading booking details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  // Determine the payment currency based on payment method
  const paymentMethod = bookingData?.paymentMethod || ""
  const paymentCurrency = bookingData?.paymentCurrency || "USD"
  
  // Calculate price per seat from total price and seats booked
  const pricePerSeat = bookingData?.totalPrice / bookingData?.seatsBooked
  
  // Determine if Stripe or Flouci was used
  const isStripePayment = paymentMethod.includes("STRIPE")
  const isFlouciPayment = paymentMethod.includes("FLOUCI")

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Your payment has been processed successfully. Thank you for your
          booking!
        </p>

        {/* Display Trip Details */}
        <div className="text-left mb-4">
          <h2 className="text-xl font-semibold mb-2">Trip Details</h2>
          {tripData ? (
            <>
              <p>
                <strong>Name:</strong> {tripData.name}
              </p>
              <p>
                <strong>Destination:</strong> {tripData.destination}
              </p>
              <p>
                <strong>Start Date:</strong> {new Date(tripData.startDate).toLocaleDateString()}
              </p>
              <p>
                <strong>End Date:</strong> {new Date(tripData.endDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Booking Reference:</strong> #{bookingData?.id}
              </p>
            </>
          ) : (
            <p>No trip details available.</p>
          )}
        </div>

        {/* Display Payment Details */}
        <div className="text-left mb-4">
          <h2 className="text-xl font-semibold mb-2">Payment Details</h2>
          {bookingData ? (
            <>
              <p>
                <strong>Payment Method:</strong>{" "}
                {isStripePayment 
                  ? "Credit Card (USD)" 
                  : isFlouciPayment 
                    ? "Flouci (TND)"
                    : paymentMethod}
              </p>
              <p>
                <strong>Payment Status:</strong>{" "}
                <span className="text-green-600 font-medium">
                  {bookingData.paymentStatus === "completed" ? "Completed" : bookingData.paymentStatus}
                </span>
              </p>
              <p>
                <strong>Seats Booked:</strong> {bookingData.seatsBooked}
              </p>
              <p>
                <strong>Price per Seat:</strong>{" "}
                {formatPrice(pricePerSeat, { currency: paymentCurrency })}
              </p>
              <p>
                <strong>Total Amount:</strong>{" "}
                <span className="font-bold">
                  {formatPrice(bookingData.totalPrice, { currency: paymentCurrency })}
                </span>
              </p>
              {bookingData.paymentDate && (
                <p>
                  <strong>Payment Date:</strong>{" "}
                  {new Date(bookingData.paymentDate).toLocaleString()}
                </p>
              )}
              {bookingData.originalCurrency && bookingData.originalCurrency !== paymentCurrency && (
                <p className="text-sm text-gray-500 mt-2">
                  * Price converted from {bookingData.originalCurrency} to {paymentCurrency}
                </p>
              )}
            </>
          ) : (
            <p>No payment details available.</p>
          )}
        </div>

        {/* Display User Details */}
        <div className="text-left mb-4">
          <h2 className="text-xl font-semibold mb-2">User Details</h2>
          {userData ? (
            <>
              <p>
                <strong>Name:</strong> {userData.name}
              </p>
              <p>
                <strong>Email:</strong> {userData.email}
              </p>
              {userData.phone && (
                <p>
                  <strong>Phone:</strong> {userData.phone}
                </p>
              )}
            </>
          ) : (
            <p>No user details available.</p>
          )}
        </div>

        <div className="flex flex-col space-y-3">
          <Button
            variant="default"
            className="w-full"
            onClick={handleDownloadPDF}
          >
            Download Booking PDF
          </Button>
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
