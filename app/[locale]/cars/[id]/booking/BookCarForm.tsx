/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { DateRange } from "react-day-picker"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { getCarById, getCarAvailability } from "@/actions/cars/carActions"
import { bookCar } from "@/actions/cars/bookingCars"
import { DatePicker } from "@/components/ui/date-picker"
import PaymentSelector from "@/components/payment/PaymentSelector"
import { useCurrency } from "@/lib/contexts/CurrencyContext"
import { formatPrice } from "@/lib/utils"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

const bookingFormSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  drivingLicense: z.string().min(5, "Driving license number is required"),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
})

export type BookingFormValues = z.infer<typeof bookingFormSchema>

interface BookCarFormProps {
  carId: string
  session: any
  locale?: string // Add locale parameter
}

const BookCarForm: React.FC<BookCarFormProps> = ({
  carId,
  session,
  locale = "en", // Default to English
}) => {
  const router = useRouter()
  const numericCarId = parseInt(carId, 10)
  const { currency, convertPrice } = useCurrency()

  const [car, setCar] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookedDateRanges, setBookedDateRanges] = useState<
    Array<{ startDate: Date; endDate: Date; bookingId: number }>
  >([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "flouci" | "stripe"
  >("flouci")

  // Add state for payment type (full or advance)
  const [paymentType, setPaymentType] = useState<"full" | "advance">("full")
  const [advancePaymentPercentage, setAdvancePaymentPercentage] =
    useState<number>(30)



  const defaultFormValues: BookingFormValues = {
    fullName: session?.user?.name || "",
    email: session?.user?.email || "",
    phone: session?.user?.phoneNumber || "",
    address: session?.user?.address || "",
    drivingLicense: "",
    agreeToTerms: false,
  }

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: defaultFormValues,
  })

  const totalDays = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return 0
    return (
      Math.ceil(
        (dateRange.to.getTime() - dateRange.from.getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1
    )
  }, [dateRange?.from, dateRange?.to])

  const effectivePrice = useMemo(() => {
    if (!car || !car.originalPrice) return 0

    // Use priceAfterDiscount if provided
    if (
      car.priceAfterDiscount !== undefined &&
      car.priceAfterDiscount !== null
    ) {
      return parseFloat(car.priceAfterDiscount)
    }

    // If discountPercentage is provided and greater than 0, calculate the discounted price.
    if (car.discountPercentage && car.discountPercentage > 0) {
      const originalPriceNum = parseFloat(car.originalPrice)
      if (isNaN(originalPriceNum)) return 0
      const discount = originalPriceNum * (car.discountPercentage / 100)
      return parseFloat((originalPriceNum - discount).toFixed(2))
    }

    // Fallback to originalPrice.
    return parseFloat(car.originalPrice)
  }, [car])

  // Convert price to the user-selected currency for display purposes only
  const convertedEffectivePrice = useMemo(() => {
    if (!car) return 0
    const carCurrency = car.currency || "TND" // Default to TND since that's the DB default
    return convertPrice(effectivePrice, carCurrency)
  }, [car, effectivePrice, convertPrice])

  // Calculate the price in the car's original currency (for payment processing)
  const priceInOriginalCurrency = useMemo(() => {
    const days = totalDays
    if (!car || isNaN(days) || !effectivePrice) return 0
    return parseFloat((days * effectivePrice).toFixed(2))
  }, [effectivePrice, totalDays, car])

  const totalPrice = useMemo(() => {
    const days = totalDays
    if (!car || isNaN(days) || !convertedEffectivePrice) return 0
    return parseFloat((days * convertedEffectivePrice).toFixed(2))
  }, [convertedEffectivePrice, totalDays])

  // Calculate advance payment amount
  const advancePaymentAmount = useMemo(() => {
    return paymentType === "advance"
      ? totalPrice * (advancePaymentPercentage / 100)
      : 0
  }, [totalPrice, paymentType, advancePaymentPercentage])

  // Calculate remaining amount to be paid in cash
  const remainingCashAmount = useMemo(() => {
    return paymentType === "advance" ? totalPrice - advancePaymentAmount : 0
  }, [totalPrice, paymentType, advancePaymentAmount])

  // Amount to actually charge
  const amountToCharge = useMemo(() => {
    return paymentType === "full" ? totalPrice : advancePaymentAmount
  }, [paymentType, totalPrice, advancePaymentAmount])

  useEffect(() => {
    let isMounted = true
    async function loadCarAndAvailability() {
      try {
        setLoading(true)
        const [carResult, availabilityResult] = await Promise.all([
          getCarById(numericCarId),
          getCarAvailability(numericCarId),
        ])
        if (isMounted) {
          setCar(carResult.car)
          if (
            availabilityResult.success &&
            availabilityResult.bookedDateRanges
          ) {
            setBookedDateRanges(
              availabilityResult.bookedDateRanges.map((range: any) => ({
                startDate: new Date(range.startDate),
                endDate: new Date(range.endDate),
                bookingId: range.bookingId,
              }))
            )
          }
          setLoading(false)
        }
      } catch (err) {
        console.error("Failed to load car or availability:", err)
        if (isMounted) {
          setError("Failed to load car details")
          setLoading(false)
        }
      }
    }
    loadCarAndAvailability()
    return () => {
      isMounted = false
    }
  }, [numericCarId])

  const hasDateOverlap = useCallback(
    (selectedRange: DateRange) => {
      const { from, to } = selectedRange
      if (!from || !to) return false
      const selectedStart = from.getTime()
      const selectedEnd = to.getTime()
      return bookedDateRanges.some((booked) => {
        const bookedStart = booked.startDate.getTime()
        const bookedEnd = booked.endDate.getTime()
        return selectedStart <= bookedEnd && selectedEnd >= bookedStart
      })
    },
    [bookedDateRanges]
  )

  const onSubmit = useCallback(
    async (data: BookingFormValues) => {
      if (!session?.user?.id) {
        toast.error("Please log in to book a car")
        return
      }

      if (!dateRange?.from || !dateRange?.to) {
        toast.error("Please select pickup and return dates")
        document.querySelector(".date-picker-container")?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        })
        return
      }

      if (hasDateOverlap(dateRange)) {
        toast.error("Selected dates are not available", {
          description: "Please choose different dates",
          duration: 5000,
        })
        document.querySelector(".date-picker-container")?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        })
        return
      }

      try {
        setIsSubmitting(true)

        // Calculate price based on payment type
        const paymentAmount =
          paymentType === "full"
            ? priceInOriginalCurrency
            : priceInOriginalCurrency * (advancePaymentPercentage / 100)

        // Add more detailed logging
        console.log("Submitting booking with data:", {
          carId: numericCarId,
          userId: session.user.id,
          startDate: dateRange.from,
          endDate: dateRange.to,
          totalPrice: priceInOriginalCurrency,
          paymentMethod: selectedPaymentMethod,
          paymentType: paymentType,
          advancePaymentPercentage:
            paymentType === "advance" ? advancePaymentPercentage : undefined,
          paymentAmount: paymentAmount,
        })

        const result = await bookCar({
          carId: numericCarId,
          userId: session.user.id,
          startDate: dateRange.from,
          endDate: dateRange.to,
          totalPrice: priceInOriginalCurrency,
          customerInfo: data,
          paymentMethod: selectedPaymentMethod,
          locale: locale,
          paymentType: paymentType,
          advancePaymentPercentage:
            paymentType === "advance" ? advancePaymentPercentage : undefined,
          paymentAmount: paymentAmount,
        })

        console.log("Booking result:", result) // Add this log to see the result

        if (result.success) {
          if (selectedPaymentMethod === "stripe" && result.booking?.url) {
            console.log("Redirecting to Stripe:", result.booking.url)
            window.location.href = result.booking.url
          } else if (
            selectedPaymentMethod === "flouci" &&
            result.booking?.paymentLink
          ) {
            console.log("Redirecting to Flouci:", result.booking.paymentLink)
            window.location.href = result.booking.paymentLink
          } else {
            console.error("Invalid payment response:", result)
            toast.error("Invalid payment response")
          }
        } else {
          console.error("Booking failed:", result.error)
          toast.error(result.error || "Booking failed")
        }
      } catch (error) {
        console.error("Booking error:", error)
        toast.error("Payment initiation failed")
      } finally {
        setIsSubmitting(false)
      }
    },
    [
      dateRange,
      hasDateOverlap,
      numericCarId,
      effectivePrice,
      totalDays,
      car,
      session,
      selectedPaymentMethod,
      locale,
      priceInOriginalCurrency,
      paymentType,
      advancePaymentPercentage,
    ]
  )

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </div>
    )
  }

  if (error || !car) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500">Error</h2>
          <p className="mt-2">{error || "Car not found"}</p>
          <Button className="mt-4" onClick={() => router.push("/cars")}>
            Back to Cars
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Car Details Block */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-center">Car Details</h2>
          <div className="relative h-48 w-full rounded-lg overflow-hidden mb-4">
            <Image
              src={car.images?.[0] || "/assets/Car.png"}
              alt={`${car.brand} ${car.model}`}
              fill
              className="object-cover"
            />
          </div>
          <h3 className="text-xl font-semibold text-center">
            {car.brand} {car.model}
          </h3>
          <p className="text-gray-500 mb-4 text-center">
            {car.year} • {car.color}
          </p>
          <Separator className="my-4" />
          <div className="mb-4 date-picker-container">
            <h4 className="font-medium text-gray-700 mb-2 text-center">
              Rental Period
            </h4>
            <DatePicker
              dateRange={dateRange}
              setDateRange={setDateRange}
              disabledDateRanges={bookedDateRanges}
              className="border-2 border-gray-200 mx-auto"
            />
            {!dateRange && (
              <p className="text-sm text-blue-600 mt-2 text-center">
                Please select your rental dates
              </p>
            )}
          </div>
          <Separator className="my-4" />
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Price per day</span>
              <span>{formatPrice(convertedEffectivePrice, { currency })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Days</span>
              <span>{dateRange ? `${totalDays} days` : "Select dates"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Insurance</span>
              <span>Included</span>
            </div>
            <div className="flex justify-between font-bold text-xl mt-4">
              <span>Total</span>
              <span>
                {dateRange ? formatPrice(totalPrice, { currency }) : "TBD"}
              </span>
            </div>
          </div>
        </div>
        {/* Booking Information Block */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-lg max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-center">
            Booking Information
          </h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="john.doe@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 123 456 7890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="drivingLicense"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Driving License Number</FormLabel>
                      <FormControl>
                        <Input placeholder="DL1234567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123 Main St, City, Country"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Payment Type Selection */}
              <div className="space-y-3 pt-2">
                <FormLabel className="font-medium">Payment Option</FormLabel>
                <RadioGroup
                  value={paymentType}
                  onValueChange={(value) =>
                    setPaymentType(value as "full" | "advance")
                  }
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2 border rounded-md p-3">
                    <RadioGroupItem value="full" id="full-payment" />
                    <Label
                      htmlFor="full-payment"
                      className="cursor-pointer flex-1"
                    >
                      <span className="font-medium">Pay Full Amount</span>
                      <p className="text-sm text-muted-foreground">
                        Pay the entire amount online
                      </p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-3">
                    <RadioGroupItem value="advance" id="advance-payment" />
                    <Label
                      htmlFor="advance-payment"
                      className="cursor-pointer flex-1"
                    >
                      <span className="font-medium">
                        Pay {advancePaymentPercentage}% Advance
                      </span>
                      <p className="text-sm text-muted-foreground">
                        Pay {advancePaymentPercentage}% now and the rest in cash
                        at pickup
                      </p>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Separator />
              <FormField
                control={form.control}
                name="agreeToTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I agree to the terms and conditions of rental
                      </FormLabel>
                      <FormDescription>
                        By agreeing, you confirm you&apos;ve read our terms
                        including the cancellation policy.
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="mt-4">
                <PaymentSelector
                  selectedPaymentMethod={selectedPaymentMethod}
                  setSelectedPaymentMethod={setSelectedPaymentMethod}
                />
              </div>

              {/* Payment Breakdown */}
              {dateRange && totalPrice > 0 && (
                <div className="mt-4 space-y-2 pt-4 px-0 border-t">
                  {/* Show payment breakdown if advance payment selected */}
                  {paymentType === "advance" && (
                    <>
                      <div className="flex justify-between items-center text-sm">
                        <span>Total Rental Cost:</span>
                        <span>{formatPrice(totalPrice, { currency })}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>
                          Online Advance Payment ({advancePaymentPercentage}%):
                        </span>
                        <span>
                          {formatPrice(advancePaymentAmount, { currency })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>
                          Remaining Cash Payment (
                          {100 - advancePaymentPercentage}%):
                        </span>
                        <span>
                          {formatPrice(remainingCashAmount, { currency })}
                        </span>
                      </div>
                      <Separator className="my-2" />
                    </>
                  )}

                  {/* Show amount being charged now */}
                  <div className="text-lg font-semibold w-full flex justify-between items-center">
                    <span>
                      {paymentType === "advance" ? "Pay Now:" : "Total Price:"}
                    </span>
                    <span className="text-primary">
                      {formatPrice(amountToCharge, { currency })}
                    </span>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white mt-4"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay with ${
                    selectedPaymentMethod === "stripe"
                      ? "Credit Card"
                      : "Flouci"
                  }`
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}

export default BookCarForm
