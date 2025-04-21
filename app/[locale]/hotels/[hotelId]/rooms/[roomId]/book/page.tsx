import { auth } from "@/auth"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import BookRoomForm from "./BookRoomForm"
import { getRoomById } from "@/actions/hotels&rooms/hotelActions"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import SignInRedirectMessage from "@/app/(auth)/en/sign-in/SignInRedirectMessage"
import RoomSummary from "./RoomSummary"

export default async function BookRoomPage({
  params,
}: {
  params: { roomId: string; hotelId: string }
}) {
  const { roomId, hotelId } = await params

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session || !session.user) {
    return (
      <SignInRedirectMessage
        callbackUrl={`/en/sign-in?callbackUrl=/hotels/${hotelId}/rooms/${roomId}/book`}
      />
    )
  }

  const room = await getRoomById(roomId)

  if (!room) {
    notFound()
  }

  const fullName = session.user.name || ""
  const [firstName, ...restName] = fullName.split(" ")
  const surname = restName.join(" ")

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
        <RoomSummary room={room} />

        {/* Booking Form */}
        <BookRoomForm
          roomId={room.id}
          pricePerNightAdult={Number(room.pricePerNightAdult)}
          pricePerNightChild={Number(room.pricePerNightChild)}
          userId={session.user.id}
          userDetails={{
            name: firstName,
            surname: surname,
            email: session.user.email || "",
            telephone: session.user.phoneNumber || "",
          }}
          capacity={room.capacity}
          currency={room.currency}
        />
      </div>
    </div>
  )
}
