/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Separator } from "@/components/ui/separator"
import { formatDateRange } from "@/lib/utils"
import { useCurrency } from "@/lib/contexts/CurrencyContext"
import { useEffect, useState } from "react"
import { convertCurrency } from "@/lib/currencyUtils"
import { formatPrice } from "@/lib/utils"

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
  
  // Add state for converted prices
  const [usdPrice, setUsdPrice] = useState<number | null>(null)
  const [tndPrice, setTndPrice] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  // Convert prices to USD and TND for both payment methods
  useEffect(() => {
    async function fetchConvertedPrices() {
      try {
        setLoading(true)
        
        // Convert to USD for Stripe
        const priceInUSD = await convertCurrency(effectivePrice, originalCurrency, "USD")
        setUsdPrice(priceInUSD)
        
        // Convert to TND for Flouci
        const priceInTND = await convertCurrency(effectivePrice, originalCurrency, "TND")
        setTndPrice(priceInTND)
      } catch (error) {
        console.error("Error converting prices:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchConvertedPrices()
  }, [effectivePrice, originalCurrency])

  // Convert prices to the user's selected currency
  const convertedEffectivePrice = convertPrice(effectivePrice, originalCurrency)
  const convertedOriginalPrice = convertPrice(
    Number(trip.originalPrice),
    originalCurrency
  )

  // Format price with the correct currency
  const formatPriceWithCurrency = (price: number, currencyCode = currency) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
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
          
          {/* Payment currency information */}
          {!loading && usdPrice !== null && tndPrice !== null && (
            <div className="mt-4 pt-3 border-t border-dashed">
              <p className="text-xs text-gray-500 mb-2">Payment Currency Options:</p>
              
              <div className="flex justify-between text-sm">
                <span className="flex items-center">
                  <span className="w-5 h-5 mr-1 inline-flex items-center justify-center rounded-full bg-blue-100 text-blue-500 text-xs">$</span>
                  Stripe (USD)
                </span>
                <span className="font-medium">
                  {formatPrice(usdPrice, { currency: "USD" })}
                </span>
              </div>
              
              <div className="flex justify-between text-sm mt-1">
                <span className="flex items-center">
                  <span className="w-5 h-5 mr-1 inline-flex items-center justify-center rounded-full bg-green-100 text-green-500 text-xs">D</span>
                  Flouci (TND)
                </span>
                <span className="font-medium">
                  {formatPrice(tndPrice, { currency: "TND" })}
                </span>
              </div>
              
              <p className="text-xs text-gray-500 mt-2">
                * Final price will be in the currency of your selected payment method
              </p>
            </div>
          )}
          
          <div className="flex justify-between text-sm">
            <span>Available seats</span>
            <span className="font-medium">{trip.capacity}</span>
          </div>
        </div>
      </div>
    </div>
  )
} 