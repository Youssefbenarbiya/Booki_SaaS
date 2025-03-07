/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, FormEvent, useTransition } from "react"
import Image from "next/image"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn, formatPrice } from "@/lib/utils"
import { format as formatDate } from "date-fns"
import { CalendarIcon, ChevronDown, Minus, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { createRoomBooking } from "@/actions/roomBookingActions"

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
  const router = useRouter()
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
    nights * (adultCount * pricePerNightAdult + childCount * pricePerNightChild)

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

    startTransition(async () => {
      try {
        // Extract hotelId from URL (assumes path like /hotels/[hotelId]/rooms/...)
        const pathParts = window.location.pathname.split("/")
        const hotelId = pathParts[2]

        // Cast to any if your CreateRoomBookingParams type does not include these extra properties.
        const booking = await createRoomBooking({
          roomId,
          userId,
          checkIn: dateRange.from,
          checkOut: dateRange.to,
          totalPrice,
          status: "confirmed",
          adultCount,
          childCount,
          infantCount,
        } as any)

        router.push(
          `/hotels/${hotelId}/rooms/${roomId}/book/confirmation?bookingId=${booking.id}`
        )
      } catch (err) {
        console.error("Error booking room:", err)
        setError("Failed to book room. Please try again.")
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
                  >
                    {dateRange.from
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
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={(range) => {
                      if (range) setDateRange(range)
                    }}
                    initialFocus
                    numberOfMonths={2}
                  />
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

        {/* Section 3: Payment */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FF8A00] text-white font-bold">
              3
            </div>
            <h2 className="text-[#FF8A00] font-medium">Payment</h2>
          </div>
          <div className="space-y-4">
            <p className="font-medium">Select a payment method</p>
            <RadioGroup defaultValue="visa" className="space-y-3">
              <div className="flex items-center space-x-2 border rounded-md p-3">
                <RadioGroupItem value="visa" id="visa" />
                <Label htmlFor="visa" className="flex-1">
                  VISA
                </Label>
                <p className="text-xs text-gray-500">
                  You will be redirected after clicking &quot;Book now&quot;
                </p>
                <div className="w-12 h-8 bg-white border rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-800">VISA</span>
                </div>
              </div>
            </RadioGroup>
            <Card className="mt-4 bg-[#FFF8EE] border-[#FFE8CC]">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-[#FF8A00]"
                    >
                      <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572"></path>
                    </svg>
                    <p className="font-medium">Pay with Credit Card</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <div className="relative">
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                        />
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expirationDate">Expiration Date</Label>
                      <Input id="expirationDate" placeholder="MM/YY" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">Card Security Code</Label>
                      <Input id="cvv" placeholder="***" />
                    </div>
                  </div>
                  <div className="text-right">
                    <a href="#" className="text-sm text-[#FF8A00] underline">
                      What is this?
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Book Now Button & Summary */}
        <div className="flex flex-col items-center mt-8">
          <button
            type="submit"
            className="bg-[#FF8A00] text-white font-medium py-3 px-8 rounded-md hover:bg-[#E67E00] transition-colors w-full md:w-auto"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Processing...
              </>
            ) : (
              "Book now"
            )}
          </button>
          {dateRange.from && dateRange.to && (
            <div className="rounded-lg bg-gray-50 p-4 mt-4 w-full">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span>Duration</span>
                </div>
                <span>
                  {nights} night{nights !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-medium">Total Price</span>
                <span className="text-lg font-semibold text-black">
                  {formatPrice(totalPrice)}
                </span>
              </div>
            </div>
          )}
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 mt-4">
              {error}
            </div>
          )}
        </div>
      </div>
    </form>
  )
}
