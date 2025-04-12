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
} from "@/actions/hotels&rooms/roomBookingActions"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import PaymentSelector from "@/components/payment/PaymentSelector"
import { useCurrency } from "@/lib/contexts/CurrencyContext"

interface RoomBookingRecord {
  roomId: string
  userId: string
  checkIn: string
  checkOut: string
  totalPrice: string
  status: string
  bookingDate: Date | null
  paymentId: string | null
  paymentStatus: string | null
  paymentDate: Date | null
}

export interface RoomBookingWithPayment extends RoomBookingRecord {
  sessionId?: string
  url?: string
  paymentLink?: string
}

interface BookRoomFormProps {
  roomId: string
  pricePerNightAdult: number
  pricePerNightChild: number
  userId: string
  userDetails: {
    name: string
    surname: string
    email: string
    telephone: string
  }
  capacity: number
  currency?: string
}

export default function BookRoomForm({
  roomId,
  pricePerNightAdult,
  pricePerNightChild,
  userId,
  userDetails,
  capacity,
  currency = "TND",
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
  const [dateError, setDateError] = useState("")
  const [ticketError, setTicketError] = useState("")
  const [submissionError, setSubmissionError] = useState("")
  const [isLoadingDates, setIsLoadingDates] = useState(true)
  const [bookedDateRanges, setBookedDateRanges] = useState<
    Array<{ start: Date; end: Date }>
  >([])

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "flouci" | "stripe"
  >("flouci")

  // Use the currency context for conversion
  const { currency: selectedCurrency, convertPrice } = useCurrency()

  // Get the prices in the selected currency
  const convertedPricePerNightAdult = convertPrice(pricePerNightAdult, currency)
  const convertedPricePerNightChild = convertPrice(pricePerNightChild, currency)

  const formatDate = format

  const [formDetails, setFormDetails] = useState({
    name: userDetails.name,
    surname: userDetails.surname,
    telephone: userDetails.telephone,
    email: userDetails.email,
  })

  // Calculate nights from selected dates.
  const nights =
    dateRange.from && dateRange.to
      ? Math.ceil(
          (dateRange.to.getTime() - dateRange.from.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0

  // Calculate total price based on adult and child rates (infants are free).
  const basePrice =
    nights *
    (adultCount * parseFloat(pricePerNightAdult.toString()) +
      childCount * parseFloat(pricePerNightChild.toString()))
      
  // Calculate the converted total price
  const totalPrice = 
    nights *
    (adultCount * convertedPricePerNightAdult +
      childCount * convertedPricePerNightChild)

  // Add total guests calculation
  const totalGuests = adultCount + childCount + infantCount

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

  // Ticket count handlers with capacity validation
  const handleAdultChange = (increment: boolean) => {
    const newCount = increment ? adultCount + 1 : Math.max(0, adultCount - 1)
    const newTotal = newCount + childCount + infantCount

    if (newTotal > capacity) {
      setTicketError(`Total guests cannot exceed room capacity of ${capacity}`)
      return
    }
    setTicketError("")
    setAdultCount(newCount)
  }

  const handleChildChange = (increment: boolean) => {
    const newCount = increment ? childCount + 1 : Math.max(0, childCount - 1)
    const newTotal = adultCount + newCount + infantCount

    if (newTotal > capacity) {
      setTicketError(`Total guests cannot exceed room capacity of ${capacity}`)
      return
    }
    setTicketError("")
    setChildCount(newCount)
  }

  const handleInfantChange = (increment: boolean) => {
    const newCount = increment ? infantCount + 1 : Math.max(0, infantCount - 1)
    const newTotal = adultCount + childCount + newCount

    if (newTotal > capacity) {
      setTicketError(`Total guests cannot exceed room capacity of ${capacity}`)
      return
    }
    setTicketError("")
    setInfantCount(newCount)
  }

  // Modified handleSubmit to handle different payment methods
  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setDateError("")
    setTicketError("")
    setSubmissionError("")

    if (!dateRange.from || !dateRange.to) {
      setDateError("Please select a valid date range")
      return
    }
    if (dateRange.from >= dateRange.to) {
      setDateError("Check-out date must be after check-in date")
      return
    }
    if (adultCount < 1) {
      setTicketError("At least one adult is required")
      return
    }

    // Check availability one more time before booking
    const isAvailable = await checkRoomAvailability(
      roomId,
      dateRange.from,
      dateRange.to
    )

    if (!isAvailable) {
      setSubmissionError(
        "Selected dates are no longer available. Please choose different dates."
      )
      return
    }

    startTransition(async () => {
      try {
        console.log(`Starting booking with ${selectedPaymentMethod} payment...`)

        // Create booking with selected payment method - uses the original price
        const booking = await createRoomBooking({
          roomId,
          userId,
          checkIn: dateRange.from!,
          checkOut: dateRange.to!,
          totalPrice: basePrice, // Use base price for actual payment/booking
          adultCount,
          childCount,
          infantCount,
          initiatePayment: true,
          paymentMethod: selectedPaymentMethod,
        })

        console.log("Booking response:", booking)

        // Handle different payment methods
        if (selectedPaymentMethod === "stripe" && booking.sessionId) {
          // Redirect to Stripe checkout
          window.location.href = booking.url || ""
        } else if (selectedPaymentMethod === "flouci" && booking.paymentLink) {
          // Redirect to Flouci payment page
          window.location.href = booking.paymentLink
        } else {
          throw new Error(
            `Missing payment information for ${selectedPaymentMethod}`
          )
        }
      } catch (err) {
        console.error("Error booking room:", err)
        setSubmissionError(
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
              {dateError && (
                <p className="text-red-600 text-sm mt-1">{dateError}</p>
              )}
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
                    {formatPrice(convertedPricePerNightAdult, { currency: selectedCurrency })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="w-6 h-6 flex items-center justify-center bg-[#FF8A00] text-white rounded-md"
                    onClick={() => handleAdultChange(false)}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-6 text-center">{adultCount}</span>
                  <button
                    type="button"
                    className="w-6 h-6 flex items-center justify-center bg-[#FF8A00] text-white rounded-md"
                    onClick={() => handleAdultChange(true)}
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
                    {formatPrice(convertedPricePerNightChild, { currency: selectedCurrency })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="w-6 h-6 flex items-center justify-center bg-[#FF8A00] text-white rounded-md"
                    onClick={() => handleChildChange(false)}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-6 text-center">{childCount}</span>
                  <button
                    type="button"
                    className="w-6 h-6 flex items-center justify-center bg-[#FF8A00] text-white rounded-md"
                    onClick={() => handleChildChange(true)}
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
                    onClick={() => handleInfantChange(false)}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-6 text-center">{infantCount}</span>
                  <button
                    type="button"
                    className="w-6 h-6 flex items-center justify-center bg-[#FF8A00] text-white rounded-md"
                    onClick={() => handleInfantChange(true)}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Total Guests: {totalGuests} / {capacity}
            </div>
            {ticketError && (
              <p className="text-red-600 text-sm mt-1">{ticketError}</p>
            )}
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
                <Input
                  id="name"
                  value={formDetails.name}
                  onChange={(e) =>
                    setFormDetails({ ...formDetails, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="surname">Surname</Label>
                <Input
                  id="surname"
                  value={formDetails.surname}
                  onChange={(e) =>
                    setFormDetails({ ...formDetails, surname: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telephone">Telephone Number</Label>
                <Input
                  id="telephone"
                  value={formDetails.telephone}
                  onChange={(e) =>
                    setFormDetails({
                      ...formDetails,
                      telephone: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formDetails.email}
                  onChange={(e) =>
                    setFormDetails({ ...formDetails, email: e.target.value })
                  }
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <PaymentSelector
          selectedPaymentMethod={selectedPaymentMethod}
          setSelectedPaymentMethod={setSelectedPaymentMethod}
        />

        {/* Submission Error */}
        {submissionError && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md">
            {submissionError}
          </div>
        )}

        {/* Total and Submit */}
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-gray-500">Total Price</p>
              <p className="text-2xl font-bold">{formatPrice(totalPrice, { currency: selectedCurrency })}</p>
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
