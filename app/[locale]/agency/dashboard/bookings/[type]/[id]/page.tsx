/* eslint-disable @typescript-eslint/no-explicit-any */
import { getBookingDetails } from "@/actions/bookings"
import { headers } from "next/headers"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Clock,
  Car,
  Home,
  Plane,
  User,
  Phone,
  Mail,
  CreditCard,
  AlertCircle,
  MapPin,
  Info,
  CheckCircle,
} from "lucide-react"
import { format } from "date-fns"
import Image from "next/image"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { cancelBooking, completePayment, BookingType } from "@/actions/bookings"

// Update type definitions for different booking types
type CarBooking = {
  status: string
  id: number
  user_id: string
  start_date: Date
  end_date: Date
  total_price: string
  car: {
    brand: string
    model: string
    year: string
    color: string
    images: string[]
    plateNumber: string
    originalPrice: string
    discountPercentage: number
  }
  drivingLicense?: string
  fullName?: string
  phone?: string
  email?: string
  paymentStatus?: string
  paymentMethod?: string
  paymentDate?: Date
  user?: {
    id: string
    name: string
    email: string
    image: string
    phoneNumber?: string
    address?: string
  }
}

type TripBooking = {
  status: string
  id: number
  userId: string
  tripId: number
  seatsBooked: number
  totalPrice: string
  bookingDate: Date | null
  paymentId: string | null
  paymentStatus: string | null
  paymentMethod: string | null
  paymentDate: Date | null
  trip: {
    name: string
    destination: string
    startDate: Date
    endDate: Date
    images: { imageUrl: string }[]
    activities: {
      id: number
      activityName: string
      description: string
      scheduledDate?: Date
    }[]
    originalPrice: string
    discountPercentage: number
  }
  user?: {
    id: string
    name: string
    email: string
    image: string
    phoneNumber?: string
    address?: string
  }
}

type HotelBooking = {
  status: string
  id: number
  userId: string
  checkIn: Date
  checkOut: Date
  totalPrice: string
  paymentStatus?: string
  paymentMethod?: string
  paymentDate?: Date
  room: {
    name: string
    roomType: string
    capacity: number
    pricePerNightAdult: string
    hotel: {
      name: string
      address: string
      city: string
      images: string[]
    }
  }
  user?: {
    id: string
    name: string
    email: string
    image: string
    phoneNumber?: string
    address?: string
  }
}

type Booking = CarBooking | TripBooking | HotelBooking

// Add type guard functions
function isCarBooking(booking: Booking): booking is CarBooking {
  return "car" in booking
}

function isTripBooking(booking: Booking): booking is TripBooking {
  return "trip" in booking
}

function isHotelBooking(booking: Booking): booking is HotelBooking {
  return "room" in booking
}

export default async function BookingDetailsPage({
  params,
}: {
  params: Promise<{ type: string; id: string; locale: string }>
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  const { type: urlType, id: urlId, locale } = await params
  if (!session?.user) {
    redirect(`/${locale}/sign-in`)
  }

  // Normalize the booking type to ensure it matches expected values
  const normalizedType = urlType.toLowerCase() as BookingType

  // Validate booking type
  if (!["car", "hotel", "trip"].includes(normalizedType)) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-2">Invalid Booking Type</h1>
        <p className="text-muted-foreground mb-6">
          The booking type &quot;{urlType}&quot; is not valid. Valid types are: car,
          hotel, trip.
        </p>
        <Link href={`/${locale}/agency/dashboard/bookings`}>
          <Button variant="outline">Back to All Bookings</Button>
        </Link>
      </div>
    )
  }

  const id = parseInt(urlId)

  try {
    const booking = (await getBookingDetails(
      normalizedType,
      id
    )) as unknown as Booking

    const handleCancelBooking = async () => {
      "use server"

      await cancelBooking(normalizedType, id)
      redirect(`/${locale}/agency/dashboard/bookings`)
    }
    
    const handleCompletePayment = async () => {
      "use server"
      
      await completePayment(normalizedType, id)
      redirect(`/${locale}/agency/dashboard/bookings/${urlType}/${urlId}`)
    }

    // Extract user info from the booking
    const user = booking.user
    const userEmail = isCarBooking(booking)
      ? booking.email || user?.email
      : user?.email
    const userName = isCarBooking(booking)
      ? booking.fullName || user?.name
      : user?.name
    const userPhone = isCarBooking(booking)
      ? booking.phone || user?.phoneNumber
      : user?.phoneNumber
      
    // Check if this is a partial payment (advance payment)
    const isPartialPayment = booking.status === "partially_paid" || 
      (isCarBooking(booking) && booking.paymentMethod?.includes("ADVANCE")) ||
      (isTripBooking(booking) && booking.paymentMethod?.includes("ADVANCE"))

    return (
      <div className="container py-10">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {isCarBooking(booking)
                  ? "Car Rental Details"
                  : isTripBooking(booking)
                  ? "Trip Booking Details"
                  : "Hotel Booking Details"}
              </h1>
              <p className="text-muted-foreground">
                Booking reference: #{booking.id}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href={`/${locale}/agency/dashboard/bookings`}>
                <Button variant="outline">Back to All Bookings</Button>
              </Link>
              {booking.status !== "cancelled" &&
                booking.status !== "completed" && (
                  <form action={handleCancelBooking}>
                    <Button variant="destructive" type="submit">
                      Cancel Booking
                    </Button>
                  </form>
                )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Profile</CardTitle>
                <CardDescription>
                  Information about the customer who made this booking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    {user?.image ? (
                      <Image
                        src={user.image}
                        alt={userName || "Customer"}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <User className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div className="space-y-3 flex-1">
                    <div>
                      <h3 className="font-medium text-lg">
                        {userName || "Customer name not provided"}
                      </h3>
                      <div className="flex flex-col gap-2 mt-3">
                        {userEmail && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{userEmail}</span>
                          </div>
                        )}
                        {userPhone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{userPhone}</span>
                          </div>
                        )}
                        {user?.address && (
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                            <span className="text-sm">{user.address}</span>
                          </div>
                        )}
                        {isCarBooking(booking) && booking.drivingLicense && (
                          <div className="flex items-center gap-2">
                            <Info className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">
                              Driving License: {booking.drivingLicense}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Booking Information */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>
                    {isCarBooking(booking)
                      ? `${booking.car.brand} ${booking.car.model}`
                      : isTripBooking(booking)
                      ? booking.trip.name
                      : isHotelBooking(booking)
                      ? booking.room.hotel.name
                      : ""}
                  </CardTitle>
                  <StatusBadge status={booking.status} />
                </div>
                <CardDescription>
                  {isCarBooking(booking)
                    ? `${booking.car.year} • ${booking.car.color}`
                    : isTripBooking(booking)
                    ? `Destination: ${booking.trip.destination}`
                    : isHotelBooking(booking)
                    ? `${booking.room.name} • ${booking.room.hotel.address}, ${booking.room.hotel.city}`
                    : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="relative aspect-video overflow-hidden rounded-md">
                  {isCarBooking(booking) && booking.car.images?.[0] ? (
                    <Image
                      src={booking.car.images[0]}
                      alt={`${booking.car.brand} ${booking.car.model}`}
                      fill
                      className="object-cover"
                    />
                  ) : isTripBooking(booking) &&
                    booking.trip.images?.[0]?.imageUrl ? (
                    <Image
                      src={booking.trip.images[0].imageUrl}
                      alt={booking.trip.name}
                      fill
                      className="object-cover"
                    />
                  ) : isHotelBooking(booking) &&
                    booking.room.hotel.images?.[0] ? (
                    <Image
                      src={booking.room.hotel.images[0]}
                      alt={booking.room.hotel.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      {isCarBooking(booking) ? (
                        <Car className="h-12 w-12 text-muted-foreground" />
                      ) : isTripBooking(booking) ? (
                        <Plane className="h-12 w-12 text-muted-foreground" />
                      ) : (
                        <Home className="h-12 w-12 text-muted-foreground" />
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Booking Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailsItem
                      icon={<Calendar className="h-4 w-4" />}
                      label={
                        isCarBooking(booking)
                          ? "Rental Period"
                          : isTripBooking(booking)
                          ? "Trip Dates"
                          : "Stay Dates"
                      }
                      value={
                        isCarBooking(booking)
                          ? `${format(
                              new Date(booking.start_date),
                              "PPP"
                            )} - ${format(new Date(booking.end_date), "PPP")}`
                          : isTripBooking(booking)
                          ? `${format(
                              new Date(booking.trip.startDate),
                              "PPP"
                            )} - ${format(
                              new Date(booking.trip.endDate),
                              "PPP"
                            )}`
                          : `${format(
                              new Date(booking.checkIn),
                              "PPP"
                            )} - ${format(new Date(booking.checkOut), "PPP")}`
                      }
                    />

                    <DetailsItem
                      icon={<CreditCard className="h-4 w-4" />}
                      label="Payment Status"
                      value={booking.paymentStatus || "pending"}
                    />

                    {isCarBooking(booking) && (
                      <>
                        <DetailsItem
                          icon={<Car className="h-4 w-4" />}
                          label="Plate Number"
                          value={booking.car.plateNumber}
                        />
                      </>
                    )}

                    {isTripBooking(booking) && (
                      <>
                        <DetailsItem
                          icon={<User className="h-4 w-4" />}
                          label="Seats Booked"
                          value={booking.seatsBooked}
                        />
                      </>
                    )}

                    {isHotelBooking(booking) && (
                      <>
                        <DetailsItem
                          icon={<Home className="h-4 w-4" />}
                          label="Room Type"
                          value={booking.room.roomType}
                        />
                        <DetailsItem
                          icon={<User className="h-4 w-4" />}
                          label="Capacity"
                          value={`${booking.room.capacity} people`}
                        />
                      </>
                    )}
                  </div>
                </div>

                {isTripBooking(booking) &&
                  booking.trip.activities &&
                  booking.trip.activities.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        Trip Activities
                      </h3>
                      <div className="space-y-3">
                        {booking.trip.activities.map((activity) => (
                          <div
                            key={activity.id}
                            className="bg-muted p-3 rounded-md"
                          >
                            <h4 className="font-medium">
                              {activity.activityName}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {activity.description}
                            </p>
                            {activity.scheduledDate && (
                              <p className="text-sm flex items-center mt-1">
                                <Calendar className="h-3 w-3 mr-1" />
                                {format(
                                  new Date(activity.scheduledDate),
                                  "PPP"
                                )}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>
          </div>

          {/* Payment Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isCarBooking(booking) && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Car Rental
                        </span>
                        <span>
                          ${Number(booking.car.originalPrice).toFixed(2)}
                        </span>
                      </div>
                      {booking.car.discountPercentage > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>
                            Discount ({booking.car.discountPercentage}%)
                          </span>
                          <span>
                            -$
                            {(
                              Number(booking.car.originalPrice) *
                              (booking.car.discountPercentage / 100)
                            ).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  {isTripBooking(booking) && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Trip Cost (per seat)
                        </span>
                        <span>
                          ${Number(booking.trip.originalPrice).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Seats</span>
                        <span>x {booking.seatsBooked}</span>
                      </div>
                      {booking.trip.discountPercentage > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>
                            Discount ({booking.trip.discountPercentage}%)
                          </span>
                          <span>
                            -$
                            {(
                              Number(booking.trip.originalPrice) *
                              booking.seatsBooked *
                              (booking.trip.discountPercentage / 100)
                            ).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  {isHotelBooking(booking) && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Room Rate (per night/adult)
                        </span>
                        <span>
                          ${Number(booking.room.pricePerNightAdult).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Nights</span>
                        <span>
                          {Math.ceil(
                            (new Date(booking.checkOut).getTime() -
                              new Date(booking.checkIn).getTime()) /
                              (1000 * 3600 * 24)
                          )}
                        </span>
                      </div>
                    </>
                  )}

                  <Separator />

                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>
                      $
                      {isCarBooking(booking)
                        ? Number(booking.total_price).toFixed(2)
                        : Number(booking.totalPrice).toFixed(2)}
                    </span>
                  </div>
                  
                  {/* Display advance payment information */}
                  {isPartialPayment && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                      <h4 className="font-medium text-amber-800 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Advance Payment Only
                      </h4>
                      <p className="text-sm text-amber-700 mt-1">
                        Customer has made an advance payment. The remaining balance 
                        needs to be collected in cash upon arrival.
                      </p>
                      
                      {/* Calculate remaining amount based on payment method info */}
                      {booking.paymentMethod && (
                        <div className="mt-3 space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Paid online:</span>
                            <span className="font-medium">
                              ${isCarBooking(booking) 
                                ? (Number(booking.total_price) * 0.3).toFixed(2) 
                                : (Number(booking.totalPrice) * 0.3).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between text-amber-800">
                            <span>Remaining to collect:</span>
                            <span className="font-medium">
                              ${isCarBooking(booking) 
                                ? (Number(booking.total_price) * 0.7).toFixed(2) 
                                : (Number(booking.totalPrice) * 0.7).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* Button to mark payment as complete */}
                      <form action={handleCompletePayment} className="mt-3">
                        <Button 
                          type="submit" 
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Payment Complete
                        </Button>
                      </form>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-start">
                <div className="text-sm text-muted-foreground w-full">
                  <p>
                    Payment Method: {booking.paymentMethod || "Not specified"}
                  </p>
                  <p>
                    Payment Date:{" "}
                    {booking.paymentDate
                      ? format(new Date(booking.paymentDate), "PPP")
                      : "Not paid yet"}
                  </p>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error(`Error fetching ${normalizedType} booking details:`, error)
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-2">Booking Not Found</h1>
        <p className="text-muted-foreground mb-6">
          We couldn&apos;t find the booking details you&apos;re looking for. It may have
          been deleted or you may not have permission to view it.
        </p>
        <Link href={`/${locale}/agency/dashboard/bookings`}>
          <Button variant="outline">Back to All Bookings</Button>
        </Link>
      </div>
    )
  }
}

function StatusBadge({ status }: { status: string }) {
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
    partially_paid: {
      variant: "secondary",
      icon: <AlertCircle className="h-3 w-3 mr-1" />,
    },
  }

  const { variant, icon } = statusMap[status.toLowerCase()] || {
    variant: "outline",
    icon: null,
  }

  return (
    <Badge variant={variant as any} className="flex items-center">
      {icon}
      {status === "partially_paid" ? "Partially Paid" : status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

function DetailsItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-sm">{value}</p>
      </div>
    </div>
  )
}
