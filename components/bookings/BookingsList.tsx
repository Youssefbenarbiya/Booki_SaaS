/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  Clock,
  MapPin,
  Car,
  Home,
  Plane,
  AlertCircle,
} from "lucide-react"
import { cancelBooking, BookingType } from "@/actions/bookings"
import { format } from "date-fns"
import Image from "next/image"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useParams } from "next/navigation"
import { Locale } from "@/i18n/routing"

interface BookingsListProps {
  carBookings: any[]
  tripBookings: any[]
  hotelBookings: any[]
  locale?: Locale
}

export function BookingsList({
  carBookings,
  tripBookings,
  hotelBookings,
  locale,
}: BookingsListProps) {
  const params = useParams()
  const currentLocale = locale || (params.locale as Locale) || "en"
  const [activeTab, setActiveTab] = useState<BookingType>("trip")
  const [isLoading, setIsLoading] = useState<number | null>(null)
  const { toast } = useToast()

  const handleCancelBooking = async (type: BookingType, id: number) => {
    try {
      setIsLoading(id)
      const result = await cancelBooking(type, id)
      toast({
        title: "Success",
        description: result.message,
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to cancel booking",
        variant: "destructive",
      })
    } finally {
      setIsLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      {
        variant: "default" | "secondary" | "destructive" | "outline" | "success"
        icon: React.ReactNode
      }
    > = {
      pending: { variant: "outline", icon: <Clock className="h-3 w-3 mr-1" /> },
      confirmed: { variant: "default", icon: null },
      completed: { variant: "success", icon: null },
      cancelled: {
        variant: "destructive",
        icon: <AlertCircle className="h-3 w-3 mr-1" />,
      },
    }

    const { variant, icon } = statusMap[status?.toLowerCase()] || {
      variant: "outline",
      icon: null,
    }

    return (
      <Badge variant={variant as any} className="flex items-center">
        {icon}
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown"}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs
        defaultValue="trip"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as BookingType)}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trip" className="flex items-center gap-2">
            <Plane className="h-4 w-4" />
            Trips
          </TabsTrigger>
          <TabsTrigger value="hotel" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Hotels
          </TabsTrigger>
          <TabsTrigger value="car" className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            Cars
          </TabsTrigger>
        </TabsList>

        {/* Trip Bookings */}
        <TabsContent value="trip" className="space-y-4">
          {!tripBookings || tripBookings.length === 0 ? (
            <EmptyState type="trip" locale={currentLocale} />
          ) : (
            tripBookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative h-48 md:h-full">
                    {booking.trip &&
                    booking.trip.images &&
                    booking.trip.images[0]?.imageUrl ? (
                      <Image
                        src={booking.trip.images[0].imageUrl}
                        alt={booking.trip?.name || "Trip"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Plane className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="p-6 col-span-3">
                    <CardHeader className="p-0 pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">
                            {booking.trip?.name || "Trip"}
                          </CardTitle>
                          <CardDescription className="flex items-center mt-1">
                            <MapPin className="h-4 w-4 mr-1" />{" "}
                            {booking.trip?.destination ||
                              "No destination specified"}
                          </CardDescription>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="p-0 mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">
                          Trip Dates
                        </h4>
                        <p className="text-sm flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {booking.trip?.startDate
                            ? format(new Date(booking.trip.startDate), "PPP")
                            : "N/A"}{" "}
                          -{" "}
                          {booking.trip?.endDate
                            ? format(new Date(booking.trip.endDate), "PPP")
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">
                          Booking Details
                        </h4>
                        <p className="text-sm">
                          Seats: {booking.seatsBooked || 0}
                        </p>
                        <p className="text-sm">
                          Total: ${booking.totalPrice || 0}
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter className="p-0 flex justify-between items-center">
                      <Link
                        href={`/${currentLocale}/agency/dashboard/bookings/trip/${booking.id}`}
                      >
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                      {booking.status !== "cancelled" &&
                        booking.status !== "completed" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={isLoading === booking.id}
                            onClick={() =>
                              handleCancelBooking("trip", booking.id)
                            }
                          >
                            {isLoading === booking.id
                              ? "Cancelling..."
                              : "Cancel Booking"}
                          </Button>
                        )}
                    </CardFooter>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Hotel Bookings */}
        <TabsContent value="hotel" className="space-y-4">
          {!hotelBookings || hotelBookings.length === 0 ? (
            <EmptyState type="hotel" locale={currentLocale} />
          ) : (
            hotelBookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative h-48 md:h-full">
                    {booking.room?.hotel &&
                    booking.room.hotel.images &&
                    booking.room.hotel.images[0] ? (
                      <Image
                        src={booking.room.hotel.images[0]}
                        alt={booking.room?.hotel?.name || "Hotel"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Home className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="p-6 col-span-3">
                    <CardHeader className="p-0 pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">
                            {booking.room?.hotel?.name || "Hotel"}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {booking.room?.name || "Room"}
                          </CardDescription>
                          <CardDescription className="flex items-center mt-1">
                            <MapPin className="h-4 w-4 mr-1" />{" "}
                            {booking.room?.hotel?.address || "No address"},{" "}
                            {booking.room?.hotel?.city || "No city"}
                          </CardDescription>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="p-0 mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">
                          Stay Dates
                        </h4>
                        <p className="text-sm flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {booking.checkIn
                            ? format(new Date(booking.checkIn), "PPP")
                            : "N/A"}{" "}
                          -{" "}
                          {booking.checkOut
                            ? format(new Date(booking.checkOut), "PPP")
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">
                          Booking Details
                        </h4>
                        <p className="text-sm">
                          Room Type: {booking.room?.roomType || "Standard"}
                        </p>
                        <p className="text-sm">
                          Total: ${booking.totalPrice || 0}
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter className="p-0 flex justify-between items-center">
                      <Link
                        href={`/${currentLocale}/agency/dashboard/bookings/hotel/${booking.id}`}
                      >
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                      {booking.status !== "cancelled" &&
                        booking.status !== "completed" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={isLoading === booking.id}
                            onClick={() =>
                              handleCancelBooking("hotel", booking.id)
                            }
                          >
                            {isLoading === booking.id
                              ? "Cancelling..."
                              : "Cancel Booking"}
                          </Button>
                        )}
                    </CardFooter>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Car Bookings */}
        <TabsContent value="car" className="space-y-4">
          {!carBookings || carBookings.length === 0 ? (
            <EmptyState type="car" locale={currentLocale} />
          ) : (
            carBookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative h-48 md:h-full">
                    {booking.car &&
                    booking.car.images &&
                    booking.car.images[0] ? (
                      <Image
                        src={booking.car.images[0]}
                        alt={`${booking.car?.brand || ""} ${
                          booking.car?.model || ""
                        }`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Car className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="p-6 col-span-3">
                    <CardHeader className="p-0 pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">
                            {booking.car?.brand || ""}{" "}
                            {booking.car?.model || "Car"}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {booking.car?.year || ""}{" "}
                            {booking.car?.year && booking.car?.color ? "•" : ""}{" "}
                            {booking.car?.color || ""}
                          </CardDescription>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="p-0 mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">
                          Rental Period
                        </h4>
                        <p className="text-sm flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {booking.start_date
                            ? format(new Date(booking.start_date), "PPP")
                            : "N/A"}{" "}
                          -{" "}
                          {booking.end_date
                            ? format(new Date(booking.end_date), "PPP")
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">
                          Booking Details
                        </h4>
                        <p className="text-sm">
                          Plate: {booking.car?.plateNumber || "N/A"}
                        </p>
                        <p className="text-sm">
                          Total: $
                          {booking.total_price
                            ? Number(booking.total_price)
                            : 0}
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter className="p-0 flex justify-between items-center">
                      <Link
                        href={`/${currentLocale}/agency/dashboard/bookings/car/${booking.id}`}
                      >
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                      {booking.status !== "cancelled" &&
                        booking.status !== "completed" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={isLoading === booking.id}
                            onClick={() =>
                              handleCancelBooking("car", booking.id)
                            }
                          >
                            {isLoading === booking.id
                              ? "Cancelling..."
                              : "Cancel Booking"}
                          </Button>
                        )}
                    </CardFooter>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface EmptyStateProps {
  type: BookingType
  locale: Locale
}

function EmptyState({ type, locale }: EmptyStateProps) {
  const icons = {
    trip: <Plane className="h-12 w-12 mb-4" />,
    hotel: <Home className="h-12 w-12 mb-4" />,
    car: <Car className="h-12 w-12 mb-4" />,
  }

  const messages = {
    trip: "You haven't booked any trips yet",
    hotel: "You haven't booked any hotel rooms yet",
    car: "You haven't booked any cars yet",
  }

  const links = {
    trip: `/${locale}/trips`,
    hotel: `/${locale}/hotels`,
    car: `/${locale}/cars`,
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        {icons[type]}
        <h3 className="text-xl font-semibold mb-2">{messages[type]}</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Explore our options and book your next adventure
        </p>
        <Link href={links[type]}>
          <Button>
            Browse{" "}
            {type === "trip" ? "Trips" : type === "hotel" ? "Hotels" : "Cars"}
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
