"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TripCard from "@/components/cards/TripCard"
import { HotelCard } from "@/components/cards/HotelCard"
import { Loader2 } from "lucide-react"
import { useSession } from "@/auth-client"
import { getUserFavorites } from "@/actions/users/favorites"
import type { InferSelectModel } from "drizzle-orm"
import { hotel, room, trips } from "@/db/schema"
import { Car, CarCard } from "@/app/[locale]/cars/components/CarCard"

// Define types for state variables
type Trip = InferSelectModel<typeof trips> & {
  images?: Array<{ imageUrl: string } | string>
  activities?: Array<{ id: number; activityName: string }>
}

type Hotel = InferSelectModel<typeof hotel> & {
  rooms: Array<InferSelectModel<typeof room>>
}

export default function FavoritesPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [favoriteTrips, setFavoriteTrips] = useState<Trip[]>([])
  const [favoriteHotels, setFavoriteHotels] = useState<Hotel[]>([])
  const [favoriteCars, setFavoriteCars] = useState<Car[]>([])
  const session = useSession()

  useEffect(() => {
    async function fetchFavorites() {
      if (!session.data?.user) {
        setIsLoading(false)
        return
      }

      try {
        const data = await getUserFavorites()

        // Use type assertions to help TypeScript understand the data structure
        setFavoriteTrips((data.trips || []) as Trip[])
        setFavoriteHotels((data.hotels || []) as Hotel[])

        // Transform car data to match Car type
        const formattedCars = (data.cars || []).map((car) => ({
          ...car,
          originalPrice: Number(car.originalPrice),
          priceAfterDiscount: car.priceAfterDiscount
            ? Number(car.priceAfterDiscount)
            : undefined,
          createdAt: car.createdAt ? car.createdAt.toISOString() : undefined,
          updatedAt: car.updatedAt ? car.updatedAt.toISOString() : undefined,
        }))
        setFavoriteCars(formattedCars as unknown as Car[])
      } catch (error) {
        console.error("Error fetching favorites:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFavorites()
  }, [session.data?.user])

  // Show login message if not authenticated
  if (!session.data?.user) {
    return (
      <div className="container py-6">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-4">My Favorites</h1>
          <p className="text-muted-foreground mb-6">
            Please log in to view your favorites.
          </p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">My Favorites</h1>

      <Tabs defaultValue="trips">
        <TabsList className="mb-8">
          <TabsTrigger value="trips">
            Trips ({favoriteTrips.length})
          </TabsTrigger>
          <TabsTrigger value="hotels">
            Hotels ({favoriteHotels.length})
          </TabsTrigger>
          <TabsTrigger value="cars">Cars ({favoriteCars.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="trips">
          {favoriteTrips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">
              You haven&apos;t added any trips to your favorites yet.
            </p>
          )}
        </TabsContent>

        <TabsContent value="hotels">
          {favoriteHotels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteHotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">
              You haven&apos;t added any hotels to your favorites yet.
            </p>
          )}
        </TabsContent>

        <TabsContent value="cars">
          {favoriteCars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteCars.map((car) => (
                <CarCard key={car.id} car={car} viewMode="grid" />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">
              You haven&apos;t added any cars to your favorites yet.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
