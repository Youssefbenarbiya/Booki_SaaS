// app/agency/dashboard/hotels/[hotelId]/edit/page.tsx

import { getHotelById } from "@/actions/hotels&rooms/hotelActions"
import EditHotelForm from "./EditHotelForm"
import { notFound } from "next/navigation"
import { Locale } from "@/i18n/routing"

interface EditHotelPageProps {
  params: {
    hotelId: string
    locale: Locale
  }
}

export default async function EditHotelPage({ params }: EditHotelPageProps) {
  const { hotelId, locale } = params

  const hotel = await getHotelById(hotelId)

  if (!hotel) {
    notFound()
  }

  return <EditHotelForm hotel={hotel} locale={locale} />
}
