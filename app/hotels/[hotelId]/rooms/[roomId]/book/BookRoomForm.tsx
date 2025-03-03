"use client"

import type React from "react"

import { createRoomBooking } from "@/actions/roomBookingActions"
import { formatPrice } from "@/lib/utils"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Clock } from "lucide-react"

interface BookRoomFormProps {
  roomId: string
  pricePerNight: number
  userId: string
}

export default function BookRoomForm({
  roomId,
  pricePerNight,
  userId,
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

    startTransition(async () => {
      try {
        const booking = await createRoomBooking({
          roomId,
          userId,
          checkIn: checkInDate,
          checkOut: checkOutDate,
        })
        router.push(
          `/hotels/${roomId}/book/confirmation?bookingId=${booking.id}`
        )
      } catch (error) {
        console.error("Error booking room:", error)
        setError("Failed to book room. Please try again.")
      }
    })
  }

  const nights =
    checkIn && checkOut
      ? Math.ceil(
          (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0

  return (
    <div className="rounded-lg border bg-white text-gray-900 shadow-lg">
      <div className="flex flex-col space-y-1.5 p-6 border-b">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">
          Book Your Stay
        </h3>
        <p className="text-sm text-gray-500">
          Select your check-in and check-out dates
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        <div className="grid gap-6">
          <div className="grid gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  Check-in Date
                </div>
              </label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  Check-out Date
                </div>
              </label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn || new Date().toISOString().split("T")[0]}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2"
                required
              />
            </div>
          </div>
        </div>

        {checkIn && checkOut && (
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>Duration</span>
              </div>
              <span>
                {nights} night{nights !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm font-medium">Total Price</span>
              <span className="text-lg font-semibold text-black">
                {formatPrice(pricePerNight * nights)}
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="inline-flex h-12 w-full items-center justify-center rounded-md bg-yellow-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-yellow-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 disabled:opacity-50"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Processing...
            </>
          ) : (
            "Confirm Booking"
          )}
        </button>
      </form>
    </div>
  )
}
