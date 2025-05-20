// app/agency/dashboard/hotels/[hotelId]/edit/page.tsx

import { getHotelById } from "@/actions/hotels&rooms/hotelActions"
import EditHotelForm from "./EditHotelForm"
import { notFound } from "next/navigation"
import { Locale } from "@/i18n/routing"

interface EditHotelPageProps {
  params: Promise<{
    hotelId: string
    locale: Locale
  }>
}

export default async function EditHotelPage({ params }: EditHotelPageProps) {
  const { hotelId, locale } = await params

  const hotel = await getHotelById(hotelId)

  if (!hotel) {
    notFound()
  }

  const formattedHotel = {
    ...hotel,
    rooms: hotel.rooms.map((room) => ({
      ...room,
      advancePaymentEnabled: room.advancePaymentEnabled || undefined,
      advancePaymentPercentage: room.advancePaymentPercentage || undefined,
    })),
  }

  return <EditHotelForm hotel={formattedHotel} locale={locale} />
}
