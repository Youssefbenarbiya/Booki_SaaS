/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import Link from "next/link"
import { generateHotelRoomBookingPDF } from "@/actions/generateInvoiceRoom"

export default function PaymentSuccessPage() {
  // Get bookingId from query parameters
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("bookingId")

  const [hotelData, setHotelData] = useState<any>(null)
  const [roomData, setRoomData] = useState<any>(null)
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
        const res = await fetch(`/api/room-booking?bookingId=${bookingId}`)
        if (!res.ok) {
          throw new Error("Failed to fetch booking data.")
        }
        const data = await res.json()
        // Expected API response: { booking: {..., user: {...}}, room: {...}, hotel: {...} }
        setBookingData(data.booking)
        setRoomData(data.room)
        setHotelData(data.hotel)
        setUserData(data.booking?.user || null)
        setLoading(false)
      } catch (err) {
        console.error(err)
        setError("Error fetching booking data.")
        setLoading(false)
      }
    }

    fetchBookingData()
  }, [bookingId])

  const handleDownloadPDF = () => {
    if (hotelData && roomData && bookingData && userData) {
      generateHotelRoomBookingPDF(hotelData, roomData, bookingData, userData)
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

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Your payment has been processed successfully. Thank you for your
          booking!
        </p>

        {/* Display Booking Details */}
        <div className="text-left mb-4">
          <h2 className="text-xl font-semibold mb-2">Booking Details</h2>
          {roomData && (
            <>
              <p>
                <strong>Room Name:</strong> {roomData.name}
              </p>
              <p>
                <strong>Room Type:</strong> {roomData.roomType}
              </p>
              <p>
                <strong>Check-In:</strong> {bookingData.checkIn}
              </p>
              <p>
                <strong>Check-Out:</strong> {bookingData.checkOut}
              </p>
              <p>
                <strong>Total Price:</strong> ${bookingData.totalPrice}
              </p>
            </>
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
              {userData.phoneNumber && (
                <p>
                  <strong>Phone:</strong> {userData.phoneNumber}
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
          <Link href="/hotels">
            <Button variant="outline" className="w-full">
              Browse More Hotels
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
