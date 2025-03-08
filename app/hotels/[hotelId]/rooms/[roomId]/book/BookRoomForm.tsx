/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, FormEvent, useTransition, useEffect } from "react"
import Image from "next/image"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn, formatPrice } from "@/lib/utils"
import { format, isBefore, isWithinInterval } from "date-fns"

import { CalendarIcon, Minus, Plus } from "lucide-react"
import {
  createRoomBooking,
  checkRoomAvailability,
  getBookedDatesForRoom,
} from "@/actions/roomBookingActions"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface BookingWithPayment {
  paymentLink?: string
}

interface BookRoomFormProps {
  roomId: string
  pricePerNightAdult: number
  pricePerNightChild: number
  userId: string
}

export default function BookRoomForm({
  roomId,
  pricePerNightAdult,
  pricePerNightChild,
  userId,
}: BookRoomFormProps) {
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })
  const [time, setTime] = useState("13:00")
  const [adultCount, setAdultCount] = useState(1)
  const [childCount, setChildCount] = useState(0)
  const [infantCount, setInfantCount] = useState(0)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const [isLoadingDates, setIsLoadingDates] = useState(true)
  const [bookedDateRanges, setBookedDateRanges] = useState<
    Array<{ start: Date; end: Date }>
  >([])

  const formatDate = format

  // Calculate nights from selected dates.
  const nights =
    dateRange.from && dateRange.to
      ? Math.ceil(
          (dateRange.to.getTime() - dateRange.from.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0

  // Calculate total price based on adult and child rates (infants are free).
  const totalPrice =
    nights *
    (adultCount * parseFloat(pricePerNightAdult.toString()) +
      childCount * parseFloat(pricePerNightChild.toString()))

  // Fetch booked dates when component mounts
  useEffect(() => {
    let isMounted = true

    async function fetchBookedDates() {
      if (!roomId) return

      try {
        const bookedDates = await getBookedDatesForRoom(roomId)

        if (isMounted) {
          setBookedDateRanges(
            bookedDates.map((range) => ({
              start: new Date(range.start),
              end: new Date(range.end),
            }))
          )
          setIsLoadingDates(false)
        }
      } catch (error) {
        console.error("Error fetching booked dates:", error)
        if (isMounted) {
          setIsLoadingDates(false)
        }
      }
    }

    fetchBookedDates()

    return () => {
      isMounted = false
    }
  }, [roomId])

  // Function to check if a date should be disabled
  const isDateDisabled = (date: Date) => {
    // Disable dates before today
    if (isBefore(date, new Date())) {
      return true
    }

    // Check if the date falls within any booked range
    return bookedDateRanges.some((range) =>
      isWithinInterval(date, {
        start: range.start,
        end: range.end,
      })
    )
  }

  // Modified handleSubmit to check availability again before booking
  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError("")

    if (!dateRange.from || !dateRange.to) {
      setError("Please select a valid date range")
      return
    }
    if (dateRange.from >= dateRange.to) {
      setError("Check-out date must be after check-in date")
      return
    }
    if (adultCount < 1) {
      setError("At least one adult is required")
      return
    }

    // Check availability one more time before booking
    const isAvailable = await checkRoomAvailability(
      roomId,
      dateRange.from,
      dateRange.to
    )

    if (!isAvailable) {
      setError(
        "Selected dates are no longer available. Please choose different dates."
      )
      return
    }

    startTransition(async () => {
      try {
        // Create booking and get payment link
        const booking = (await createRoomBooking({
          roomId,
          userId,
          checkIn: dateRange.from!,
          checkOut: dateRange.to!,
          totalPrice,
          adultCount,
          childCount,
          infantCount,
          initiatePayment: true,
        })) as BookingWithPayment

        console.log("Booking response:", booking) // Add this for debugging

        // If payment link is available, redirect to payment page
        if (booking.paymentLink) {
          console.log("Redirecting to:", booking.paymentLink) // Add this for debugging
          window.location.href = booking.paymentLink
        } else {
          setError("Payment link not generated. Please try again.")
        }
      } catch (err) {
        console.error("Error booking room:", err)
        setError(
          err instanceof Error
            ? err.message
            : "Failed to book room. Please try again."
        )
      }
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto bg-white p-6 md:p-8"
    >
      {/* Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="mb-4">
          <Image
            src="/assets/icons/logo.png"
            alt="Ostelflow logo"
            width={150}
            height={30}
            className="object-contain"
            style={{ objectPosition: "top" }}
          />
        </div>
        <h1 className="text-4xl font-bold">
          <span className="text-[#FF8A00]">BOOK</span> NOW
        </h1>
      </div>

      <div className="space-y-8">
        {/* Section 1: Booking Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FF8A00] text-white font-bold">
              1
            </div>
            <h2 className="text-[#FF8A00] font-medium">Booking Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">When are you visiting?</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    id="date"
                    className={cn(
                      "w-full flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                      !dateRange.from && "text-muted-foreground"
                    )}
                    disabled={isLoadingDates}
                  >
                    {isLoadingDates
                      ? "Loading available dates..."
                      : dateRange.from
                      ? dateRange.to
                        ? `${formatDate(
                            dateRange.from,
                            "dd-MM-yyyy"
                          )} - ${formatDate(dateRange.to, "dd-MM-yyyy")}`
                        : formatDate(dateRange.from, "dd-MM-yyyy")
                      : "DD-MM-YYYY"}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  {isLoadingDates ? (
                    <div className="p-4 flex items-center justify-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Loading available dates...
                    </div>
                  ) : (
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={(range) => {
                        if (range) {
                          setDateRange({
                            from: range.from,
                            to: range.to || undefined,
                          })
                        }
                      }}
                      disabled={isDateDisabled}
                      initialFocus
                      numberOfMonths={2}
                    />
                  )}
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">What time?</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <h3 className="font-medium">Select Your Tickets</h3>
            <div className="space-y-3 mt-4">
              {/* Adult Ticket */}
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                <div>
                  <p className="font-medium">Adult (18+)</p>
                  <p className="text-sm text-gray-500">
                    {formatPrice(pricePerNightAdult)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="w-6 h-6 flex items-center justify-center bg-[#FF8A00] text-white rounded-md"
                    onClick={() => setAdultCount(Math.max(0, adultCount - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-6 text-center">{adultCount}</span>
                  <button
                    type="button"
                    className="w-6 h-6 flex items-center justify-center bg-[#FF8A00] text-white rounded-md"
                    onClick={() => setAdultCount(adultCount + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {/* Child Ticket */}
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                <div>
                  <p className="font-medium">Child (5-17)</p>
                  <p className="text-sm text-gray-500">
                    {formatPrice(pricePerNightChild)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="w-6 h-6 flex items-center justify-center bg-[#FF8A00] text-white rounded-md"
                    onClick={() => setChildCount(Math.max(0, childCount - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-6 text-center">{childCount}</span>
                  <button
                    type="button"
                    className="w-6 h-6 flex items-center justify-center bg-[#FF8A00] text-white rounded-md"
                    onClick={() => setChildCount(childCount + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {/* Infant Ticket */}
              <div className="flex items-center justify-between bg-[#FFF8EE] p-3 rounded-md">
                <div>
                  <p className="font-medium">Infant (0-5)</p>
                  <p className="text-sm text-gray-500">
                    Only in combination with: Adult (18+)
                  </p>
                  <p className="text-[#FF8A00] font-medium">FREE</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="w-6 h-6 flex items-center justify-center bg-[#FF8A00] text-white rounded-md"
                    onClick={() => setInfantCount(Math.max(0, infantCount - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-6 text-center">{infantCount}</span>
                  <button
                    type="button"
                    className="w-6 h-6 flex items-center justify-center bg-[#FF8A00] text-white rounded-md"
                    onClick={() => setInfantCount(infantCount + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Your Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FF8A00] text-white font-bold">
              2
            </div>
            <h2 className="text-[#FF8A00] font-medium">Your Details</h2>
          </div>
          <div className="space-y-4">
            <p className="font-medium">Who shall we send your tickets to?</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Enter your name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="surname">Surname</Label>
                <Input id="surname" placeholder="Enter your surname" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telephone">Telephone Number</Label>
                <Input
                  id="telephone"
                  placeholder="Enter your telephone number"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FF8A00] text-white font-bold">
              3
            </div>
            <h2 className="text-[#FF8A00] font-medium">Payment Information</h2>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-600 mb-2">
              You will be redirected to Flouci payment gateway to complete your
              payment securely.
            </p>
            <div className="flex items-center gap-2 mb-2">
              <Image
                src="/assets/payment/flouci-logo.png"
                alt="Flouci"
                width={80}
                height={30}
                className="object-contain"
              />
              <Image
                src="/assets/payment/visa.png"
                alt="Visa"
                width={40}
                height={30}
                className="object-contain"
              />
              <Image
                src="/assets/payment/mastercard.png"
                alt="Mastercard"
                width={40}
                height={30}
                className="object-contain"
              />
            </div>
            <p className="text-xs text-gray-500">
              Your payment information is encrypted and secure.
            </p>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md">{error}</div>
        )}

        {/* Total and Submit */}
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-gray-500">Total Price</p>
              <p className="text-2xl font-bold">{formatPrice(totalPrice)}</p>
            </div>
            <Button
              type="submit"
              className="bg-[#FF8A00] hover:bg-[#E67A00] text-white px-6 py-2 rounded-md"
              disabled={isPending || !dateRange.from || !dateRange.to}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Book Now & Pay"
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 text-center">
            By clicking &quot;Book Now & Pay&quot;, you agree to our terms and
            conditions.
          </p>
        </div>
      </div>
    </form>
  )
}
