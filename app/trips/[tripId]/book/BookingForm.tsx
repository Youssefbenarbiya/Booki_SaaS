"use client"

import { createBooking } from "@/actions/tripBookingActions"
import { formatPrice } from "@/lib/utils"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
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
import { TripPaymentMethodSelector } from "@/app/trips/components/TripPaymentMethodSelector"
import { generateTripPaymentLink } from "@/services/tripPaymentService"

interface BookingFormProps {
  tripId: number
  maxSeats: number
  pricePerSeat: number
  userId: string
}

export default function BookingForm({
  tripId,
  maxSeats,
  pricePerSeat,
  userId,
}: BookingFormProps) {
  const router = useRouter()
  const [seats, setSeats] = useState(1)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"flouci" | "stripe">("flouci")
  const [createdBookingId, setCreatedBookingId] = useState<number | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (seats < 1 || seats > maxSeats) {
      setError(`Please select between 1 and ${maxSeats} seats`)
      return
    }

    startTransition(async () => {
      try {
        console.log("Creating booking with:", { tripId, userId, seats, totalPrice: seats * pricePerSeat });
        
        // Create booking first
        const booking = await createBooking({
          tripId,
          userId,
          seatsBooked: seats,
        })

        if (!booking || !booking.id) {
          throw new Error("Failed to create booking - no booking ID returned");
        }

        console.log("Booking created successfully:", booking);
        setCreatedBookingId(booking.id);

        // Calculate total amount
        const totalAmount = seats * pricePerSeat;
        console.log("Processing payment for amount:", totalAmount);

        // Handle payment based on selected method
        if (paymentMethod === "flouci") {
          try {
            // Generate Flouci payment link
            const { paymentLink } = await generateTripPaymentLink({
              amount: totalAmount,
              bookingId: booking.id,
              developerTrackingId: `trip_${booking.id}`
            });
            
            if (!paymentLink) {
              throw new Error("Failed to generate payment link - no link returned");
            }
            
            console.log("Payment link generated successfully:", paymentLink);
            
            // Redirect to payment page
            router.push(paymentLink);
          } catch (paymentError) {
            console.error("Payment link generation failed:", paymentError);
            setError(`Payment error: ${paymentError.message || "Could not process payment"}`);
            
            // Fallback to mock payment system if Flouci fails
            console.log("Using mock payment system as fallback");
            router.push(`/trips/mock-payment?bookingId=${booking.id}&amount=${totalAmount}`);
          }
        } else if (paymentMethod === "stripe") {
          // For now, redirect to not found page as per requirements
          router.push('/not-found');
        }
      } catch (error) {
        console.error("Error booking trip:", error);
        setError(`Failed to book trip: ${error.message || "Please try again"}`);
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

          {/* Payment Method Selector */}
          <TripPaymentMethodSelector 
            selectedMethod={paymentMethod} 
            onSelect={setPaymentMethod} 
          />

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
              {createdBookingId && (
                <div className="mt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push('/dashboard/bookings')}
                  >
                    View your booking
                  </Button>
                </div>
              )}
            </Alert>
          )}

          <CardFooter className="flex flex-col pt-4 px-0 border-t">
            <div className="text-lg font-semibold mb-4 w-full flex justify-between items-center">
              <span>Total Price:</span>
              <span className="text-primary">
                {formatPrice((isNaN(seats) ? 1 : seats) * pricePerSeat)}
              </span>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isPending}
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
                  Pay Now
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}
