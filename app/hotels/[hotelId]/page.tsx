import { getHotelById } from "@/actions/hotelActions"
import { notFound } from "next/navigation"
import HotelHeader from "@/components/hotel-details/HotelHeader"
import HotelGallery from "@/components/hotel-details/HotelGallery"
import HotelInfo from "@/components/hotel-details/HotelInfo"
import RoomsList from "@/components/hotel-details/RoomsList"

export default async function HotelDetailsPage({
  params,
}: {
  params: Promise<{ hotelId: string }>
}) {
  const { hotelId } = await params

  const hotel = await getHotelById(hotelId)
  if (!hotel) {
    notFound()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <HotelHeader />
      
      <div className="grid gap-8 lg:grid-cols-2">
        <HotelGallery images={hotel.images} hotelName={hotel.name} />
        <HotelInfo hotel={hotel} />
      </div>

      <RoomsList rooms={hotel.rooms.map(room => ({...room, pricePerNight: Number(room.pricePerNight)}))} />
    </div>
  )
}
