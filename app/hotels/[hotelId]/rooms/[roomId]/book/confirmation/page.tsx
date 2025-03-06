import { auth } from "@/auth"
import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import db from "@/db/drizzle"
import { roomBookings } from "@/db/schema"
import { eq } from "drizzle-orm"
import { formatPrice } from "@/lib/utils"
import { CheckCircle2, ArrowLeft, CalendarRange, Users } from "lucide-react"

export default async function BookingConfirmationPage({
  params,
  searchParams,
}: {
  params: { roomId: string; hotelId: string }
  searchParams: { bookingId?: string }
}) {
  // Check if user is authenticated
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/auth/signin")
  }

  if (!searchParams.bookingId) {
    notFound()
  }

  try {
    // Get the booking with related room and hotel information
    const booking = await db.query.roomBookings.findFirst({
      where: eq(roomBookings.id, parseInt(searchParams.bookingId)),
      with: {
        room: {
          with: {
            hotel: true,
          },
        },
      },
    })

    if (!booking || booking.userId !== session.user.id) {
      notFound()
    }

    // Calculate nights
    const checkInDate = new Date(booking.checkIn)
    const checkOutDate = new Date(booking.checkOut)
    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    // Format dates for display
    const formatDate = (dateString: string) => {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href={`/hotels/${params.hotelId}`}
            className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to hotel
          </Link>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-8 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
            <p className="text-gray-600 mb-8">
              Your booking has been successfully processed. Check the details
              below.
            </p>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Booking Details</h2>
              <div className="space-y-4 text-left">
                <p className="grid grid-cols-2">
                  <span className="font-medium text-gray-700">Booking ID:</span>
                  <span>{booking.id}</span>
                </p>
                <p className="grid grid-cols-2">
                  <span className="font-medium text-gray-700">Hotel:</span>
                  <span>{booking.room.hotel.name}</span>
                </p>
                <p className="grid grid-cols-2">
                  <span className="font-medium text-gray-700">Room:</span>
                  <span>{booking.room.name}</span>
                </p>
                <p className="grid grid-cols-2">
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className="capitalize text-green-600 font-medium">
                    {booking.status}
                  </span>
                </p>
                <div className="pt-4 border-t">
                  <div className="flex items-start mb-3">
                    <CalendarRange className="h-5 w-5 text-gray-500 mr-2" />
                    <div>
                      <p className="font-medium">Stay Period</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(booking.checkIn)} -{" "}
                        {formatDate(booking.checkOut)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {nights} night{nights !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Users className="h-5 w-5 text-gray-500 mr-2" />
                  </div>
                </div>
              </div>
            </div>

            {booking.totalPrice && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Payment Summary</h2>
                <div className="space-y-2">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">
                      Room Rate × {nights} nights
                    </span>
                    <span>{formatPrice(booking.totalPrice)}</span>
                  </div>
                  <div className="border-t pt-2 font-semibold flex justify-between">
                    <span>Total</span>
                    <span className="text-xl">
                      {formatPrice(booking.totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col space-y-4 mt-8">
              <Link
                href="/dashboard/bookings"
                className="bg-yellow-500 text-white px-6 py-3 rounded-md hover:bg-yellow-600 transition-colors"
              >
                View All Bookings
              </Link>
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error loading booking confirmation:", error)
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-red-500">
          Error Loading Booking
        </h1>
        <p>
          There was a problem loading your booking information. Please try again
          later.
        </p>
        <Link
          href="/"
          className="text-blue-500 hover:underline mt-4 inline-block"
        >
          Return to Home
        </Link>
      </div>
    )
  }
}
