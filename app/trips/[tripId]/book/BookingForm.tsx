"use client"

import { createBooking } from "@/actions/tripBookingActions"
import { formatPrice } from "@/lib/utils"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

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
  userId 
}: BookingFormProps) {
  const router = useRouter()
  const [seats, setSeats] = useState(1)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    
    if (seats < 1 || seats > maxSeats) {
      setError(`Please select between 1 and ${maxSeats} seats`)
      return
    }
    
    startTransition(async () => {
      try {
        const booking = await createBooking({
          tripId,
          userId,
          seatsBooked: seats,
        })
        router.push(`/trips/${tripId}/book/confirmation?bookingId=${booking.id}`)
      } catch (error) {
        console.error("Error booking trip:", error)
        setError("Failed to book trip. Please try again.")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="card bg-base-100 shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Booking Details</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block font-medium mb-1">
            Number of Seats
          </label>
          <input
            type="number"
            min={1}
            max={maxSeats}
            value={seats}
            onChange={(e) => setSeats(parseInt(e.target.value))}
            className="input input-bordered w-full"
            required
          />
          <p className="text-sm text-gray-600 mt-1">
            Maximum {maxSeats} seats available
          </p>
        </div>

        <div className="text-lg font-semibold">
          Total Price: {formatPrice(seats * pricePerSeat)}
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={isPending}
        >
          {isPending ? "Processing..." : "Confirm Booking"}
        </button>
      </div>
    </form>
  )
} 