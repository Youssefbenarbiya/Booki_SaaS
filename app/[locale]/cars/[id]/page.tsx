import Image from "next/image"
import Link from "next/link"
import { getCarById } from "@/actions/cars/carActions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"
import {
  Calendar,
  CarFront,
  CircleDollarSign,
  MapPin,
  Settings,
  Users,
} from "lucide-react"
import AgencyInfo from "@/components/common/AgencyInfo"
import { ContactButton } from "@/components/chat/ContactButton"
import SignInRedirectMessage from "../../(auth)/sign-in/SignInRedirectMessage"
import { headers } from "next/headers"
import { auth } from "@/auth"

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>
}) {
  const { id, locale } = await params
  const carId = Number.parseInt(id, 10)

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session || !session.user) {
    return (
      <SignInRedirectMessage
        callbackUrl={`/${locale}/sign-in?callbackUrl=/${locale}/cars/${carId}`}
      />
    )
  }

  const response = await getCarById(carId)

  const car = response.car

  // Calculate effective price (discounted or original)
  const hasDiscount = car.discountPercentage && car.discountPercentage > 0
  const effectivePrice =
    hasDiscount && car.priceAfterDiscount
      ? Number(car.priceAfterDiscount)
      : Number(car.originalPrice)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Car Details Section */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {car.brand} {car.model}
            </h1>
            <div className="flex items-center space-x-2 text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{car.location}</span>
            </div>

            {/* Agency Info */}
            <div className="mt-4 mb-6">
              <AgencyInfo
                agencyName={car.agency?.agencyName || "Car Agency"}
                agencyLogo={car.agency?.logo || null}
                locale={locale}
                showContactButton={true}
                size="md"
              />
            </div>
          </div>

          {/* Car Images */}
          {car.images && car.images.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {car.images.map((image, index) => (
                <div
                  key={index}
                  className={`relative ${
                    index === 0 ? "md:col-span-2 h-80" : "h-60"
                  } rounded-lg overflow-hidden w-full`}
                >
                  <div className="flex justify-center items-center">
                    <div className="flex justify-center items-center">
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`${car.brand} ${car.model} - Image ${index + 1}`}
                        width={600}
                        height={350}
                        layout="intrinsic"
                        objectFit="cover"
                        className="rounded-md"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative h-80 rounded-lg overflow-hidden bg-gray-100">
              <div className="flex items-center justify-center h-full">
                <CarFront className="h-20 w-20 text-gray-400" />
              </div>
            </div>
          )}

          {/* Car Specifications */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Car Specifications</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center">
                  <div className="p-3 bg-gray-100 rounded-full mb-2">
                    <CarFront className="h-6 w-6 text-gray-700" />
                  </div>
                  <h3 className="text-gray-600 text-sm">Make & Model</h3>
                  <p className="font-medium">
                    {car.brand} {car.model}
                  </p>
                </div>

                <div className="flex flex-col items-center">
                  <div className="p-3 bg-gray-100 rounded-full mb-2">
                    <Calendar className="h-6 w-6 text-gray-700" />
                  </div>
                  <h3 className="text-gray-600 text-sm">Year</h3>
                  <p className="font-medium">{car.year}</p>
                </div>

                <div className="flex flex-col items-center">
                  <div className="p-3 bg-gray-100 rounded-full mb-2">
                    <Users className="h-6 w-6 text-gray-700" />
                  </div>
                  <h3 className="text-gray-600 text-sm">Seats</h3>
                  <p className="font-medium">{car.seats}</p>
                </div>

                <div className="flex flex-col items-center">
                  <div className="p-3 bg-gray-100 rounded-full mb-2">
                    <CircleDollarSign className="h-6 w-6 text-gray-700" />
                  </div>
                  <h3 className="text-gray-600 text-sm">Category</h3>
                  <p className="font-medium">{car.category}</p>
                </div>

                <div className="flex flex-col items-center">
                  <div className="p-3 bg-gray-100 rounded-full mb-2">
                    <Settings className="h-6 w-6 text-gray-700" />
                  </div>
                  <h3 className="text-gray-600 text-sm">Color</h3>
                  <p className="font-medium">{car.color}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-6 sticky top-24">
            <div className="flex justify-between items-center mb-4">
              <div>
                {hasDiscount ? (
                  <>
                    <div className="text-2xl font-bold text-primary">
                      {formatPrice(effectivePrice, {
                        currency: car.currency || "USD",
                      })}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm line-through text-gray-500">
                        {formatPrice(Number(car.originalPrice), {
                          currency: car.currency || "USD",
                        })}
                      </span>
                      <span className="text-sm font-medium text-green-600">
                        {car.discountPercentage}% off
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-2xl font-bold text-primary">
                    {formatPrice(effectivePrice, {
                      currency: car.currency || "USD",
                    })}
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-500">per day</div>
            </div>

            <div className="bg-gray-50 rounded-md p-4 mb-4">
              <h3 className="font-semibold mb-2">Availability</h3>
              <Badge
                className={
                  car.isAvailable
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }
              >
                {car.isAvailable ? "Available" : "Currently Unavailable"}
              </Badge>
            </div>

            <div className="flex flex-col space-y-3">
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
            </div>

            <div className="mt-4 text-xs text-gray-500 text-center">
              You won&apos;t be charged yet
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
