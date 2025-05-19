"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from "next/navigation"
import Image from "next/image"
import {
  Clock,
  MapPin,
  Users,
  UtensilsCrossed,
  Wifi,
  Car,
  BedDouble,
  ShieldCheck,
  CalendarDays,
  Baby,
  Timer,
  Tag,
  CheckCircle2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { formatPrice, getDurationInDays } from "@/lib/utils"
import Link from "next/link"
import { getTripById } from "@/actions/trips/tripActions"
import { useCurrency } from "@/lib/contexts/CurrencyContext"
import { useState, useEffect, useRef } from "react"
import React from "react"
import AgencyInfo from "@/components/common/AgencyInfo"
import { ContactButton } from "@/components/chat/ContactButton"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface TripParams {
  tripId: string
  locale: string
}

interface TripPageProps {
  params: Promise<TripParams>
}

export default function TripDetailsPage({ params }: TripPageProps) {
  const { currency, convertPrice } = useCurrency()
  const resolvedParams = React.use(params)
  const { tripId, locale } = resolvedParams
  // Use state to hold the trip data
  const [trip, setTrip] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Fetch trip data
  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const tripData = await getTripById(parseInt(tripId))
        if (!tripData) {
          notFound()
        }
        setTrip(tripData)
      } catch (error) {
        console.error("Error fetching trip:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrip()
  }, [tripId])

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

  if (!trip) {
    notFound()
  }

  const duration = getDurationInDays(trip.startDate, trip.endDate)

  // Group activities by day
  const activitiesByDay: { [key: string]: any[] } = {}

  trip.activities.forEach((activity: any) => {
    if (!activity.scheduledDate) return

    const date = new Date(activity.scheduledDate).toLocaleDateString()
    if (!activitiesByDay[date]) {
      activitiesByDay[date] = []
    }
    activitiesByDay[date].push(activity)
  })

  // Calculate effective price (discounted or original)
  const hasDiscount = trip.discountPercentage && trip.discountPercentage > 0
  const effectivePrice =
    hasDiscount && trip.priceAfterDiscount
      ? Number(trip.priceAfterDiscount)
      : Number(trip.originalPrice)

  // Convert prices to selected currency
  const tripCurrency = trip.currency || "USD"
  const convertedOriginalPrice = convertPrice(
    Number(trip.originalPrice),
    tripCurrency
  )
  const convertedEffectivePrice = convertPrice(effectivePrice, tripCurrency)

  return (
    <div
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10"
      ref={chatContainerRef}
    >
      {/* Hero Section with Improved Design */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-wrap gap-2 text-sm">
              <Badge variant="outline" className="text-gray-600 bg-gray-50">
                <Clock className="h-3 w-3 mr-1" />
                {duration} days
              </Badge>
              <Badge variant="outline" className="text-gray-600 bg-gray-50">
                <MapPin className="h-3 w-3 mr-1" />
                {trip.destination}
              </Badge>
              <Badge variant="outline" className="text-gray-600 bg-gray-50">
                <Users className="h-3 w-3 mr-1" />
                {trip.capacity} spots
              </Badge>
              <Badge variant="outline" className="text-gray-600 bg-gray-50">
                <CalendarDays className="h-3 w-3 mr-1" />
                {new Date(trip.startDate).toLocaleDateString()} -{" "}
                {new Date(trip.endDate).toLocaleDateString()}
              </Badge>
              {trip.status && (
                <Badge
                  className={`${trip.status === "approved" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                </Badge>
              )}
            </div>

            <h1 className="text-3xl font-bold lg:text-4xl">{trip.name}</h1>

            {/* Agency Info */}
            <AgencyInfo
              agencyName={trip.agency?.agencyName || "Trip Agency"}
              agencyLogo={trip.agency?.logo || null}
              locale={locale}
              showContactButton={true}
              size="md"
              isVerified={trip.agency?.isVerified || false}
            />

            {/* Improved Image Gallery with Main Image */}
            <div className="mt-4">
              <div className="relative rounded-lg overflow-hidden aspect-[16/9] mb-2">
                <Image
                  src={
                    trip.images[selectedImageIndex]?.imageUrl ||
                    "/placeholder-image.jpg"
                  }
                  alt={`${trip.name} - Featured Image`}
                  fill
                  className="object-cover transition-all duration-300"
                />
              </div>
              <div className="grid grid-cols-5 gap-2">
                {trip.images.slice(0, 5).map((image: any, index: number) => (
                  <div
                    key={image.id}
                    className={`relative rounded-lg overflow-hidden aspect-square cursor-pointer ${
                      index === selectedImageIndex
                        ? "ring-2 ring-primary"
                        : "opacity-80"
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <Image
                      src={image.imageUrl}
                      alt={`${trip.name} - Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Booking Card */}
        <div className="lg:col-span-1">
          <Card className="border border-gray-100 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Book Your Adventure</CardTitle>
              <CardDescription>
                Experience {trip.destination} like never before
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
                          {trip.discountPercentage}% off
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-2xl font-bold text-primary">
                      {formatPrice(convertedEffectivePrice, { currency })}
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-500">per person</div>
              </div>

              {/* Dates */}
              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium flex items-center">
                    <CalendarDays className="h-4 w-4 mr-1 text-gray-500" />{" "}
                    Start
                  </span>
                  <span>{new Date(trip.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium flex items-center">
                    <CalendarDays className="h-4 w-4 mr-1 text-gray-500" /> End
                  </span>
                  <span>{new Date(trip.endDate).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Available discounts section - New! */}
              {(trip.groupDiscountEnabled ||
                trip.childDiscountEnabled ||
                trip.timeSpecificDiscountEnabled) && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <Tag className="h-4 w-4 mr-1 text-primary" /> Available
                    Discounts
                  </h3>
                  <div className="space-y-2 text-xs">
                    {trip.groupDiscountEnabled && (
                      <div className="flex items-start space-x-2 bg-blue-50 p-2 rounded">
                        <Users className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div>
                          <span className="font-medium">
                            Group Discount: {trip.groupDiscountPercentage}% off
                          </span>
                          <p className="text-gray-600">
                            For groups of {trip.groupDiscountMinPeople}+ people
                          </p>
                        </div>
                      </div>
                    )}
                    {trip.childDiscountEnabled && (
                      <div className="flex items-start space-x-2 bg-purple-50 p-2 rounded">
                        <Baby className="h-4 w-4 text-purple-600 mt-0.5" />
                        <div>
                          <span className="font-medium">
                            Child Discount: {trip.childDiscountPercentage}% off
                          </span>
                          <p className="text-gray-600">
                            Available for children
                          </p>
                        </div>
                      </div>
                    )}
                    {trip.timeSpecificDiscountEnabled && (
                      <div className="flex items-start space-x-2 bg-amber-50 p-2 rounded">
                        <Timer className="h-4 w-4 text-amber-600 mt-0.5" />
                        <div>
                          <span className="font-medium">
                            Time Discount: {trip.timeSpecificDiscountPercentage}
                            % off
                          </span>
                          <p className="text-gray-600">
                            {trip.timeSpecificDiscountStartTime} -{" "}
                            {trip.timeSpecificDiscountEndTime}
                            {trip.timeSpecificDiscountDays &&
                              ` on ${trip.timeSpecificDiscountDays.join(", ")}`}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Separator className="my-4" />

              <div className="flex flex-col space-y-2">
                <Link
                  href={`/${locale}/trips/${tripId}/book`}
                  className="w-full"
                >
                  <Button size="lg" className="w-full">
                    Book Now
                  </Button>
                </Link>

                {/* Contact Button that opens chat */}
                <ContactButton
                  postId={tripId}
                  postType="trip"
                  agencyName={trip.agency?.agencyName || "Agency"}
                  agencyLogo={trip.agency?.logo || null}
                />
              </div>

              <div className="mt-4 text-xs text-gray-500 text-center">
                You won&apos;t be charged yet
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* About This Trip Section */}
      <div className="mt-12">
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-semibold mb-4" id="about">
              About This Trip
            </h2>
            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
              {trip.description}
            </p>

            {/* Features Grid */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">
                What&apos;s Included
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg">
                  <BedDouble className="h-5 w-5 text-primary" />
                  <span className="text-sm">Accommodation</span>
                </div>
                <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg">
                  <UtensilsCrossed className="h-5 w-5 text-primary" />
                  <span className="text-sm">Meals</span>
                </div>
                <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg">
                  <Car className="h-5 w-5 text-primary" />
                  <span className="text-sm">Transportation</span>
                </div>
                <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span className="text-sm">Guided Tours</span>
                </div>
                <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg">
                  <Wifi className="h-5 w-5 text-primary" />
                  <span className="text-sm">Wi-Fi</span>
                </div>
                <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <span className="text-sm">Insurance</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        

        {/* Destination Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-semibold mb-4" id="destination">
                  Destination Information
                </h2>
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-medium mb-2 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-primary" />
                    {trip.destination}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Explore the wonders of {trip.destination} with our carefully
                    planned trip itinerary. This destination offers unique
                    experiences that will create lasting memories.
                  </p>
                  <Link
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      trip.destination
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
                    <h4 className="font-medium text-blue-900 mb-2">Weather</h4>
                    <p className="text-sm text-gray-600">
                      Check the local weather forecast before your trip to pack
                      accordingly.
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">
                      Local Currency
                    </h4>
                    <p className="text-sm text-gray-600">
                      The local currency is {trip.currency || "TND"}. We
                      recommend having some cash on hand.
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h4 className="font-medium text-purple-900 mb-2">
                      Language
                    </h4>
                    <p className="text-sm text-gray-600">
                      The primary language in this region is Arabic and French,
                      but many tourist areas also speak English.
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4">
                    <h4 className="font-medium text-amber-900 mb-2">
                      Time Zone
                    </h4>
                    <p className="text-sm text-gray-600">
                      The local time zone is GMT+1 (Central European Time).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
            {/* Trip Policies */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-semibold mb-4" id="policies">
                  Trip Policies
                </h2>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 border-l-2 border-primary">
                    <h3 className="font-medium text-gray-900 mb-2">
                      Cancellation Policy
                    </h3>
                    <p className="text-sm text-gray-600">
                      Free cancellation up to 30 days before departure.
                      Cancellations made within 30 days may be eligible for
                      partial refund.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border-l-2 border-primary">
                    <h3 className="font-medium text-gray-900 mb-2">Payment</h3>
                    <p className="text-sm text-gray-600">
                      20% deposit required at booking. Full payment due 30 days
                      before departure. We accept credit/debit cards and bank
                      transfers.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border-l-2 border-primary">
                    <h3 className="font-medium text-gray-900 mb-2">
                      Travel Documents
                    </h3>
                    <p className="text-sm text-gray-600">
                      Valid passport required with at least 6 months validity
                      beyond your return date. Check visa requirements for your
                      nationality before booking.
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
