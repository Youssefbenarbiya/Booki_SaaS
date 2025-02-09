import { auth } from "@/auth"
import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"
import BookRoomForm from "./BookRoomForm"
import { getRoomById } from "@/actions/hotelActions"
import { formatPrice } from "@/lib/utils"

export default async function BookRoomPage({
  params,
}: {
  params: { roomId: string }
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/auth/signin")
  }

  const room = await getRoomById(params.roomId)

  if (!room) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Book Your Room</h1>
      <div className="grid gap-8 md:grid-cols-2">
        {/* Room Summary */}
        <div className="card bg-base-100 shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Room Summary</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Room:</span> {room.name}</p>
            <p><span className="font-medium">Hotel:</span> {room.hotel.name}</p>
            <p><span className="font-medium">Type:</span> {room.roomType}</p>
            <p><span className="font-medium">Capacity:</span> {room.capacity} guests</p>
            <p><span className="font-medium">Price per Night:</span> {formatPrice(room.pricePerNight)}</p>
          </div>
        </div>

        {/* Booking Form */}
        <BookRoomForm 
          roomId={room.id}
          pricePerNight={parseFloat(room.pricePerNight)}
          userId={session.user.id}
        />
      </div>
    </div>
  )
} 