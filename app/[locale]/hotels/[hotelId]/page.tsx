import { notFound } from "next/navigation"
import HotelHeader from "@/components/hotel-details/HotelHeader"
import HotelGallery from "@/components/hotel-details/HotelGallery"
import db from "@/db/drizzle"
import RoomsList from "@/components/hotel-details/RoomsList"
import { getHotelById } from "@/actions/hotels&rooms/getHotelById"
import AgencyInfo from "@/components/common/AgencyInfo"
import { ContactButton } from "@/components/chat/ContactButton"
import ClientHotelInfo from "@/components/hotel-details/ClientHotelInfo"

export async function generateStaticParams() {
  const hotels = await db.query.hotel.findMany()

  return hotels.map((hotel) => ({
    hotelId: hotel.id.toString(),
  }))
}
export default async function HotelPage({
  params,
}: {
  params: Promise<{ hotelId: string; locale: string }>
}) {
  const { hotelId, locale } = await params
  const hotelData = await getHotelById(hotelId)

  if (!hotelData) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header with Contact Button in top right */}
      <div className="flex items-center justify-between mb-4">
        <HotelHeader hotelName={hotelData.name} />
        <div className="ml-4 mt-[100px]">
          <ContactButton
            postId={hotelId}
            postType="hotel"
            agencyName={hotelData.agency?.agencyName || "Hotel Agency"}
            agencyLogo={hotelData.agency?.logo || ""}
          />
        </div>
      </div>
      <div className="my-6">
        <AgencyInfo
          agencyName={hotelData.agency?.agencyName || "Hotel Agency"}
          agencyLogo={hotelData.agency?.logo || null}
          locale={locale}
          showContactButton={true}
        />
      </div>
      <HotelGallery images={hotelData.images} hotelName={hotelData.name} />

      <ClientHotelInfo
        hotel={{
          name: hotelData.name,
          rating: hotelData.rating || 5,
          address: hotelData.address || "",
          city: hotelData.city || "",
          country: hotelData.country || "",
          description: hotelData.description || "",
          amenities: hotelData.amenities,
          latitude: hotelData.latitude ? Number(hotelData.latitude) : undefined,
          longitude: hotelData.longitude ? Number(hotelData.longitude) : undefined,
        }}
      />

      <RoomsList
        rooms={hotelData.rooms.map((room) => ({
          ...room,
          hotelId,
          locale,
        }))}
      />
    </div>
  )
}
