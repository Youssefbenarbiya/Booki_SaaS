import { auth } from "@/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getBookingsByUserId } from "@/actions/bookingActions"
import Image from "next/image"
import Link from "next/link"
import { formatPrice } from "@/lib/utils"

export default async function UserBookingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/auth/signin")
  }

  const bookings = await getBookingsByUserId(session.user.id)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">You haven't made any bookings yet.</p>
          <Link href="/" className="btn btn-primary">
            Browse Trips
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking) => (
            <div key={booking.id} className="card bg-base-100 shadow-lg">
              {booking.trip.images[0] && (
                <figure className="relative h-48">
                  <Image
                    src={booking.trip.images[0].imageUrl}
                    alt={booking.trip.name}
                    fill
                    className="object-cover"
                  />
                </figure>
              )}
              <div className="card-body">
                <h2 className="card-title">{booking.trip.name}</h2>
                <p className="text-sm text-gray-600">
                  {booking.trip.destination}
                </p>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Dates:</span>{" "}
                    {new Date(booking.trip.startDate).toLocaleDateString()} -{" "}
                    {new Date(booking.trip.endDate).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-medium">Seats:</span>{" "}
                    {booking.seatsBooked}
                  </p>
                  <p>
                    <span className="font-medium">Total Price:</span>{" "}
                    {formatPrice(booking.seatsBooked * booking.trip.price)}
                  </p>
                  <p>
                    <span className="font-medium">Status:</span>{" "}
                    <span className={`badge ${
                      booking.status === "confirmed" 
                        ? "badge-success" 
                        : booking.status === "pending"
                        ? "badge-warning"
                        : "badge-error"
                    }`}>
                      {booking.status}
                    </span>
                  </p>
                </div>
                <div className="card-actions justify-end mt-4">
                  <Link
                    href={`/trips/${booking.trip.id}`}
                    className="btn btn-outline btn-sm"
                  >
                    View Trip
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 