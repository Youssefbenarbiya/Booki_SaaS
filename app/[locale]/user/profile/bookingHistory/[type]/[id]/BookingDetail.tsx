/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import Image from "next/image"
import { ChevronLeft, AlertCircle, CheckCircle, Info } from "lucide-react"
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
  const statusClass = getStatusColor(booking.status)

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
  
  // Calculate percentage for advance payment (default to 30% if not specified)
  const advancePercentage = booking.additionalInfo?.advancePaymentPercentage || 30
  const remainingPercentage = 100 - advancePercentage
  
  // Calculate advance payment amount
  const totalAmount = parseFloat(booking.totalPrice.replace(/[^0-9.]/g, ""))
  const advanceAmount = totalAmount * (advancePercentage / 100)
  const remainingAmount = totalAmount * (remainingPercentage / 100)
  
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
                  {booking.status === "partially_paid" ? "Partially Paid" : booking.status}
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
          
          {/* Show advance payment notice if applicable */}
          {isPartialPayment && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-800">Advance Payment Made</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    You've made an advance payment of {advancePercentage}% ({formatCurrency(advanceAmount)}). 
                    The remaining {remainingPercentage}% ({formatCurrency(remainingAmount)}) 
                    will need to be paid in cash upon arrival.
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
                <div>
                  <p className="text-sm text-gray-500">Total Price</p>
                  <p className="font-medium text-lg">{booking.totalPrice}</p>
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

              {/* Payment details */}
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Payment Information</p>
                <div className="space-y-1">
                  <p><span className="font-medium">Method:</span> {paymentMethod}</p>
                  <p><span className="font-medium">Status:</span> {booking.status}</p>
                  {isPartialPayment && (
                    <div className="mt-2 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Paid online:</span>
                        <span className="font-medium">
                          {formatCurrency(advanceAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between text-blue-800">
                        <span>Remaining to pay in cash:</span>
                        <span className="font-medium">
                          {formatCurrency(remainingAmount)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {booking.additionalInfo &&
                Object.entries(booking.additionalInfo)
                  .filter(([key, value]) => 
                    value !== undefined && 
                    value !== null && 
                    key !== 'advancePaymentPercentage' && 
                    key !== 'specialRequests' && 
                    !key.includes('payment'))
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
