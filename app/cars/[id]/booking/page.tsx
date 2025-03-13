/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { getCarById, getCarAvailability } from "@/actions/carActions"
import { bookCar } from "@/actions/bookingCars"
import { Button } from "@/components/ui/button"
import { DateRange } from "react-day-picker"
import { DatePicker } from "@/components/ui/date-picker"
import { toast } from "sonner"
import * as React from "react"
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
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { useSession } from "@/auth-client"
import { Loader2 } from "lucide-react"

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

type BookingFormValues = z.infer<typeof bookingFormSchema>

interface BookingPageProps {
  params: Promise<{
    id: string
  }>
}

export default function BookingPage({ params }: BookingPageProps) {
  const unwrappedParams = React.use(params)
  const carId = parseInt(unwrappedParams.id)

  const router = useRouter()
  const [car, setCar] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookedDateRanges, setBookedDateRanges] = useState<
    Array<{
      startDate: Date
      endDate: Date
      bookingId: number
    }>
  >([])

  const totalDays = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return 0
    return (
      Math.ceil(
        (dateRange.to.getTime() - dateRange.from.getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1
    )
  }, [dateRange?.from, dateRange?.to])

  const totalPrice = useMemo(() => {
    if (!car || !car.price) return 0
    return parseFloat((totalDays * car.price).toFixed(2))
  }, [car, totalDays])

  const session = useSession()
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      drivingLicense: "",
      agreeToTerms: false,
    },
  })

  useEffect(() => {
    let isMounted = true
    async function loadCarAndAvailability() {
      try {
        setLoading(true)
        const [carResult, availabilityResult] = await Promise.all([
          getCarById(carId),
          getCarAvailability(carId),
        ])

        if (isMounted) {
          setCar(carResult.car)
          if (
            availabilityResult.success &&
            availabilityResult.bookedDateRanges
          ) {
            setBookedDateRanges(availabilityResult.bookedDateRanges)
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
  }, [carId])

  const hasDateOverlap = useCallback(
    (selectedRange: DateRange) => {
      if (!selectedRange.from || !selectedRange.to) return false
      return bookedDateRanges.some((booked) => {
        const bookedStart = booked.startDate.getTime()
        const bookedEnd = booked.endDate.getTime()
        const selectedStart = selectedRange.from!.getTime()
        const selectedEnd = selectedRange.to!.getTime()
        return selectedStart <= bookedEnd && selectedEnd >= bookedStart
      })
    },
    [bookedDateRanges]
  )

  const onSubmit = useCallback(
    async (data: BookingFormValues) => {
      const userId = session.data?.user?.id
      if (!userId) {
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
        const result = await bookCar({
          carId,
          userId,
          startDate: dateRange.from,
          endDate: dateRange.to,
          totalPrice,
          customerInfo: data,
        })

        if (result.success && result.booking?.paymentLink) {
          // If we have a payment link from Flouci or similar payment processor
          if (result.booking.paymentLink.includes("http")) {
            window.location.href = result.booking.paymentLink
          } else {
            // For testing or if payment is handled differently
            // Build success URL with all necessary booking information
            const successUrl = new URL(
              "/cars/payment/success",
              window.location.origin
            )

            // Add booking and car details
            successUrl.searchParams.append(
              "bookingId",
              result.booking.id.toString()
            )
            successUrl.searchParams.append("carBrand", car.brand)
            successUrl.searchParams.append("carModel", car.model)
            successUrl.searchParams.append("plateNumber", car.plateNumber)
            successUrl.searchParams.append(
              "startDate",
              dateRange.from.toISOString()
            )
            successUrl.searchParams.append(
              "endDate",
              dateRange.to.toISOString()
            )
            successUrl.searchParams.append("totalPrice", totalPrice.toString())

            // Add customer information
            successUrl.searchParams.append("fullName", data.fullName)
            successUrl.searchParams.append("email", data.email)
            successUrl.searchParams.append("phone", data.phone)
            successUrl.searchParams.append("address", data.address)
            successUrl.searchParams.append(
              "drivingLicense",
              data.drivingLicense
            )

            window.location.href = successUrl.toString()
          }
        } else {
          toast.error("Failed to generate payment link")
        }
      } catch (error) {
        console.error("Booking error:", error)
        toast.error("Payment initiation failed")
      } finally {
        setIsSubmitting(false)
      }
    },
    [carId, dateRange, totalPrice, session, hasDateOverlap, car]
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Car Details</h2>
            <div className="relative h-48 w-full rounded-lg overflow-hidden mb-4">
              <Image
                src={car.images?.[0] || "/assets/Car.png"}
                alt={`${car.brand} ${car.model}`}
                fill
                className="object-cover"
              />
            </div>
            <h3 className="text-lg font-semibold">
              {car.brand} {car.model}
            </h3>
            <p className="text-gray-500 mb-4">
              {car.year} • {car.color}
            </p>
            <Separator className="my-4" />
            <div className="mb-4 date-picker-container">
              <h4 className="font-medium text-gray-700 mb-2">Rental Period</h4>
              <DatePicker
                dateRange={dateRange}
                setDateRange={setDateRange} // Simplified to match old code
                disabledDateRanges={bookedDateRanges}
                className="border-2 border-gray-200"
              />
              {!dateRange && (
                <p className="text-sm text-blue-600 mt-2">
                  Please select your rental dates
                </p>
              )}
            </div>
            <Separator className="my-4" />
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Price per day</span>
                <span>${car.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Days</span>
                <span>{dateRange ? `${totalDays} days` : "Select dates"}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Insurance</span>
                <span>Included</span>
              </div>
              <div className="flex justify-between font-bold text-lg mt-4">
                <span>Total</span>
                <span>{dateRange ? `$${totalPrice.toFixed(2)}` : "TBD"}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold mb-6">Personal Information</h2>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          <Input
                            placeholder="john.doe@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          By agreeing, you confirm you&apos;ve read our terms,
                          including the cancellation policy.
                        </FormDescription>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Pay with Flouci"
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
}
