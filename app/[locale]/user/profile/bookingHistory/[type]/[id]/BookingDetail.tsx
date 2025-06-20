/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import Image from "next/image"
import { ChevronLeft, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { BookingDetailType } from "@/actions/users/getBookingDetail"

// Extend the BookingDetailType with additional properties we need
interface ExtendedBookingDetailType extends BookingDetailType {
  paymentMethod?: string;
}

export default function BookingDetailClient({
  booking,
}: {
  booking: ExtendedBookingDetailType
}) {
  // Format dates nicely
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date)
    } catch {
      return dateStr // Fall back to original string if parsing fails
    }
  }

  // Determine badge color based on status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
      case "paid":
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
      case "refunded":
        return "bg-red-100 text-red-800"
      case "partially_paid":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  // Get icon and title based on booking type
  const getTypeDetails = (type: string) => {
    switch (type) {
      case "trip":
        return { title: "Trip Booking", icon: "✈️" }
      case "stay":
        return { title: "Hotel Stay", icon: "🏨" }
      case "car":
        return { title: "Car Rental", icon: "🚗" }
      default:
        return { title: "Booking", icon: "📋" }
    }
  }

  const typeDetails = getTypeDetails(booking.type)

  // Format array data for display
  const formatArrayData = (data: any[] | undefined) => {
    if (!data || !Array.isArray(data)) return "None"
    return data.join(", ")
  }
  
  // Check if this is a partial/advance payment
  const isPartialPayment = 
    booking.status?.toLowerCase() === "partially_paid" || 
    (booking.paymentMethod && booking.paymentMethod.includes("ADVANCE")) ||
    (booking.additionalInfo?.paymentMethod && booking.additionalInfo.paymentMethod.includes("ADVANCE"))
  
  // Display status should be "pending" when it's a partial payment
  const displayStatus = isPartialPayment ? "pending" : booking.status
  const statusClass = getStatusColor(displayStatus)

  // Get payment information from the booking
  const getPaymentDetails = () => {
    try {
      // Parse the total price string to number
      const displayedTotal = parseFloat(booking.totalPrice.replace(/[^0-9.]/g, ""))
      
      // Get information about original price and discount
      let originalPrice = displayedTotal
      let seats = 1
      let discountAmount = 0
      let discountPercentage = 0
      
      // If we have additionalInfo with more details, use them
      if (booking.additionalInfo) {
        // For trips, we may have more detailed pricing info
        if (booking.type === "trip") {
          // Get original price per seat if available
          if (booking.additionalInfo.price) {
            originalPrice = parseFloat(String(booking.additionalInfo.price).replace(/[^0-9.]/g, ""))
          }
          
          // Get number of seats
          seats = booking.additionalInfo.participants || 1
          
          // Get discount percentage
          if (booking.additionalInfo.discountPercentage) {
            discountPercentage = parseFloat(String(booking.additionalInfo.discountPercentage))
            discountAmount = originalPrice * seats * (discountPercentage / 100)
          }
        }
      }
      
      // Calculate subtotal (price × quantity) before discount
      const subtotal = originalPrice * seats
      
      // Calculate total after discount
      const totalAfterDiscount = subtotal - discountAmount
      
      // Default advance payment percentage is 30% if not specified
      const advancePercentage = booking.additionalInfo?.advancePaymentPercentage || 30
      const remainingPercentage = 100 - advancePercentage
      
      // Calculate advance and remaining amounts
      const advanceAmount = totalAfterDiscount * (advancePercentage / 100)
      const remainingAmount = totalAfterDiscount * (remainingPercentage / 100)
      
      return {
        originalPrice,
        subtotal,
        seats,
        discountPercentage,
        discountAmount,
        totalAfterDiscount,
        advancePercentage,
        advanceAmount,
        remainingPercentage,
        remainingAmount
      }
    } catch (error) {
      console.error("Error calculating payment details:", error)
      const totalPrice = parseFloat(booking.totalPrice.replace(/[^0-9.]/g, "")) || 0
      
      // Default values
      return {
        originalPrice: totalPrice,
        subtotal: totalPrice,
        seats: 1,
        discountPercentage: 0,
        discountAmount: 0,
        totalAfterDiscount: totalPrice,
        advancePercentage: 30,
        advanceAmount: totalPrice * 0.3,
        remainingPercentage: 70,
        remainingAmount: totalPrice * 0.7
      }
    }
  }
  
  const paymentDetails = getPaymentDetails()
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`
  }
  
  // Get payment method from either direct property or additionalInfo
  const paymentMethod = booking.paymentMethod || booking.additionalInfo?.paymentMethod || "Not specified"

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Back button */}
      <Link
        href="/user/profile/bookingHistory"
        className="flex items-center mb-6 text-gray-600 hover:text-gray-900"
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        Back to Booking History
      </Link>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header with image */}
        <div className="relative h-64 w-full">
          <Image
            src={booking.image}
            alt={booking.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-end">
            <div className="p-6 text-white">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{typeDetails.icon}</span>
                <h1 className="text-3xl font-bold">{booking.name}</h1>
              </div>
              <div className="flex items-center mt-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${statusClass}`}
                >
                  {isPartialPayment ? "Pending" : displayStatus === "partially_paid" ? "Partially Paid" : displayStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Booking details */}
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-4">
            {typeDetails.title} Details
          </h2>
          
          {/* Payment Summary Card */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 border">
            <h3 className="font-medium text-lg mb-3">Payment Summary</h3>
            <div className="space-y-2 text-sm">
              {booking.type === "trip" && (
                <>
                  <div className="flex justify-between">
                    <span>Trip Cost (per seat)</span>
                    <span>{formatCurrency(paymentDetails.originalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Seats</span>
                    <span>x {paymentDetails.seats}</span>
                  </div>
                  {paymentDetails.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({paymentDetails.discountPercentage}%)</span>
                      <span>-{formatCurrency(paymentDetails.discountAmount)}</span>
                    </div>
                  )}
                </>
              )}
              
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(paymentDetails.totalAfterDiscount)}</span>
                </div>
              </div>
              
              {isPartialPayment && (
                <div className="border-t pt-2 mt-2 space-y-1">
                  <div className="flex justify-between text-blue-600">
                    <span>Advance Payment ({paymentDetails.advancePercentage}%)</span>
                    <span>{formatCurrency(paymentDetails.advanceAmount)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Remaining (to pay in cash)</span>
                    <span>{formatCurrency(paymentDetails.remainingAmount)}</span>
                  </div>
                </div>
              )}
              
              <div className="text-xs text-gray-500 mt-3 space-y-1">
                <p>Payment Method: {paymentMethod}</p>
                <p>Payment Status: {isPartialPayment ? "Pending - Advance Payment Only" : booking.status}</p>
              </div>
            </div>
          </div>

          {/* Show advance payment notice if applicable */}
          {isPartialPayment && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4 mb-6 shadow-md">
              <div className="flex items-start">
                <AlertCircle className="w-6 h-6 text-yellow-500 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-bold text-yellow-800 text-xl">Action Required: Visit Agency To Complete Payment</h3>
                  <p className="text-md text-yellow-700 mt-2">
                    You&apos;ve only made an advance payment of {paymentDetails.advancePercentage}% ({formatCurrency(paymentDetails.advanceAmount)}). 
                    <strong className="block mt-2 text-lg">Please visit the agency as soon as possible to pay the remaining {formatCurrency(paymentDetails.remainingAmount)} in cash to complete your booking.</strong>
                  </p>
                  <p className="text-sm text-yellow-600 mt-3 font-medium">
                    Your booking is not fully confirmed until the remaining amount is paid. Please keep this in mind when planning your trip.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Payment completed notice */}
          {booking.status === "completed" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-medium text-green-800">Payment Completed</h3>
                  <p className="text-sm text-green-700 mt-1">
                    Your payment has been fully completed and confirmed. Thank you for your business!
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium border-b pb-2 mb-3">
                Main Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Booking ID</p>
                  <p className="font-medium">#{booking.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="font-medium">{formatDate(booking.startDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">End Date</p>
                  <p className="font-medium">{formatDate(booking.endDate)}</p>
                </div>
                {booking.location && (
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">{booking.location}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium border-b pb-2 mb-3">
                Additional Details
              </h3>
              {booking.description && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Description</p>
                  <p>{booking.description}</p>
                </div>
              )}

              {booking.additionalInfo &&
                Object.entries(booking.additionalInfo)
                  .filter(([key, value]) => 
                    value !== undefined && 
                    value !== null && 
                    key !== 'advancePaymentPercentage' && 
                    key !== 'specialRequests' && 
                    !key.includes('payment') &&
                    key !== 'price' &&
                    key !== 'discountPercentage'
                  )
                  .map(([key, value]) => {
                    return (
                      <div key={key} className="mb-2">
                        <p className="text-sm text-gray-500 capitalize">
                          {key
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase())}
                        </p>
                        <p className="font-medium">
                          {Array.isArray(value)
                            ? formatArrayData(value)
                            : typeof value === "object" && value !== null
                            ? JSON.stringify(value)
                            : String(value)}
                        </p>
                      </div>
                    )
                  })}
            </div>
          </div>

          {/* Type-specific details */}
          {booking.type === "trip" && booking.additionalInfo?.activities && (
            <div className="mt-6">
              <h3 className="text-lg font-medium border-b pb-2 mb-3">
                Trip Activities
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.isArray(booking.additionalInfo.activities) &&
                  booking.additionalInfo.activities.map(
                    (activity: any, index: number) => (
                      <div key={index} className="border rounded-lg p-3">
                        <h4 className="font-medium">{activity.name}</h4>
                        {activity.description && (
                          <p className="text-sm">{activity.description}</p>
                        )}
                        {activity.date && (
                          <p className="text-xs text-gray-500 mt-2">
                            Date: {formatDate(activity.date)}
                          </p>
                        )}
                      </div>
                    )
                  )}
              </div>
            </div>
          )}

          {booking.type === "stay" && booking.additionalInfo?.roomAmenities && (
            <div className="mt-6">
              <h3 className="text-lg font-medium border-b pb-2 mb-3">
                Room Amenities
              </h3>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(booking.additionalInfo.roomAmenities) &&
                  booking.additionalInfo.roomAmenities.map(
                    (amenity: string, index: number) => (
                      <span
                        key={index}
                        className="bg-gray-100 px-2 py-1 rounded text-sm"
                      >
                        {amenity}
                      </span>
                    )
                  )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
