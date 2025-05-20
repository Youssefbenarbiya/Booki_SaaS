/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import Image from "next/image"
import { useCurrency } from "@/lib/contexts/CurrencyContext"
import { Info } from "lucide-react"

interface RoomSummaryProps {
  room: any // Replace with your Room type
}

export default function RoomSummary({ room }: RoomSummaryProps) {
  const { currency, convertPrice } = useCurrency()
  
  // Get original currency or default to TND
  const originalCurrency = room.currency || "TND"
  
  // Convert prices to user's selected currency
  const adultPrice = convertPrice(Number(room.pricePerNightAdult), originalCurrency)
  const childPrice = convertPrice(Number(room.pricePerNightChild), originalCurrency)
  
  // Format price with the correct currency
  const formatPriceWithCurrency = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Room Summary</h2>

      {room.images && room.images.length > 0 && (
        <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
          <Image
            src={room.images[0] || "/placeholder.svg"}
            alt={room.name}
            width={500}
            height={500}
            className="object-cover"
          />
        </div>
      )}

      <div className="space-y-3">
        <p className="flex justify-between">
          <span className="font-medium text-gray-700">Room:</span>
          <span>{room.name}</span>
        </p>
        <p className="flex justify-between">
          <span className="font-medium text-gray-700">Hotel:</span>
          <span>{room.hotel.name}</span>
        </p>
        <p className="flex justify-between">
          <span className="font-medium text-gray-700">Type:</span>
          <span>{room.roomType}</span>
        </p>
        <p className="flex justify-between">
          <span className="font-medium text-gray-700">Capacity:</span>
          <span>{room.capacity} guests</span>
        </p>
        <p className="flex justify-between">
          <span className="font-medium text-gray-700">
            Price per Night (Adult):
          </span>
          <span className="font-semibold text-black">
            {formatPriceWithCurrency(adultPrice)}
          </span>
        </p>
        <p className="flex justify-between">
          <span className="font-medium text-gray-700">
            Price per Night (Child):
          </span>
          <span className="font-semibold text-black">
            {formatPriceWithCurrency(childPrice)}
          </span>
        </p>

        {/* Add advance payment information if enabled */}
        {room.advancePaymentEnabled && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-100">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-700">Advance Payment Available</h3>
                <p className="text-sm text-blue-600 mt-1">
                  This room offers a flexible payment option! You can pay {room.advancePaymentPercentage}% now
                  and the remaining amount at check-in.
                </p>
              </div>
            </div>
          </div>
        )}

        {room.amenities && room.amenities.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium text-gray-700 mb-2">
              Room Amenities:
            </h3>
            <div className="flex flex-wrap gap-2">
              {room.amenities.map((amenity: string, index: number) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-800 text-xs rounded-full px-2 py-1"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 