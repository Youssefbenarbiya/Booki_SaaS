import { notFound } from "next/navigation"
import { hotel, room } from "@/db/schema"
import { eq } from "drizzle-orm"

import HotelHeader from "@/components/hotel-details/HotelHeader"
import HotelGallery from "@/components/hotel-details/HotelGallery"
import HotelInfo from "@/components/hotel-details/HotelInfo"

import db from "@/db/drizzle"
import RoomsList from "@/components/hotel-details/RoomsList"
import BookRoomAction from "@/components/hotel-details/BookRoomAction"

export default async function HotelPage({
  params,
}: {
  params: { hotelId: string }
}) {
  const hotelData = await db.query.hotel.findFirst({
    where: eq(hotel.id, params.hotelId),
  })

  if (!hotelData) {
    notFound()
  }

  const rooms = await db.query.room.findMany({
    where: eq(room.hotelId, params.hotelId),
  })

  return (
    <div className="container mx-auto px-4 py-6">
      <HotelHeader hotelName={hotelData.name} />

      <HotelGallery images={hotelData.images} hotelName={hotelData.name} />

      <HotelInfo
        hotel={{
          name: hotelData.name,
          rating: hotelData.rating || 5,
          address: hotelData.address || "",
          city: hotelData.city || "",
          country: hotelData.country || "",
          description: hotelData.description || "",
          amenities: hotelData.amenities,
        }}
      />

      <RoomsList
        rooms={rooms.map((room) => ({
          ...room,
          hotelId: params.hotelId,
        }))}
      />

      <BookRoomAction />
    </div>
  )
}
