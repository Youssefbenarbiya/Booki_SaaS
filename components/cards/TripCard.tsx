/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Heart, MapPin, Star, Users } from "lucide-react"
import { useFavorite } from "@/lib/hooks/useFavorite"
import { useCurrency } from "@/lib/contexts/CurrencyContext"
import { formatPrice } from "@/lib/utils"

interface TripCardProps {
  trip: any
}

export default function TripCard({ trip }: TripCardProps) {
  const { isFavorite, toggleFavorite, isLoading: favoriteLoading } = useFavorite(trip.id, "trip")
  const { currency, convertPrice, isLoading: currencyLoading } = useCurrency()

  // Format dates
  const startDate = trip.startDate
    ? new Date(trip.startDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null

  const endDate = trip.endDate
    ? new Date(trip.endDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null

  // Calculate duration if not provided
  const duration =
    trip.duration ||
    (trip.startDate && trip.endDate
      ? Math.ceil(
          (new Date(trip.endDate).getTime() -
            new Date(trip.startDate).getTime()) /
            (1000 * 3600 * 24)
        )
      : null)

  // Get primary image
  const primaryImage =
    trip.images && trip.images.length > 0
      ? trip.images[0].imageUrl || trip.images[0]
      : "/placeholder-trip.jpg"

  // Handle price display logic
  const hasDiscount = trip.discountPercentage !== null
  const originalPrice = parseFloat(trip.originalPrice.toString())
  const discountedPrice = hasDiscount
    ? parseFloat(trip.priceAfterDiscount?.toString() || "0")
    : null
  const tripCurrency = trip.currency || "USD"
  
  // Convert prices to current selected currency
  const convertedOriginalPrice = convertPrice(originalPrice, tripCurrency)
  const convertedDiscountedPrice = hasDiscount 
    ? convertPrice(discountedPrice || originalPrice, tripCurrency) 
    : null

  return (
    <Card className="overflow-hidden group transition-all duration-300 hover:shadow-lg h-full flex flex-col">
      <div className="relative aspect-video overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />

        {/* Trip image */}
        <Image
          src={primaryImage}
          alt={trip.name || trip.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Favorite button */}
        <button
          onClick={(e) => {
            e.preventDefault()
            toggleFavorite()
          }}
          disabled={favoriteLoading}
          className="absolute top-3 left-3 z-20 bg-black/30 p-2 rounded-full hover:bg-black/50 transition-colors"
        >
          <Heart
            className={`h-5 w-5 ${
              isFavorite ? "fill-red-500 text-red-500" : "text-white"
            }`}
          />
        </button>

        {/* Price badge */}
        <div className="absolute top-3 right-3 z-20">
          <Badge className="bg-white text-black font-semibold px-3 py-1 flex flex-col items-end">
            {/* Display price with or without discount */}
            {hasDiscount ? (
              <>
                <span className="line-through text-gray-500 text-xs">
                  {formatPrice(convertedOriginalPrice, { currency })}
                </span>
                <span className="text-green-600 text-sm">
                  {formatPrice(convertedDiscountedPrice || convertedOriginalPrice, { currency })}
                </span>
              </>
            ) : (
              <span className="text-sm">
                {formatPrice(convertedOriginalPrice, { currency })}
              </span>
            )}
          </Badge>
        </div>

        {/* Destination badge */}
        <div className="absolute bottom-3 left-3 z-20">
          <div className="flex items-center space-x-1 bg-black/40 backdrop-blur-sm text-white px-2 py-1 rounded-md">
            <MapPin className="h-3 w-3" />
            <span className="text-xs font-medium truncate max-w-[150px]">
              {trip.destination}
            </span>
          </div>
        </div>

        {/* Rating badge */}
        {trip.rating && (
          <div className="absolute bottom-3 right-3 z-20">
            <div className="flex items-center space-x-1 bg-amber-500/90 text-white px-2 py-1 rounded-md">
              <Star className="h-3 w-3 fill-white" />
              <span className="text-xs font-medium">
                {trip.rating.toFixed(1)}
              </span>
            </div>
          </div>
        )}
      </div>

      <CardContent className="flex-grow p-4">
        <h3 className="font-semibold text-lg line-clamp-1 mb-1">
          {trip.name || trip.title}
        </h3>

        {/* Trip features */}
        <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-muted-foreground mt-2 mb-3">
          {duration && (
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{duration} days</span>
            </div>
          )}

          {startDate && (
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>
                {startDate}
                {endDate ? ` - ${endDate}` : ""}
              </span>
            </div>
          )}

          {trip.capacity && (
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <span>{trip.capacity} spots</span>
            </div>
          )}
        </div>

        <p className="text-muted-foreground text-sm line-clamp-2">
          {trip.description}
        </p>

        {/* Activities preview */}
        {trip.activities && trip.activities.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {trip.activities.slice(0, 2).map((activity: any) => (
              <Badge key={activity.id} variant="outline" className="text-xs">
                {activity.activityName}
              </Badge>
            ))}
            {trip.activities.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{trip.activities.length - 2} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 mt-auto">
        <Link href={`/trips/${trip.id}`} className="w-full">
          <Button
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded transition-all duration-300"
            variant="default"
          >
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
