"use client"

import { createRoomBooking } from "@/actions/roomBookingActions"
import { formatPrice } from "@/lib/utils"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

interface BookRoomFormProps {
  roomId: string
  pricePerNight: number
  userId: string
}

export default function BookRoomForm({ 
  roomId, 
  pricePerNight,
  userId 
}: BookRoomFormProps) {
  const router = useRouter()
  const [checkIn, setCheckIn] = useState<string>("")
  const [checkOut, setCheckOut] = useState<string>("")
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)

    if (checkInDate >= checkOutDate) {
      setError("Check-out date must be after check-in date")
      return
    }

    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
    
    startTransition(async () => {
      try {
        const booking = await createRoomBooking({
          roomId,
          userId,
          checkIn: checkInDate,
          checkOut: checkOutDate,
        })
        router.push(`/hotels/${roomId}/book/confirmation?bookingId=${booking.id}`)
      } catch (error) {
        console.error("Error booking room:", error)
        setError("Failed to book room. Please try again.")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="card bg-base-100 shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Book Your Stay</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block font-medium mb-1">
            Check-in Date
          </label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="input input-bordered w-full"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">
            Check-out Date
          </label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            min={checkIn || new Date().toISOString().split('T')[0]}
            className="input input-bordered w-full"
            required
          />
        </div>

        {checkIn && checkOut && (
          <div className="text-lg font-semibold">
            Total Price: {formatPrice(
              pricePerNight * 
              Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
            )}
          </div>
        )}

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