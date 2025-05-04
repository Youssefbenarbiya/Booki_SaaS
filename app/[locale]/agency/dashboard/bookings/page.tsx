/* eslint-disable @typescript-eslint/no-unused-vars */
import { BookingsList } from "@/components/bookings/BookingsList"
import { getAllBookings } from "@/actions/bookings"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"


export default async function AgencyBookingsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  
const {locale} = await params


  try {
    // Fetch all customer bookings for this agency's offerings
    const [tripBookings, hotelBookings, carBookings] = await Promise.all([
      getAllBookings("trip").catch((error) => {
        console.error("Error fetching trip bookings:", error)
        return []
      }),
      getAllBookings("hotel").catch((error) => {
        console.error("Error fetching hotel bookings:", error)
        return []
      }),
      getAllBookings("car").catch((error) => {
        console.error("Error fetching car bookings:", error)
        return []
      }),
    ])

    console.log("Retrieved bookings data:", {
      tripBookings: tripBookings?.length || 0,
      hotelBookings: hotelBookings?.length || 0,
      carBookings: carBookings?.length || 0,
    })

    return (
      <div className="container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Customer Bookings</h1>
          <p className="text-muted-foreground">
            View and manage all customer bookings for your agency&apos;s trips,
            hotels, and car rentals
          </p>
        </div>

        <Suspense fallback={<BookingsListSkeleton />}>
          <BookingsList
            tripBookings={tripBookings || []}
            hotelBookings={hotelBookings || []}
            carBookings={carBookings || []}
          />
        </Suspense>
      </div>
    )
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return (
      <div className="container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Customer Bookings</h1>
          <p className="text-muted-foreground">
            View and manage all customer bookings for your agency&apos;s trips,
            hotels, and car rentals
          </p>
        </div>
        <div className="p-8 text-center">
          <p className="text-red-500">
            Failed to load customer bookings. Please try again later.
          </p>
        </div>
      </div>
    )
  }
}

function BookingsListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="border rounded-lg p-4">
        <div className="space-y-3">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Skeleton className="h-48 w-full" />
            <div className="col-span-3 space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-32" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border rounded-lg p-4">
        <div className="space-y-3">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Skeleton className="h-48 w-full" />
            <div className="col-span-3 space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-32" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
