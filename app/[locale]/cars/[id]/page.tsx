/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { getCarById, getPublicCarById } from "@/actions/cars/carActions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatPrice } from "@/lib/utils"
import {
  Calendar,
  CarFront,
  CircleDollarSign,
  MapPin,
  Settings,
  Users,
  CheckCircle2,
  Tag,
  Key,
  Clock,
  BusFront,
  LogIn,
  AlertCircle,
} from "lucide-react"
import AgencyInfo from "@/components/common/AgencyInfo"
import { ContactButton } from "@/components/chat/ContactButton"
import React from "react"
import { useRouter } from "next/navigation"
import { useCurrency } from "@/lib/contexts/CurrencyContext"

export default function CarDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>
}) {
  // Use React.use to unwrap the promise instead of await
  const { id, locale } = React.use(params)
  const carId = Number.parseInt(id, 10)
  const [car, setCar] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const { currency, convertPrice } = useCurrency()
  const router = useRouter()

  // Handle scrolling issue when sending a message
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter" && chatContainerRef.current) {
        e.preventDefault()
        // Prevent automatic scrolling
        setTimeout(() => {
          window.scrollTo({
            top: window.scrollY,
            behavior: "auto",
          })
        }, 0)
      }
    }

    document.addEventListener("keydown", handleKeyPress)
    return () => {
      document.removeEventListener("keydown", handleKeyPress)
    }
  }, [])

  // Fetch car data and user session
  useEffect(() => {
    const fetchData = async () => {
      try {
        // First try using the public endpoint that doesn't require authentication
        const response = await getPublicCarById(carId)
        setCar(response.car)
        setError(null)
      } catch (publicError) {
        console.error("Error fetching public car data:", publicError)

        // If public fetch fails, try the authenticated endpoint as a fallback
        try {
          const authenticatedResponse = await getCarById(carId)
          setCar(authenticatedResponse.car)
          setError(null)
        } catch (authError) {
          console.error("Error fetching authenticated car data:", authError)
          setError("Some features may be limited. Sign in for full access.")

          // Check if we got any partial data
          try {
            if (
              publicError instanceof Error &&
              "data" in (publicError as any)
            ) {
              const partialData = (publicError as any).data?.car
              if (partialData) {
                setCar(partialData)
              }
            }
          } catch (e) {
            // Ignore additional errors in the error handler
          }
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [carId])

  const handleSignIn = () => {
    router.push(
      `/${locale}/signin?callbackUrl=${encodeURIComponent(`/${locale}/cars/${id}`)}`
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!car && error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Car Details Unavailable</h1>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          We couldn&apos;t load the details for this car. Please sign in to view
          this information.
        </p>
        <Button onClick={handleSignIn} className="flex items-center">
          <LogIn className="h-4 w-4 mr-2" /> Sign In to Continue
        </Button>
      </div>
    )
  }

  if (!car) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AlertCircle className="h-16 w-16 text-amber-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Car Not Found</h1>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          The car you&apos;re looking for could not be found or may have been
          removed.
        </p>
        <Button asChild>
          <Link href={`/${locale}/cars`}>Browse Other Cars</Link>
        </Button>
      </div>
    )
  }

  const hasDiscount = car.discountPercentage && car.discountPercentage > 0
  const effectivePrice =
    hasDiscount && car.priceAfterDiscount
      ? Number(car.priceAfterDiscount)
      : Number(car.originalPrice)

  // Convert prices to selected currency
  const carCurrency = car.currency || "USD"
  const convertedOriginalPrice = convertPrice(
    Number(car.originalPrice),
    carCurrency
  )
  const convertedEffectivePrice = convertPrice(effectivePrice, carCurrency)

  return (
    <div
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10"
      ref={chatContainerRef}
    >
      {error && (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-800 mb-1">
                  Limited Access
                </h3>
                <p className="text-sm text-amber-700">{error}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t border-amber-200 bg-amber-50/50 flex justify-end pt-4">
            <Button
              variant="outline"
              onClick={handleSignIn}
              size="sm"
              className="text-amber-700 border-amber-300"
            >
              <LogIn className="h-4 w-4 mr-2" /> Sign In
            </Button>
          </CardFooter>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Car Details Section */}
        <div className="lg:col-span-2">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-wrap gap-2 text-sm">
              <Badge variant="outline" className="text-gray-600 bg-gray-50">
                <CarFront className="h-3 w-3 mr-1" />
                {car.brand} {car.model}
              </Badge>
              <Badge variant="outline" className="text-gray-600 bg-gray-50">
                <Calendar className="h-3 w-3 mr-1" />
                {car.year}
              </Badge>
              <Badge variant="outline" className="text-gray-600 bg-gray-50">
                <Settings className="h-3 w-3 mr-1" />
                {car.color}
              </Badge>
              <Badge variant="outline" className="text-gray-600 bg-gray-50">
                <Users className="h-3 w-3 mr-1" />
                {car.seats} seats
              </Badge>
              <Badge variant="outline" className="text-gray-600 bg-gray-50">
                <MapPin className="h-3 w-3 mr-1" />
                {car.location}
              </Badge>
              {car.status && (
                <Badge
                  className={`${car.status === "approved" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {car.status.charAt(0).toUpperCase() + car.status.slice(1)}
                </Badge>
              )}
            </div>

            <h1 className="text-3xl font-bold lg:text-4xl">
              {car.brand} {car.model} ({car.year})
            </h1>

            {/* Agency Info */}
            {car.agency && (
              <AgencyInfo
                agencyName={car.agency?.agencyName || "Car Agency"}
                agencyLogo={car.agency?.logo || null}
                locale={locale}
                showContactButton={!error}
                size="md"
                isVerified={car.agency?.isVerified || false}
              />
            )}

            {/* Improved Image Gallery with Main Image */}
            <div className="mt-4">
              <div className="relative rounded-lg overflow-hidden aspect-[16/9] mb-2">
                {car.images && car.images.length > 0 ? (
                  <Image
                    src={car.images[selectedImageIndex] || "/placeholder.svg"}
                    alt={`${car.brand} ${car.model} - Featured Image`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-all duration-300"
                    priority
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-100">
                    <CarFront className="h-20 w-20 text-gray-400" />
                  </div>
                )}
              </div>
              {car.images && car.images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {car.images
                    .slice(0, 5)
                    .map((image: string, index: number) => (
                      <div
                        key={index}
                        className={`relative rounded-lg overflow-hidden aspect-square cursor-pointer ${
                          index === selectedImageIndex
                            ? "ring-2 ring-primary"
                            : "opacity-80"
                        }`}
                        onClick={() => setSelectedImageIndex(index)}
                      >
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={`${car.brand} ${car.model} - Thumbnail ${index + 1}`}
                          fill
                          sizes="(max-width: 768px) 20vw, 10vw"
                          className="object-cover"
                        />
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Booking Card */}
        <div className="lg:col-span-1">
          <Card className="border border-gray-100 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Rent This Car</CardTitle>
              <CardDescription>
                Experience driving in style and comfort
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div>
                  {hasDiscount ? (
                    <>
                      <div className="text-2xl font-bold text-primary">
                        {formatPrice(convertedEffectivePrice, { currency })}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm line-through text-gray-500">
                          {formatPrice(convertedOriginalPrice, { currency })}
                        </span>
                        <span className="text-sm font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                          {car.discountPercentage}% off
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-2xl font-bold text-primary">
                      {formatPrice(convertedEffectivePrice, { currency })}
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-500">per day</div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium flex items-center">
                    <Key className="h-4 w-4 mr-1 text-gray-500" /> Plate Number
                  </span>
                  <span className="font-mono">{car.plateNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium flex items-center">
                    <Tag className="h-4 w-4 mr-1 text-gray-500" /> Category
                  </span>
                  <span>{car.category}</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-md p-4 mb-4">
                <h3 className="font-semibold mb-2 flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-gray-500" /> Availability
                </h3>
                <Badge
                  className={
                    car.isAvailable
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }
                >
                  {car.isAvailable ? "Available Now" : "Currently Unavailable"}
                </Badge>
              </div>

              <Separator className="my-4" />

              <div className="flex flex-col space-y-3">
                {error ? (
                  <Button onClick={handleSignIn}>
                    <LogIn className="h-4 w-4 mr-2" /> Sign In to Book
                  </Button>
                ) : (
                  <>
                    <Link
                      href={`/${locale}/cars/${car.id}/booking`}
                      className="w-full"
                    >
                      <Button size="lg" className="w-full">
                        Book Now
                      </Button>
                    </Link>

                    {/* Contact Button that opens chat */}
                    <ContactButton
                      postId={id}
                      postType="car"
                      agencyName={car.agency?.agencyName || "Agency"}
                      agencyLogo={car.agency?.logo || undefined}
                    />
                  </>
                )}
              </div>

              <div className="mt-4 text-xs text-gray-500 text-center">
                You won&apos;t be charged yet
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Car Features & Details */}
      <div className="mt-12">
        {/* Car Specifications */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-semibold mb-6" id="about">
              Car Specifications
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              <div className="flex flex-col items-center bg-gray-50 p-4 rounded-lg">
                <div className="p-3 bg-primary/10 rounded-full mb-2">
                  <CarFront className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-gray-600 text-sm">Make & Model</h3>
                <p className="font-medium">
                  {car.brand} {car.model}
                </p>
              </div>

              <div className="flex flex-col items-center bg-gray-50 p-4 rounded-lg">
                <div className="p-3 bg-primary/10 rounded-full mb-2">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-gray-600 text-sm">Year</h3>
                <p className="font-medium">{car.year}</p>
              </div>

              <div className="flex flex-col items-center bg-gray-50 p-4 rounded-lg">
                <div className="p-3 bg-primary/10 rounded-full mb-2">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-gray-600 text-sm">Seats</h3>
                <p className="font-medium">{car.seats}</p>
              </div>

              <div className="flex flex-col items-center bg-gray-50 p-4 rounded-lg">
                <div className="p-3 bg-primary/10 rounded-full mb-2">
                  <CircleDollarSign className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-gray-600 text-sm">Category</h3>
                <p className="font-medium">{car.category}</p>
              </div>

              <div className="flex flex-col items-center bg-gray-50 p-4 rounded-lg">
                <div className="p-3 bg-primary/10 rounded-full mb-2">
                  <Settings className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-gray-600 text-sm">Color</h3>
                <p className="font-medium">{car.color}</p>
              </div>

              <div className="flex flex-col items-center bg-gray-50 p-4 rounded-lg">
                <div className="p-3 bg-primary/10 rounded-full mb-2">
                  <Key className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-gray-600 text-sm">Plate Number</h3>
                <p className="font-medium font-mono">{car.plateNumber}</p>
              </div>

              <div className="flex flex-col items-center bg-gray-50 p-4 rounded-lg">
                <div className="p-3 bg-primary/10 rounded-full mb-2">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-gray-600 text-sm">Location</h3>
                <p className="font-medium">{car.location}</p>
              </div>

              <div className="flex flex-col items-center bg-gray-50 p-4 rounded-lg">
                <div className="p-3 bg-primary/10 rounded-full mb-2">
                  <BusFront className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-gray-600 text-sm">Status</h3>
                <p className="font-medium">{car.status || "Available"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information & Policies */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-semibold mb-4" id="information">
                  Rental Information
                </h2>

                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-medium mb-2 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-primary" />
                    Pickup Location
                  </h3>
                  <p className="text-gray-600 mb-4">
                    This vehicle is available for pickup at {car.location}.
                    Please arrive at the designated time with your booking
                    confirmation and valid driver&apos;s license.
                  </p>
                  <Link
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      car.location
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm">
                      View on map
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">
                      Fuel Policy
                    </h4>
                    <p className="text-sm text-gray-600">
                      Full to Full: You&apos;ll receive the car with a full tank
                      and should return it full.
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">
                      Mileage/Kilometers
                    </h4>
                    <p className="text-sm text-gray-600">
                      Unlimited mileage included in the rental price.
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h4 className="font-medium text-purple-900 mb-2">
                      Insurance
                    </h4>
                    <p className="text-sm text-gray-600">
                      Basic insurance included. Additional coverage options
                      available during booking.
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4">
                    <h4 className="font-medium text-amber-900 mb-2">
                      Required Documents
                    </h4>
                    <p className="text-sm text-gray-600">
                      Valid driver&apos;s license, credit card, and personal ID
                      required.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
            {/* Rental Policies */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-semibold mb-4" id="policies">
                  Rental Policies
                </h2>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 border-l-2 border-primary">
                    <h3 className="font-medium text-gray-900 mb-2">
                      Cancellation Policy
                    </h3>
                    <p className="text-sm text-gray-600">
                      Free cancellation up to 24 hours before pickup.
                      Cancellations made within 24 hours may incur charges.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border-l-2 border-primary">
                    <h3 className="font-medium text-gray-900 mb-2">Payment</h3>
                    <p className="text-sm text-gray-600">
                      Credit card required for reservation. Full payment due at
                      pickup. Security deposit may apply.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border-l-2 border-primary">
                    <h3 className="font-medium text-gray-900 mb-2">
                      Age Requirements
                    </h3>
                    <p className="text-sm text-gray-600">
                      Minimum driver age: 21 years. Drivers under 25 may incur a
                      young driver surcharge.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
