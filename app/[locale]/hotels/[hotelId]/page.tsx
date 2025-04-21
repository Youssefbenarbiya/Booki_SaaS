import { notFound } from "next/navigation"
import HotelHeader from "@/components/hotel-details/HotelHeader"
import HotelGallery from "@/components/hotel-details/HotelGallery"
import HotelInfo from "@/components/hotel-details/HotelInfo"
import db from "@/db/drizzle"
import RoomsList from "@/components/hotel-details/RoomsList"
import { getHotelById } from "@/actions/hotels&rooms/getHotelById"

export async function generateStaticParams() {
  const hotels = await db.query.hotel.findMany()

  return hotels.map((hotel) => ({
    hotelId: hotel.id.toString(),
  }))
}
export default async function HotelPage({
  params,
}: {
  params: { hotelId: string }
}) {
  const { hotelId } = await params 
  const hotelData = await getHotelById(hotelId)

  if (!hotelData) {
    notFound()
  }

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
          latitude: hotelData.latitude ?? undefined,
          longitude: hotelData.longitude ?? undefined,
        }}
      />

      <RoomsList
        rooms={hotelData.rooms.map((room) => ({
          ...room,
          hotelId,
        }))}
      />
    </div>
  )
}
