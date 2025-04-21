"use client"

import { formatPrice } from "@/lib/utils"
import { useState, useTransition, useEffect } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Minus, Plus, CheckCircle, Loader2 } from "lucide-react"
import PaymentSelector from "@/components/payment/PaymentSelector"
import { createBookingWithPayment } from "@/actions/trips/tripBookingActions"
import { useCurrency } from "@/lib/contexts/CurrencyContext"
import { convertCurrency } from "@/lib/currencyUtils"

interface BookingFormProps {
  tripId: number
  maxSeats: number
  pricePerSeat: number
  userId: string
  originalCurrency?: string
}

export default function BookingForm({
  tripId,
  maxSeats,
  pricePerSeat,
  userId,
  originalCurrency = "TND", // Default currency if not specified
}: BookingFormProps) {
  const [seats, setSeats] = useState(1)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const { currency, convertPrice } = useCurrency()

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "flouci" | "stripe"
  >("flouci")
  
  // State for payment method specific pricing
  const [stripePrice, setStripePrice] = useState<number | null>(null)
  const [flouciPrice, setFlouciPrice] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch converted prices when component loads or payment method changes
  useEffect(() => {
    async function fetchConvertedPrices() {
      try {
        setLoading(true)
        // Convert to USD for Stripe
        const priceInUSD = await convertCurrency(pricePerSeat, originalCurrency, "USD")
        setStripePrice(priceInUSD)
        
        // Convert to TND for Flouci
        const priceInTND = await convertCurrency(pricePerSeat, originalCurrency, "TND")
        setFlouciPrice(priceInTND)
      } catch (error) {
        console.error("Error converting prices:", error)
        // Fallback to original prices if conversion fails
        setStripePrice(pricePerSeat)
        setFlouciPrice(pricePerSeat)
      } finally {
        setLoading(false)
      }
    }
    
    fetchConvertedPrices()
  }, [pricePerSeat, originalCurrency])

  // Get the appropriate price based on selected payment method
  const getDisplayPrice = () => {
    if (selectedPaymentMethod === "stripe" && stripePrice !== null) {
      return {
        pricePerSeat: stripePrice,
        currency: "USD",
      }
    } else if (selectedPaymentMethod === "flouci" && flouciPrice !== null) {
      return {
        pricePerSeat: flouciPrice,
        currency: "TND",
      }
    } else {
      // Fallback to using the original price with the user's selected currency
      return {
        pricePerSeat: convertPrice(pricePerSeat, originalCurrency),
        currency: currency,
      }
    }
  }
  
  // Get the display info
  const { pricePerSeat: displayPricePerSeat, currency: displayCurrency } = getDisplayPrice()
  
  // Calculate total price in the appropriate currency
  const totalPrice = seats * displayPricePerSeat
  
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (seats < 1 || seats > maxSeats) {
      setError(`Please select between 1 and ${maxSeats} seats`)
      return
    }

    startTransition(async () => {
      try {
        const result = await createBookingWithPayment({
          tripId,
          userId,
          seatsBooked: seats,
          pricePerSeat, // Use original price for database
          paymentMethod: selectedPaymentMethod, // Pass the selected payment method
        })

        if (!result.paymentLink && !result.sessionId) {
          throw new Error("No payment information received")
        }

        // Handle different payment methods
        if (selectedPaymentMethod === "stripe" && result.sessionId) {
          // Redirect to Stripe checkout
          window.location.href = result.url || ""
        } else if (selectedPaymentMethod === "flouci" && result.paymentLink) {
          // Redirect to Flouci payment page
          window.location.href = result.paymentLink
        } else {
          throw new Error("Invalid payment response")
        }
      } catch (error) {
        console.error("Error booking trip:", error)
        setError(
          error instanceof Error
            ? error.message
            : "Failed to book trip. Please try again."
        )
      }
    })
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">Booking Details</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="seats" className="font-medium">
              Number of Seats
            </Label>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setSeats((prev) => Math.max(1, prev - 1))}
                className="h-10 w-10 rounded-full"
                aria-label="Decrease seats"
              >
                <Minus className="h-4 w-4" />
              </Button>

              <div className="relative flex-1">
                <Input
                  id="seats"
                  type="number"
                  min={1}
                  max={maxSeats}
                  value={seats}
                  onChange={(e) => {
                    const value =
                      e.target.value === "" ? 1 : parseInt(e.target.value)
                    setSeats(isNaN(value) ? 1 : value)
                  }}
                  className="text-center pr-10"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  seats
                </span>
              </div>

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setSeats((prev) => Math.min(maxSeats, prev + 1))}
                className="h-10 w-10 rounded-full"
                aria-label="Increase seats"
                disabled={seats >= maxSeats}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Maximum {maxSeats} seats available
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Payment Selector Component */}
          <PaymentSelector
            selectedPaymentMethod={selectedPaymentMethod}
            setSelectedPaymentMethod={setSelectedPaymentMethod}
          />
          
          {loading ? (
            <div className="text-center py-2">
              <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground mt-1">Loading price information...</p>
            </div>
          ) : (
            <div className="flex flex-col space-y-2 pt-4">
              <div className="text-sm text-muted-foreground flex justify-between">
                <span>Payment Currency:</span>
                <span className="font-medium">{displayCurrency}</span>
              </div>
              <div className="text-sm text-muted-foreground flex justify-between">
                <span>Price per Seat:</span>
                <span className="font-medium">
                  {formatPrice(displayPricePerSeat, { currency: displayCurrency })}
                </span>
              </div>
            </div>
          )}

          <CardFooter className="flex flex-col pt-4 px-0 border-t">
            <div className="text-lg font-semibold mb-4 w-full flex justify-between items-center">
              <span>Total Price:</span>
              <span className="text-primary">
                {formatPrice(totalPrice, { currency: displayCurrency })}
              </span>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isPending || loading}
              size="lg"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirm Booking
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}
