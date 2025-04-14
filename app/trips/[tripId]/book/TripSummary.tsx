"use client"

import { Separator } from "@/components/ui/separator"
import { formatDateRange } from "@/lib/utils"
import { useCurrency } from "@/lib/contexts/CurrencyContext"

interface TripSummaryProps {
  trip: any 
  effectivePrice: number
  originalCurrency: string
  hasDiscount: boolean
}

export default function TripSummary({
  trip,
  effectivePrice,
  originalCurrency,
  hasDiscount,
}: TripSummaryProps) {
  const { currency, convertPrice } = useCurrency()

  // Convert prices to the user's selected currency
  const convertedEffectivePrice = convertPrice(effectivePrice, originalCurrency)
  const convertedOriginalPrice = convertPrice(
    Number(trip.originalPrice),
    originalCurrency
  )

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
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h2 className="text-xl font-semibold mb-4">Trip Summary</h2>
      <div className="space-y-4">
        <div>
          <h3 className="font-medium">{trip.name}</h3>
          <p className="text-sm text-gray-600">{trip.destination}</p>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Dates</span>
            <span className="font-medium">
              {formatDateRange(trip.startDate, trip.endDate)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Price per person</span>
            <span className="font-medium">
              {hasDiscount ? (
                <div className="text-right">
                  <div>{formatPriceWithCurrency(convertedEffectivePrice)}</div>
                  <div className="flex items-center justify-end space-x-2">
                    <span className="text-xs line-through text-gray-500">
                      {formatPriceWithCurrency(convertedOriginalPrice)}
                    </span>
                    <span className="text-xs font-medium text-green-600">
                      {trip.discountPercentage}% off
                    </span>
                  </div>
                </div>
              ) : (
                formatPriceWithCurrency(convertedEffectivePrice)
              )}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Available seats</span>
            <span className="font-medium">{trip.capacity}</span>
          </div>
        </div>
      </div>
    </div>
  )
} 