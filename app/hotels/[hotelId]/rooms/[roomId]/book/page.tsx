import { auth } from "@/auth"
import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"
import BookRoomForm from "./BookRoomForm"
import { getRoomById } from "@/actions/hotelActions"
import { formatPrice } from "@/lib/utils"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"

export default async function BookRoomPage({
  params,
}: {
  params: Promise<{ roomId: string; hotelId: string }>
}) {
  const { roomId, hotelId } = await params
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/auth/signin")
  }

  const room = await getRoomById(roomId)

  if (!room) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/hotels/${hotelId}`}
          className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to hotel
        </Link>
      </div>

      <h1 className="text-2xl font-semibold mb-8">Book Your Room</h1>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Room Summary */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Room Summary</h2>

          {room.images && room.images.length > 0 && (
            <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
              <Image
                src={room.images[0] || "/placeholder.svg"}
                alt={room.name}
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="space-y-3">
            <p className="flex justify-between">
              <span className="font-medium text-gray-700">Room:</span>
              <span>{room.name}</span>
            </p>
            <p className="flex justify-between">
              <span className="font-medium text-gray-700">Hotel:</span>
              <span>{room.hotel.name}</span>
            </p>
            <p className="flex justify-between">
              <span className="font-medium text-gray-700">Type:</span>
              <span>{room.roomType}</span>
            </p>
            <p className="flex justify-between">
              <span className="font-medium text-gray-700">Capacity:</span>
              <span>{room.capacity} guests</span>
            </p>
            <p className="flex justify-between">
              <span className="font-medium text-gray-700">
                Price per Night:
              </span>
              <span className="font-semibold text-black">
                {formatPrice(room.pricePerNight)}
              </span>
            </p>
          </div>
        </div>

        {/* Booking Form */}
        <BookRoomForm
          roomId={room.id}
          pricePerNight={Number.parseFloat(room.pricePerNight)}
          userId={session.user.id}
        />
      </div>
    </div>
  )
}
